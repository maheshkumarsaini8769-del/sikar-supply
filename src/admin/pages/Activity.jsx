import { useState, useEffect } from 'react';
import api from '../api';

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/stats', { params: { period: 'all' } }).then(r => (r.data.stats?.recentActivity || []).map(a => ({ ...a, _source: 'analytics' }))),
      api.get('/orders', { params: { limit: 20 } }).then(r => (r.data.orders || []).map(o => ({
        type: 'order',
        data: { product: o.orderNumber, query: `${o.customerName} — ₹${o.total}` },
        createdAt: o.createdAt,
        _source: 'orders',
        _id: o._id,
      }))),
      api.get('/sales', { params: { limit: 20 } }).then(r => (r.data.sales || []).map(s => ({
        type: 'sale',
        data: { product: s.items?.[0]?.productName || 'N/A', query: `${s.customerName || 'Walk-in'} — ₹${s.finalAmount} (${s.saleType})` },
        createdAt: s.saleDate || s.createdAt,
        _source: 'sales',
        _id: s._id,
      }))),
      api.get('/stock/logs', { params: { limit: 20 } }).then(r => (r.data.logs || []).map(l => ({
        type: 'stock',
        data: { product: l.product?.name || 'Deleted', query: `${l.type === 'add' ? '+' : l.type === 'remove' ? '-' : '='}${l.quantity} — ${l.note || ''}` },
        createdAt: l.createdAt,
        _source: 'stock',
        _id: l._id,
      }))),
      api.get('/purchases', { params: { limit: 20 } }).then(r => (r.data.purchases || []).map(p => ({
        type: 'purchase',
        data: { product: p.supplier || 'Unknown', query: `${p.items?.[0]?.productName || ''} × ${p.items?.[0]?.quantity || 0} — ₹${p.totalAmount}` },
        createdAt: p.createdAt,
        _source: 'purchases',
        _id: p._id,
      }))),
      api.get('/orders/public', {}).then(() => []).catch(() => []),
    ]).then(results => {
      const all = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(all);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  const typeConfig = {
    order: { icon: '📦', color: '#f59e0b', label: 'Order' },
    sale: { icon: '💰', color: '#25d366', label: 'Sale' },
    stock: { icon: '📊', color: '#6366f1', label: 'Stock' },
    purchase: { icon: '📥', color: '#b8956a', label: 'Purchase' },
    click: { icon: '🖱️', color: '#888', label: 'Click' },
    search: { icon: '🔍', color: '#888', label: 'Search' },
    pageview: { icon: '👁️', color: '#888', label: 'View' },
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'order', label: '📦 Orders' },
    { key: 'sale', label: '💰 Sales' },
    { key: 'stock', label: '📊 Stock' },
    { key: 'purchase', label: '📥 Purchases' },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Recent Activity</h1>
      </div>

      <div className="adm-filters" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        {filters.map(f => (
          <button key={f.key} className={`adm-btn adm-btn-sm ${filter === f.key ? 'adm-btn-primary' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <button className="adm-btn adm-btn-sm" onClick={fetchAll} style={{ marginLeft: 'auto' }}>🔄 Refresh</button>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No activity found</div>
          )}
          {filtered.slice(0, 100).map((a, i) => {
            const cfg = typeConfig[a.type] || { icon: '📌', color: '#888', label: a.type };
            const time = new Date(a.createdAt);
            const now = new Date();
            const diffMs = now - time;
            const diffMin = Math.floor(diffMs / 60000);
            const diffHr = Math.floor(diffMs / 3600000);
            const diffDay = Math.floor(diffMs / 86400000);
            let timeAgo = '';
            if (diffMin < 1) timeAgo = 'Abhi';
            else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
            else if (diffHr < 24) timeAgo = `${diffHr}h ago`;
            else timeAgo = `${diffDay}d ago`;

            return (
              <div key={a._id || i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: `${cfg.color}15`,
                  border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16, flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {cfg.label}
                    </span>
                    {a.data?.product && (
                      <span style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.data.product}
                      </span>
                    )}
                  </div>
                  {a.data?.query && (
                    <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.data.query}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: '#888' }}>{timeAgo}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
