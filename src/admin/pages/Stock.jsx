import { useState, useEffect } from 'react';
import api from '../api';

export default function Stock() {
  const [tab, setTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lowFilter, setLowFilter] = useState(false);

  // Add Stock form
  const [addForm, setAddForm] = useState({ productId: '', quantity: '', note: '' });
  const [addMode, setAddMode] = useState('add');

  const fetchInventory = () => {
    setLoading(true);
    api.get('/stock/inventory', { params: { search, status: statusFilter, low: lowFilter } })
      .then(r => setProducts(r.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchLogs = () => {
    api.get('/stock/logs', { params: { limit: 50 } })
      .then(r => setLogs(r.data.logs))
      .catch(console.error);
  };

  const fetchStats = () => {
    api.get('/stock/stats')
      .then(r => setStats(r.data.stats))
      .catch(console.error);
  };

  useEffect(() => {
    if (tab === 'inventory') fetchInventory();
    else if (tab === 'logs') fetchLogs();
    else if (tab === 'stats') fetchStats();
  }, [tab, search, statusFilter, lowFilter]);

  const handleStockAction = async (e) => {
    e.preventDefault();
    if (!addForm.productId || !addForm.quantity) return;
    try {
      const endpoint = addMode === 'add' ? '/stock/add' : addMode === 'remove' ? '/stock/remove' : '/stock/adjust';
      await api.post(endpoint, {
        productId: addForm.productId,
        quantity: Number(addForm.quantity),
        note: addForm.note,
      });
      setAddForm({ productId: '', quantity: '', note: '' });
      fetchInventory();
      fetchStats();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const quickAdd = async (productId, qty) => {
    try {
      await api.post('/stock/add', { productId, quantity: qty, note: `Quick add ${qty}` });
      fetchInventory();
    } catch { alert('Failed'); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Inventory Management</h1>
      </div>

      <div className="adm-filters" style={{ marginBottom: 16 }}>
        {['inventory', 'add', 'logs', 'alerts', 'stats'].map(t => (
          <button key={t} className={`adm-btn adm-btn-sm ${tab === t ? 'adm-btn-primary' : ''}`} onClick={() => setTab(t)}>
            {t === 'inventory' ? 'Inventory' : t === 'add' ? 'Add/Remove Stock' : t === 'logs' ? 'Stock Log' : t === 'alerts' ? 'Low Stock Alerts' : 'Stats'}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <>
          <div className="adm-filters">
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="adm-filter-input" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="adm-filter-select">
              <option value="">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#ccc'}}>
              <input type="checkbox" checked={lowFilter} onChange={e => setLowFilter(e.target.checked)} /> Low Stock Only
            </label>
          </div>
          {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
            <div className="adm-table-wrapper">
              <table className="adm-data-table">
                <thead>
                  <tr><th>Product</th><th>SKU</th><th>Category</th><th>Purchase ₹</th><th>Sell ₹</th><th>Profit ₹</th><th>Qty</th><th>Unit</th><th>Status</th><th>Quick Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const isLow = p.stockQuantity <= (p.lowStockThreshold || 10);
                    const profit = (p.price && p.costPrice) ? p.price - p.costPrice : 0;
                    const margin = (p.costPrice > 0) ? Math.round(((p.price - p.costPrice) / p.costPrice) * 100) : 0;
                    return (
                      <tr key={p._id} style={isLow ? { background: 'rgba(255,107,107,0.05)' } : {}}>
                        <td className="adm-td-bold">{p.name}</td>
                        <td>{p.sku || '-'}</td>
                        <td>{p.category?.name || '-'}</td>
                        <td style={{ color: '#ff8a80' }}>{p.costPrice ? `₹${p.costPrice}` : '-'}</td>
                        <td style={{ color: '#b8956a', fontWeight: 700 }}>{p.price ? `₹${p.price}` : '-'}</td>
                        <td style={{ color: profit > 0 ? '#51cf66' : '#ff6b6b', fontWeight: 700 }}>
                          {profit > 0 ? `₹${profit}` : '-'}
                          {margin > 0 && <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>({margin}%)</span>}
                        </td>
                        <td style={{ fontWeight: 700, color: isLow ? '#ff6b6b' : '#51cf66' }}>{p.stockQuantity}</td>
                        <td>{p.unit || 'sqft'}</td>
                        <td><span className={`adm-stock-badge adm-stock-${p.stockStatus}`}>{p.stockStatus.replace(/_/g, ' ')}</span></td>
                        <td>
                          <div className="adm-actions-cell">
                            <button className="adm-btn adm-btn-sm" onClick={() => { setAddForm({ ...addForm, productId: p._id }); setAddMode('add'); setTab('add'); }}>+ Add</button>
                            <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => { setAddForm({ ...addForm, productId: p._id }); setAddMode('remove'); setTab('add'); }}>- Remove</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && <tr><td colSpan="10" className="adm-empty-row">No products found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'add' && (
        <div className="adm-card" style={{ maxWidth: 500 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, color: '#b8956a' }}>Add / Remove Stock</h3>
          <form onSubmit={handleStockAction}>
            <div className="adm-form-group">
              <label>Action</label>
              <select value={addMode} onChange={e => setAddMode(e.target.value)}>
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="adjust">Set Exact Quantity</option>
              </select>
            </div>
            <div className="adm-form-group">
              <label>Product *</label>
              <select value={addForm.productId} onChange={e => setAddForm({...addForm, productId: e.target.value})} required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.stockQuantity} {p.unit})</option>)}
              </select>
            </div>
            <div className="adm-form-group">
              <label>{addMode === 'adjust' ? 'New Quantity' : 'Quantity'} *</label>
              <input type="number" min="0" value={addForm.quantity} onChange={e => setAddForm({...addForm, quantity: e.target.value})} required />
            </div>
            <div className="adm-form-group">
              <label>Note</label>
              <input type="text" placeholder="e.g. New delivery, Damaged goods" value={addForm.note} onChange={e => setAddForm({...addForm, note: e.target.value})} />
            </div>
            <button type="submit" className="adm-btn adm-btn-primary">
              {addMode === 'add' ? 'Add Stock' : addMode === 'remove' ? 'Remove Stock' : 'Set Quantity'}
            </button>
          </form>
        </div>
      )}

      {tab === 'logs' && (
        <>
          <div className="adm-filters">
            <button className="adm-btn adm-btn-sm" onClick={fetchLogs}>Refresh</button>
          </div>
          <div className="adm-table-wrapper">
            <table className="adm-data-table">
              <thead>
                <tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>Note</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td>{new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="adm-td-bold">{l.product?.name || 'Deleted'}</td>
                    <td><span className={`adm-stock-badge ${l.type === 'add' ? 'adm-stock-in_stock' : l.type === 'remove' ? 'adm-stock-out_of_stock' : 'adm-stock-low_stock'}`}>{l.type}</span></td>
                    <td style={{ fontWeight: 600, color: l.type === 'add' ? '#51cf66' : '#ff6b6b' }}>{l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ''}{l.quantity}</td>
                    <td>{l.previousStock}</td>
                    <td style={{ fontWeight: 600 }}>{l.newStock}</td>
                    <td style={{ color: '#888' }}>{l.note}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan="7" className="adm-empty-row">No stock logs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'alerts' && (
        <LowStockAlerts />
      )}

      {tab === 'stats' && <StockStats />}
    </div>
  );
}

function LowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stock/alerts')
      .then(r => setAlerts(r.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/></div>;
  if (alerts.length === 0) return <div className="adm-card" style={{ textAlign: 'center', padding: 40, color: '#51cf66', fontSize: 16 }}>All products are well stocked!</div>;

  return (
    <div>
      {alerts.map(p => (
        <div key={p._id} className="adm-card" style={{ borderLeft: '4px solid #ff6b6b', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
              Stock: <span style={{ color: '#ff6b6b', fontWeight: 700 }}>{p.stockQuantity} {p.unit}</span>
              {' '}&middot; Threshold: {p.lowStockThreshold || 10}
              {' '}&middot; {p.category?.name}
            </div>
          </div>
          <span className="adm-stock-badge adm-stock-out_of_stock">{p.stockStatus.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}

function StockStats() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    Promise.all([
      api.get('/stock/stats').then(r => setStats(r.data.stats)),
      api.get('/stock/inventory').then(r => setProducts(r.data.products)),
    ]).catch(console.error);
  }, []);

  if (!stats) return <div className="adm-loading"><div className="adm-spinner"/></div>;

  const totalCost = products.reduce((sum, p) => sum + (p.costPrice || 0) * (p.stockQuantity || 0), 0);
  const totalSelling = products.reduce((sum, p) => sum + (p.price || 0) * (p.stockQuantity || 0), 0);
  const totalProfit = totalSelling - totalCost;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, color: '#b8956a' },
    { label: 'In Stock', value: stats.inStock, color: '#51cf66' },
    { label: 'Low Stock', value: stats.lowStock, color: '#ffa500' },
    { label: 'Out of Stock', value: stats.outOfStock, color: '#ff6b6b' },
    { label: 'Stock Cost Value', value: `₹${totalCost.toLocaleString('en-IN')}`, color: '#ff8a80' },
    { label: 'Stock Sell Value', value: `₹${totalSelling.toLocaleString('en-IN')}`, color: '#b8956a' },
    { label: 'Potential Profit', value: `₹${totalProfit.toLocaleString('en-IN')}`, color: totalProfit > 0 ? '#51cf66' : '#ff6b6b' },
  ];

  return (
    <div className="adm-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {cards.map((c, i) => (
        <div key={i} className="adm-stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
          <div className="adm-stat-value" style={{ color: c.color }}>{c.value}</div>
          <div className="adm-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
