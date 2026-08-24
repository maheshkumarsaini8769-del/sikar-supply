import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/products', label: 'Products', icon: '🏷️' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>STAR HOME</h2>
            <span>Admin Panel</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
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
              <a href="/" target="_blank" className="adm-btn adm-btn-sm" style={{textDecoration:'none',borderColor:'#25d366',color:'#25d366'}}>
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
      </div>
    </div>
  );
}
