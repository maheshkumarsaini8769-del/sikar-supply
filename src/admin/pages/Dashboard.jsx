import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api';

const COLORS = ['#b8956a', '#25d366', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const [orderStats, setOrderStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/orders/stats'),
      api.get('/analytics/stats', { params: { period } }),
    ]).then(([orders, analyticsRes]) => {
      setOrderStats(orders.data.stats);
      setAnalytics(analyticsRes.data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [period]);

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/></div>;
  if (!orderStats) return <div className="adm-empty-state">Failed to load</div>;

  const statusData = [
    { name: 'Pending', value: orderStats.pending },
    { name: 'Confirmed', value: orderStats.confirmed },
    { name: 'Processing', value: orderStats.processing },
    { name: 'Completed', value: orderStats.completed },
    { name: 'Cancelled', value: orderStats.cancelled },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Dashboard</h1>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <a href="/" target="_blank" className="adm-btn adm-btn-sm" style={{textDecoration:'none',borderColor:'#25d366',color:'#25d366'}}>🌐 Visit Website</a>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="adm-filter-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Order Stats */}
      <div className="adm-stat-cards">
        {[
          { label: 'Total Orders', value: orderStats.totalOrders, color: '#b8956a' },
          { label: 'Pending', value: orderStats.pending, color: '#f59e0b' },
          { label: 'Completed', value: orderStats.completed, color: '#25d366' },
          { label: 'Cancelled', value: orderStats.cancelled, color: '#ef4444' },
          { label: 'Total Sales', value: `₹${orderStats.totalSales.toLocaleString()}`, color: '#6366f1' },
        ].map((card, i) => (
          <div key={i} className="adm-stat-card" style={{ borderTopColor: card.color }}>
            <span className="adm-stat-label">{card.label}</span>
            <span className="adm-stat-value">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Analytics Stats */}
      {analytics && (
        <div className="adm-stat-cards">
          {[
            { label: 'Total Clicks', value: analytics.clicks, color: '#25d366' },
            { label: 'Total Searches', value: analytics.searches, color: '#6366f1' },
            { label: 'Total Orders', value: analytics.orders, color: '#b8956a' },
            { label: 'Page Views', value: analytics.pageviews, color: '#f59e0b' },
          ].map((card, i) => (
            <div key={i} className="adm-stat-card" style={{ borderTopColor: card.color }}>
              <span className="adm-stat-label">{card.label}</span>
              <span className="adm-stat-value">{card.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="adm-dashboard-charts">
        {/* Clicks Trend */}
        <div className="adm-chart-card">
          <h3>Clicks Over Time</h3>
          {analytics?.clicksByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.clicksByDay}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#25d366" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="adm-empty-state" style={{padding:'40px'}}>No click data yet</div>}
        </div>

        {/* Search Trend */}
        <div className="adm-chart-card">
          <h3>Searches Over Time</h3>
          {analytics?.searchesByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.searchesByDay}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="adm-empty-state" style={{padding:'40px'}}>No search data yet</div>}
        </div>

        {/* Orders by Status */}
        <div className="adm-chart-card">
          <h3>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Searches */}
        <div className="adm-chart-card">
          <h3>Top Searches</h3>
          {analytics?.topSearches?.length > 0 ? (
            <div style={{maxHeight:250,overflowY:'auto'}}>
              {analytics.topSearches.map((s, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #2a2a2a',fontSize:'13px',color:'#e5e5e5'}}>
                  <span>{s._id || 'N/A'}</span>
                  <span style={{color:'#b8956a',fontWeight:600}}>{s.count}</span>
                </div>
              ))}
            </div>
          ) : <div className="adm-empty-state" style={{padding:'40px'}}>No searches yet</div>}
        </div>
      </div>

      {/* Recent Activity */}
      {analytics?.recentActivity?.length > 0 && (
        <div className="adm-recent-section">
          <h3>Recent Activity</h3>
          <div style={{maxHeight:300,overflowY:'auto'}}>
            {analytics.recentActivity.map((a, i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #2a2a2a',fontSize:'13px'}}>
                <span style={{color:'#e5e5e5'}}>
                  <span style={{color:'#b8956a',fontWeight:600}}>{a.type.toUpperCase()}</span>
                  {a.data?.product && ` — ${a.data.product}`}
                  {a.data?.query && ` — "${a.data.query}"`}
                </span>
                <span style={{color:'#888',fontSize:'11px'}}>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="adm-recent-section" style={{marginTop:16}}>
        <h3>Recent Orders</h3>
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orderStats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td><span className={`adm-status-badge adm-status-${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orderStats.recentOrders.length === 0 && <tr><td colSpan="5" className="adm-empty-row">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
