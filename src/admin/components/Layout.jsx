import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
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
  const [searchTab, setSearchTab] = useState('products');
  const [searchResults, setSearchResults] = useState({ products: [], sales: [], customers: [] });
  const [searching, setSearching] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length < 2) { setSearchResults({ products: [], sales: [], customers: [] }); return; }
      setSearching(true);
      const q = searchQuery.trim();
      const fetches = {
        products: api.get('/products', { params: { search: q } }).catch(() => ({ data: { products: [] } })),
        sales: api.get('/sales', { params: { search: q, limit: 50 } }).catch(() => ({ data: { sales: [] } })),
        customers: api.get('/customers', { params: { search: q } }).catch(() => ({ data: { customers: [] } })),
      };
      Promise.all(Object.values(fetches)).then(([pRes, sRes, cRes]) => {
        setSearchResults({
          products: pRes.data.products || [],
          sales: sRes.data.sales || [],
          customers: cRes.data.customers || [],
        });
        setSearching(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const hasResults = searchResults.products.length || searchResults.sales.length || searchResults.customers.length;

  const goTo = (path) => { setSearchOpen(false); setSearchQuery(''); navigate(path); };

  const tabs = [
    { key: 'products', label: 'Products', icon: '🏷️', count: searchResults.products.length },
    { key: 'sales', label: 'Sales', icon: '💰', count: searchResults.sales.length },
    { key: 'customers', label: 'Customers', icon: '👤', count: searchResults.customers.length },
  ];

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
            <button onClick={() => setSearchOpen(true)} className="topbar-icon-btn" title="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <a href="/" target="_blank" className="topbar-icon-btn topbar-visit-btn" title="Visit Website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </a>
            <span className="admin-name">{user?.name}</span>
            <button onClick={handleLogout} className="topbar-logout" title="Logout">Logout</button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="adm-modal-overlay" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ zIndex: 9999 }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, top: '10vh' }}>
            <div className="adm-modal-header" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text" placeholder={searchTab === 'products' ? 'Search products by name...' : searchTab === 'sales' ? 'Search sales by product name...' : 'Search customers by name or phone...'}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  autoFocus style={{ flex: 1, background: 'transparent', border: 'none', color: '#e5e5e5', fontSize: 15, outline: 'none' }}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                />
              </div>
              <button className="adm-modal-close" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>&times;</button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #222', padding: '0 16px', gap: 4 }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setSearchTab(t.key)} style={{
                  padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent',
                  color: searchTab === t.key ? '#b8956a' : '#666', borderBottom: searchTab === t.key ? '2px solid #b8956a' : '2px solid transparent',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}>
                  {t.icon} {t.label}
                  {searchQuery.length >= 2 && t.count > 0 && <span style={{ background: '#b8956a', color: '#000', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{t.count}</span>}
                </button>
              ))}
            </div>

            <div className="adm-modal-body" style={{ maxHeight: '55vh', overflowY: 'auto', padding: searchQuery.length < 2 ? 20 : '8px 0' }}>
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
                  {/* Products Tab */}
                  {searchTab === 'products' && searchResults.products.length > 0 && searchResults.products.map(p => (
                    <div key={p._id} onClick={() => goTo('/admin/products')} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ color: '#e5e5e5', fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{p.category?.name || 'Uncategorized'} | SKU: {p.sku || '-'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#b8956a', fontSize: 13, fontWeight: 700 }}>₹{p.price?.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: 11, color: (p.stockQuantity || 0) > 0 ? '#25d366' : '#ef4444' }}>Stock: {p.stockQuantity || 0} {p.unit || 'sqft'}</div>
                      </div>
                    </div>
                  ))}
                  {searchTab === 'products' && searchQuery.length >= 2 && searchResults.products.length === 0 && !searching && (
                    <div style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: 13 }}>No products found</div>
                  )}

                  {/* Sales Tab */}
                  {searchTab === 'sales' && searchResults.sales.length > 0 && searchResults.sales.map(s => (
                    <div key={s._id} onClick={() => goTo('/admin/all-sales')} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ color: '#e5e5e5', fontSize: 13, fontWeight: 600 }}>{s.saleNumber}</div>
                        <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{s.customerName || 'Walk-in'} | {s.items?.map(i => i.productName).join(', ') || '-'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#25d366', fontSize: 13, fontWeight: 700 }}>₹{s.finalAmount?.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{new Date(s.saleDate || s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | {s.saleType || s.source || 'cash'}</div>
                      </div>
                    </div>
                  ))}
                  {searchTab === 'sales' && searchQuery.length >= 2 && searchResults.sales.length === 0 && !searching && (
                    <div style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: 13 }}>No sales found for this product</div>
                  )}

                  {/* Customers Tab */}
                  {searchTab === 'customers' && searchResults.customers.length > 0 && searchResults.customers.map(c => (
                    <div key={c._id} onClick={() => goTo('/admin/customers')} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ color: '#e5e5e5', fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{c.phone || 'No phone'} | {c.city || '-'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#b8956a', fontSize: 13, fontWeight: 700 }}>{c.totalOrders} orders</div>
                        <div style={{ fontSize: 11, color: '#25d366' }}>₹{c.totalSpent?.toLocaleString('en-IN')} spent</div>
                      </div>
                    </div>
                  ))}
                  {searchTab === 'customers' && searchQuery.length >= 2 && searchResults.customers.length === 0 && !searching && (
                    <div style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: 13 }}>No customers found</div>
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
