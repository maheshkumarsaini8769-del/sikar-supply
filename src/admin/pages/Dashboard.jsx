import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#b8956a', '#25d366', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const { user } = useAuth();
  const [orderStats, setOrderStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stockStats, setStockStats] = useState(null);
  const [saleStats, setSaleStats] = useState(null);
  const [purchaseStats, setPurchaseStats] = useState(null);
  const [plReport, setPlReport] = useState(null);
  const [period, setPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    const p = { params: { period } };
    Promise.allSettled([
      api.get('/orders/stats', p),
      api.get('/analytics/stats', p),
      api.get('/stock/stats'),
      api.get('/sales/stats', p),
      api.get('/purchases/stats', p),
      api.get('/profitloss', p),
    ]).then(([orders, analyticsRes, stockRes, salesRes, purchaseRes, plRes]) => {
      if (orders.status === 'fulfilled') setOrderStats(orders.value.data?.stats || null);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data?.stats || null);
      if (stockRes.status === 'fulfilled') setStockStats(stockRes.value.data?.stats || null);
      if (salesRes.status === 'fulfilled') setSaleStats(salesRes.value.data?.stats || null);
      if (purchaseRes.status === 'fulfilled') setPurchaseStats(purchaseRes.value.data?.stats || null);
      if (plRes.status === 'fulfilled') setPlReport(plRes.value.data?.report || null);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [period]);

  if (loading) {
    return (
      <div className="adm-loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="adm-spinner" />
      </div>
    );
  }

  // Calculated values
  const totalRev = saleStats?.totalRevenue || orderStats?.totalSales || plReport?.summary?.totalRevenue || 0;
  const grossProfit = plReport?.summary?.grossProfit ?? 0;
  const profitMargin = plReport?.summary?.profitMargin ?? 0;
  const totalOrders = orderStats?.totalOrders || 0;
  const pendingOrders = orderStats?.pending || 0;
  const completedOrders = orderStats?.completed || 0;
  const lowStockCount = stockStats?.lowStock || 0;
  const outOfStockCount = stockStats?.outOfStock || 0;

  const statusData = [
    { name: 'Pending', value: orderStats?.pending || 0 },
    { name: 'Confirmed', value: orderStats?.confirmed || 0 },
    { name: 'Processing', value: orderStats?.processing || 0 },
    { name: 'Completed', value: orderStats?.completed || 0 },
    { name: 'Cancelled', value: orderStats?.cancelled || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="dashboard-container" style={{ paddingBottom: '40px' }}>
      {/* 1. Header with Controls */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Dashboard Overview</span>
            <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#888' }}>
              Welcome back, <strong style={{ color: '#b8956a' }}>{user?.name || 'Admin'}</strong> 👋
            </span>
          </h1>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Real-time business performance, inventory health & store analytics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAll}
            className="adm-btn adm-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            title="Refresh Data"
          >
            🔄 Refresh
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-sm"
            style={{ textDecoration: 'none', borderColor: '#25d366', color: '#25d366' }}
          >
            🌐 Visit Website
          </a>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="adm-filter-select"
            style={{ minWidth: '130px', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="all">📅 All Time</option>
            <option value="today">📅 Today</option>
            <option value="week">📅 This Week</option>
            <option value="month">📅 This Month</option>
          </select>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div className="adm-quick-actions">
        <Link to="/admin/all-sales" className="adm-quick-btn primary">
          <span>+</span> New Sale
        </Link>
        <Link to="/admin/products" className="adm-quick-btn">
          <span>🏷️</span> Add Product
        </Link>
        <Link to="/admin/stock" className="adm-quick-btn">
          <span>📦</span> Inventory Update
        </Link>
        <Link to="/admin/purchases" className="adm-quick-btn">
          <span>📥</span> Add Purchase
        </Link>
        <Link to="/admin/coupons" className="adm-quick-btn">
          <span>🎟️</span> Create Coupon
        </Link>
        <Link to="/admin/orders" className="adm-quick-btn">
          <span>📋</span> View Orders {pendingOrders > 0 && <span style={{ background: '#f59e0b', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold' }}>{pendingOrders}</span>}
        </Link>
      </div>

      {/* 3. Primary Hero KPI Cards (4 Grid) */}
      <div className="adm-kpi-grid">
        {/* KPI 1: Revenue */}
        <div className="adm-kpi-card" style={{ borderTop: '3px solid #25d366' }}>
          <div className="adm-kpi-header">
            <span className="adm-kpi-title">Total Revenue</span>
            <div className="adm-kpi-icon-badge" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25d366' }}>
              💰
            </div>
          </div>
          <div className="adm-kpi-value" style={{ color: '#25d366' }}>
            ₹{totalRev.toLocaleString('en-IN')}
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-kpi-pill" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
              {saleStats?.totalSales || orderStats?.totalOrders || 0} Transactions
            </span>
            {saleStats?.avgSale > 0 && <span>Avg: ₹{Math.round(saleStats.avgSale).toLocaleString('en-IN')}</span>}
          </div>
        </div>

        {/* KPI 2: Profit */}
        <div className="adm-kpi-card" style={{ borderTop: '3px solid #b8956a' }}>
          <div className="adm-kpi-header">
            <span className="adm-kpi-title">Gross Profit</span>
            <div className="adm-kpi-icon-badge" style={{ background: 'rgba(184, 149, 106, 0.1)', color: '#b8956a' }}>
              📈
            </div>
          </div>
          <div className="adm-kpi-value" style={{ color: grossProfit >= 0 ? '#b8956a' : '#ef4444' }}>
            ₹{grossProfit.toLocaleString('en-IN')}
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-kpi-pill" style={{ background: profitMargin >= 20 ? 'rgba(37, 211, 102, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: profitMargin >= 20 ? '#25d366' : '#f59e0b' }}>
              {profitMargin}% Margin
            </span>
            <span>Cost: ₹{(plReport?.summary?.totalCost || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* KPI 3: Orders Pipeline */}
        <div className="adm-kpi-card" style={{ borderTop: '3px solid #6366f1' }}>
          <div className="adm-kpi-header">
            <span className="adm-kpi-title">Orders Overview</span>
            <div className="adm-kpi-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              📦
            </div>
          </div>
          <div className="adm-kpi-value">
            {totalOrders}
          </div>
          <div className="adm-kpi-footer">
            <span className="adm-kpi-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              🟡 {pendingOrders} Pending
            </span>
            <span className="adm-kpi-pill" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
              🟢 {completedOrders} Done
            </span>
          </div>
        </div>

        {/* KPI 4: Inventory Health */}
        <div className="adm-kpi-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="adm-kpi-header">
            <span className="adm-kpi-title">Inventory Health</span>
            <div className="adm-kpi-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              🏬
            </div>
          </div>
          <div className="adm-kpi-value">
            {stockStats?.totalProducts || 0} <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>Items</span>
          </div>
          <div className="adm-kpi-footer">
            {lowStockCount > 0 || outOfStockCount > 0 ? (
              <span className="adm-kpi-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                ⚠️ {lowStockCount} Low / {outOfStockCount} Out
              </span>
            ) : (
              <span className="adm-kpi-pill" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
                🟢 All Healthy
              </span>
            )}
            <span>Val: ₹{(stockStats?.stockValue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 4. Structured Tabs */}
      <div className="adm-dashboard-tabs">
        <button
          className={`adm-dashboard-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📊 All Overview
        </button>
        <button
          className={`adm-dashboard-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          💰 Sales & Finance
        </button>
        <button
          className={`adm-dashboard-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory & Orders
        </button>
        <button
          className={`adm-dashboard-tab ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          🌐 Website Analytics
        </button>
      </div>

      {/* 5. Tab Views */}

      {/* TAB: ALL OVERVIEW OR SALES TAB */}
      {(activeTab === 'all' || activeTab === 'sales') && (
        <>
          {/* Main Visual Charts Row */}
          <div className="adm-dashboard-charts">
            {/* Orders & Revenue Activity Chart */}
            <div className="adm-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Monthly Orders & Sales</h3>
                <span style={{ fontSize: '11px', color: '#888' }}>Performance</span>
              </div>
              {orderStats?.monthlyOrders?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={orderStats.monthlyOrders}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip
                      contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                      formatter={(val, name) => [name === 'sales' ? `₹${Number(val).toLocaleString('en-IN')}` : val, name === 'sales' ? 'Sales Revenue' : 'Order Count']}
                    />
                    <Bar dataKey="sales" fill="#b8956a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : analytics?.clicksByDay?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.clicksByDay}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                    <Line type="monotone" dataKey="count" stroke="#25d366" strokeWidth={2} name="Clicks" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty-state" style={{ padding: '60px 20px' }}>No order trend data available</div>
              )}
            </div>

            {/* Orders by Status Donut */}
            <div className="adm-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Order Status Breakdown</h3>
                <Link to="/admin/orders" style={{ fontSize: '11px', color: '#b8956a', textDecoration: 'none' }}>View All →</Link>
              </div>
              {statusData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', height: 250 }}>
                  <div style={{ flex: 1, height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: '130px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '10px' }}>
                    {statusData.map((st, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          {st.name}
                        </span>
                        <strong style={{ color: '#fff' }}>{st.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="adm-empty-state" style={{ padding: '60px 20px' }}>No orders found yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* DUAL GRID: Financial Summary & Inventory Stats */}
      {(activeTab === 'all' || activeTab === 'sales' || activeTab === 'inventory') && (
        <div className="adm-dual-grid">
          {/* Box 1: Financial Performance */}
          <div className="adm-dashboard-section" style={{ margin: 0 }}>
            <div className="adm-section-header">
              <div>
                <span className="adm-section-title">💰 Financial & Sales Summary</span>
                <span className="adm-section-desc">Cash flow, collections & profit margins</span>
              </div>
              <Link to="/admin/profit-loss" className="adm-btn adm-btn-sm" style={{ textDecoration: 'none' }}>
                Full P&L →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Total Sales Rev</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#25d366', display: 'block', marginTop: '4px' }}>
                  ₹{(saleStats?.totalRevenue || totalRev).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>{saleStats?.totalSales || 0} invoices</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Purchases / Cost</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                  ₹{(purchaseStats?.totalAmount || plReport?.summary?.totalCost || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>{purchaseStats?.totalPurchases || 0} POs</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Gross Profit</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#b8956a', display: 'block', marginTop: '4px' }}>
                  ₹{grossProfit.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', color: '#25d366' }}>{profitMargin}% margin</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Supplier Dues</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: (purchaseStats?.pendingAmount || 0) > 0 ? '#ff6b6b' : '#25d366', display: 'block', marginTop: '4px' }}>
                  ₹{(purchaseStats?.pendingAmount || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>Pending to pay</span>
              </div>
            </div>
          </div>

          {/* Box 2: Inventory Breakdown */}
          <div className="adm-dashboard-section" style={{ margin: 0 }}>
            <div className="adm-section-header">
              <div>
                <span className="adm-section-title">📦 Stock & Catalog Status</span>
                <span className="adm-section-desc">Warehouse units and stock risk alerts</span>
              </div>
              <Link to="/admin/stock" className="adm-btn adm-btn-sm" style={{ textDecoration: 'none' }}>
                Stock Manager →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>In Stock</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#25d366', display: 'block', marginTop: '4px' }}>
                  {stockStats?.inStock || 0}
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>Ready to deliver</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Low Stock</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', display: 'block', marginTop: '4px' }}>
                  {stockStats?.lowStock || 0}
                </span>
                <span style={{ fontSize: '10px', color: '#f59e0b' }}>Needs reordering</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Out of Stock</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                  {stockStats?.outOfStock || 0}
                </span>
                <span style={{ fontSize: '10px', color: '#ef4444' }}>Zero inventory</span>
              </div>

              <div style={{ background: '#1c1c1c', padding: '14px', borderRadius: '8px', border: '1px solid #282828' }}>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Stock Valuation</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#6366f1', display: 'block', marginTop: '4px' }}>
                  ₹{(stockStats?.stockValue || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', color: '#666' }}>Total assets cost</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUAL GRID: Recent Orders Table & Top Searches */}
      {(activeTab === 'all' || activeTab === 'sales' || activeTab === 'inventory') && (
        <div className="adm-dual-grid">
          {/* Recent Orders List */}
          <div className="adm-dashboard-section" style={{ margin: 0 }}>
            <div className="adm-section-header">
              <div>
                <span className="adm-section-title">📋 Recent Orders</span>
                <span className="adm-section-desc">Latest incoming customer website requests</span>
              </div>
              <Link to="/admin/orders" className="adm-btn adm-btn-sm" style={{ textDecoration: 'none' }}>
                View All Orders ({totalOrders})
              </Link>
            </div>

            <div className="adm-table-wrapper">
              <table className="adm-data-table">
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
                  {orderStats?.recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td className="adm-td-bold" style={{ color: '#b8956a' }}>{order.orderNumber}</td>
                      <td>{order.customerName || 'Customer'}</td>
                      <td>₹{order.total.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`adm-status-badge adm-status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: '#888', fontSize: '11px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                  {(!orderStats?.recentOrders || orderStats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan="5" className="adm-empty-row">No orders received yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Searches / Product Interests */}
          <div className="adm-dashboard-section" style={{ margin: 0 }}>
            <div className="adm-section-header">
              <div>
                <span className="adm-section-title">🔍 Search Queries & Traffic</span>
                <span className="adm-section-desc">What customer visitors are looking for most</span>
              </div>
              <span className="adm-kpi-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                {analytics?.pageviews || 0} Total Pageviews
              </span>
            </div>

            {analytics?.topSearches?.length > 0 ? (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {analytics.topSearches.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 4px',
                      borderBottom: '1px solid #242424',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: i === 0 ? '#b8956a' : i === 1 ? '#6366f1' : '#333',
                          color: i < 2 ? '#000' : '#888',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: '#e5e5e5' }}>{s._id || 'Keyword'}</span>
                    </div>
                    <span style={{ color: '#b8956a', fontWeight: 'bold', background: 'rgba(184, 149, 106, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                      {s.count} searches
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-empty-state" style={{ padding: '60px 20px' }}>
                No search records yet. User searches will appear here automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: TRAFFIC & ANALYTICS ONLY */}
      {(activeTab === 'all' || activeTab === 'traffic') && (
        <div className="adm-dashboard-section">
          <div className="adm-section-header">
            <div>
              <span className="adm-section-title">📈 Website Traffic & User Engagement Trends</span>
              <span className="adm-section-desc">Customer clicks, catalogue searches, and visit flow</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="adm-kpi-pill" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
                {analytics?.clicks || 0} Clicks
              </span>
              <span className="adm-kpi-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                {analytics?.searches || 0} Searches
              </span>
            </div>
          </div>

          <div className="adm-dashboard-charts" style={{ marginBottom: 0 }}>
            {/* Clicks Chart */}
            <div className="adm-chart-card" style={{ background: '#1c1c1c', border: '1px solid #282828' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '13px' }}>Visitor Clicks Over Time</h3>
              {analytics?.clicksByDay?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.clicksByDay}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                    <Line type="monotone" dataKey="count" stroke="#25d366" strokeWidth={2} name="Clicks" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty-state" style={{ padding: '40px' }}>No click data yet</div>
              )}
            </div>

            {/* Searches Chart */}
            <div className="adm-chart-card" style={{ background: '#1c1c1c', border: '1px solid #282828' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '13px' }}>Searches Over Time</h3>
              {analytics?.searchesByDay?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.searchesByDay}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Searches" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty-state" style={{ padding: '40px' }}>No search data yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
