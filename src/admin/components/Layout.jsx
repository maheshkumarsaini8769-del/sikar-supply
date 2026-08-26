import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Logo from '../../components/Logo';

const nav = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/products', label: 'Products', icon: '🏷️' },
  { path: '/admin/stock', label: 'Inventory', icon: '📦' },
  { path: '/admin/cash-sales', label: 'Cash Sales', icon: '💵' },
  { path: '/admin/online-sales', label: 'Online Sales', icon: '🌐' },
  { path: '/admin/all-sales', label: 'All Sales', icon: '📋' },
  { path: '/admin/purchases', label: 'Purchases', icon: '📥' },
  { path: '/admin/customers', label: 'Customers', icon: '👤' },
  { path: '/admin/profit-loss', label: 'Profit & Loss', icon: '📈' },
  { path: '/admin/activity', label: 'Recent Activity', icon: '🕐' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/hero-slides', label: 'Hero Slides', icon: '🖼️' },
  { path: '/admin/gallery', label: 'Gallery', icon: '🎨' },
  { path: '/admin/media', label: 'Media', icon: '📁' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], customers: [], orders: [] });
  const [searching, setSearching] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length < 2) { setSearchResults({ products: [], customers: [], orders: [] }); return; }
      setSearching(true);
      const q = searchQuery.trim();
      Promise.all([
        api.get('/products', { params: { search: q } }).catch(() => ({ data: { products: [] } })),
        api.get('/customers', { params: { search: q } }).catch(() => ({ data: { customers: [] } })),
        api.get('/orders', { params: { search: q, limit: 20 } }).catch(() => ({ data: { orders: [] } })),
      ]).then(([pRes, cRes, oRes]) => {
        setSearchResults({
          products: pRes.data.products || [],
          customers: cRes.data.customers || [],
          orders: oRes.data.orders || [],
        });
        setSearching(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const hasResults = searchResults.products.length || searchResults.customers.length || searchResults.orders.length;

  const goTo = (path) => { setSearchOpen(false); setSearchQuery(''); navigate(path); };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/admin'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="sidebar-link-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span/><span/><span/>
          </button>
          <div className="topbar-right">
            <button onClick={() => setSearchOpen(true)} className="adm-btn adm-btn-sm" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search...
            </button>
            <a href="/" target="_blank" className="adm-btn adm-btn-sm" style={{ textDecoration: 'none', borderColor: '#25d366', color: '#25d366' }}>
              🌐 Visit Website
            </a>
            <span className="admin-name">{user?.name}</span>
            <button onClick={handleLogout} className="topbar-logout">Logout</button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="adm-modal-overlay" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ zIndex: 9999 }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550, top: '10vh' }}>
            <div className="adm-modal-header" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text" placeholder="Search products, customers, orders..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  autoFocus style={{ flex: 1, background: 'transparent', border: 'none', color: '#e5e5e5', fontSize: 15, outline: 'none' }}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                />
              </div>
              <button className="adm-modal-close" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>&times;</button>
            </div>
            <div className="adm-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: searchQuery.length < 2 ? 20 : '8px 0' }}>
              {searchQuery.length < 2 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: 30, fontSize: 13 }}>
                  Type at least 2 characters to search...
                </div>
              ) : searching ? (
                <div style={{ textAlign: 'center', padding: 30 }}><div className="adm-spinner" /></div>
              ) : !hasResults ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                  <div style={{ color: '#888', fontSize: 14 }}>No results found for "<span style={{ color: '#e5e5e5' }}>{searchQuery}</span>"</div>
                </div>
              ) : (
                <>
                  {searchResults.products.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#b8956a', textTransform: 'uppercase', padding: '6px 14px', letterSpacing: 1 }}>Products ({searchResults.products.length})</div>
                      {searchResults.products.map(p => (
                        <div key={p._id} onClick={() => goTo('/admin/products')} style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: '#e5e5e5', fontSize: 13 }}>{p.name}</span>
                          <span style={{ color: '#888', fontSize: 12 }}>₹{p.price} | Stock: {p.stockQuantity || 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#25d366', textTransform: 'uppercase', padding: '6px 14px', letterSpacing: 1 }}>Customers ({searchResults.customers.length})</div>
                      {searchResults.customers.map(c => (
                        <div key={c._id} onClick={() => goTo('/admin/customers')} style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: '#e5e5e5', fontSize: 13 }}>{c.name} {c.phone && <span style={{ color: '#888', fontSize: 12 }}>({c.phone})</span>}</span>
                          <span style={{ color: '#b8956a', fontSize: 12 }}>{c.totalOrders} orders | ₹{c.totalSpent?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', padding: '6px 14px', letterSpacing: 1 }}>Orders ({searchResults.orders.length})</div>
                      {searchResults.orders.map(o => (
                        <div key={o._id} onClick={() => goTo('/admin/orders')} style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: '#e5e5e5', fontSize: 13 }}>{o.orderNumber} — {o.customerName || 'N/A'}</span>
                          <span style={{ color: '#888', fontSize: 12 }}>₹{o.total?.toLocaleString('en-IN')} | {o.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
