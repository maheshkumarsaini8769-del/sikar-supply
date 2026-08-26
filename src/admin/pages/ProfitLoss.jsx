import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#25d366', '#b8956a', '#6366f1', '#f59e0b', '#ef4444', '#ec4899'];

export default function ProfitLoss() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [customDate, setCustomDate] = useState({ from: '', to: '' });

  const fetchReport = () => {
    setLoading(true);
    const params = period === 'custom' ? { from: customDate.from, to: customDate.to } : { period };
    api.get('/profitloss', { params })
      .then(r => setReport(r.data.report))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [period, customDate]);

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/></div>;
  if (!report) return <div className="adm-empty-state">Failed to load report</div>;

  const { summary, productProfit, dailyTrend, lowMargin, highProfit } = report;

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Profit & Loss Report</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="adm-filter-select">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Date</option>
          </select>
          {period === 'custom' && (
            <>
              <input type="date" value={customDate.from} onChange={e => setCustomDate({...customDate, from: e.target.value})} className="adm-filter-input" style={{ width: 140 }} />
              <span style={{ color: '#888' }}>to</span>
              <input type="date" value={customDate.to} onChange={e => setCustomDate({...customDate, to: e.target.value})} className="adm-filter-input" style={{ width: 140 }} />
            </>
          )}
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <SummaryCard label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString('en-IN')}`} color="#25d366" icon="💰" />
        <SummaryCard label="Total Cost" value={`₹${summary.totalCost.toLocaleString('en-IN')}`} color="#ef4444" icon="📦" />
        <SummaryCard label="Gross Profit" value={`₹${summary.grossProfit.toLocaleString('en-IN')}`} color={summary.grossProfit >= 0 ? '#25d366' : '#ef4444'} icon="📈" />
        <SummaryCard label="Profit Margin" value={`${summary.profitMargin}%`} color={summary.profitMargin >= 20 ? '#25d366' : summary.profitMargin >= 10 ? '#f59e0b' : '#ef4444'} icon="📊" />
        <SummaryCard label="Total Purchases" value={`₹${summary.totalPurchases.toLocaleString('en-IN')}`} color="#6366f1" icon="📥" />
        <SummaryCard label="Net Profit" value={`₹${summary.netProfit.toLocaleString('en-IN')}`} color={summary.netProfit >= 0 ? '#25d366' : '#ef4444'} icon="💎" />
        <SummaryCard label="Discounts Given" value={`₹${summary.totalDiscount.toLocaleString('en-IN')}`} color="#f59e0b" icon="🏷️" />
        <SummaryCard label="Pending Purchases" value={`₹${summary.pendingPurchases.toLocaleString('en-IN')}`} color={summary.pendingPurchases > 0 ? '#ff6b6b' : '#25d366'} icon="⏳" />
      </div>

      {/* ===== PROFIT FORMULA ===== */}
      <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 14, padding: '18px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 8, fontWeight: 600 }}>PROFIT CALCULATION</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 15 }}>
          <span>Revenue: <b style={{ color: '#25d366' }}>₹{summary.totalRevenue.toLocaleString('en-IN')}</b></span>
          <span style={{ color: '#666' }}>-</span>
          <span>Cost: <b style={{ color: '#ef4444' }}>₹{summary.totalCost.toLocaleString('en-IN')}</b></span>
          <span style={{ color: '#666' }}>=</span>
          <span style={{ fontSize: 18 }}>Profit: <b style={{ color: summary.grossProfit >= 0 ? '#25d366' : '#ef4444' }}>₹{summary.grossProfit.toLocaleString('en-IN')}</b></span>
          <span style={{ color: '#888' }}>({summary.profitMargin}% margin)</span>
        </div>
      </div>

      {/* ===== DAILY PROFIT CHART ===== */}
      {dailyTrend.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#b8956a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Profit Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyTrend}>
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 13 }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
              />
              <Bar dataKey="revenue" fill="#25d366" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#ef4444" name="Cost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#b8956a" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ===== PRODUCT-WISE PROFIT ===== */}
      {productProfit.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#b8956a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product-wise Profit</h3>
          <div className="adm-table-wrapper">
            <table className="adm-data-table">
              <thead>
                <tr><th>Product</th><th>Qty Sold</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin %</th></tr>
              </thead>
              <tbody>
                {productProfit.map((p, i) => (
                  <tr key={i}>
                    <td className="adm-td-bold">{p._id || 'Custom'}</td>
                    <td>{p.qtySold}</td>
                    <td style={{ color: '#25d366' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#ef4444' }}>₹{p.cost.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: p.profit >= 0 ? '#25d366' : '#ef4444', fontSize: 15 }}>
                      {p.profit >= 0 ? '+' : ''}₹{p.profit.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: p.margin >= 20 ? 'rgba(37,211,102,0.15)' : p.margin >= 10 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        color: p.margin >= 20 ? '#25d366' : p.margin >= 10 ? '#f59e0b' : '#ef4444',
                      }}>
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== LOW MARGIN ALERTS ===== */}
      {lowMargin.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#ef4444', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Low Margin Products (below 10%)</h3>
          {lowMargin.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(239,68,68,0.1)', fontSize: 14 }}>
              <span style={{ color: '#fff' }}>{p._id}</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>{p.margin.toFixed(1)}% — ₹{p.profit.toLocaleString('en-IN')} profit</span>
            </div>
          ))}
        </div>
      )}

      {/* ===== HIGH PROFIT PRODUCTS ===== */}
      {highProfit.length > 0 && (
        <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#25d366', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏆 Top Profit Products</h3>
          {highProfit.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(37,211,102,0.1)', fontSize: 14 }}>
              <span style={{ color: '#fff' }}>{p._id} <span style={{ color: '#888' }}>({p.qtySold} sold)</span></span>
              <span style={{ color: '#25d366', fontWeight: 700 }}>+₹{p.profit.toLocaleString('en-IN')} ({p.margin.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#111', border: '1px solid #222', borderRadius: 14, padding: '16px 18px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}
