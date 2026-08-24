import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api';

const COLORS = ['#b8956a', '#25d366', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/stats').then(res => {
      setStats(res.data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!stats) return <div className="empty-state">Failed to load dashboard data</div>;

  const statusData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Confirmed', value: stats.confirmed },
    { name: 'Processing', value: stats.processing },
    { name: 'Completed', value: stats.completed },
    { name: 'Cancelled', value: stats.cancelled },
  ];

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, color: '#b8956a' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Completed', value: stats.completed, color: '#25d366' },
    { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, color: '#6366f1' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-cards">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: card.color }}>
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
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
        <div className="chart-card">
          <h3>Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyOrders}>
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#b8956a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Orders</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan="5" className="empty-row">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
