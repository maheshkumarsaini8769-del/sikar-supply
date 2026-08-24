import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/products', label: 'Products', icon: '🏷️' },
  { path: '/categories', label: 'Categories', icon: '📁' },
  { path: '/hero-slides', label: 'Hero Slides', icon: '🖼️' },
  { path: '/gallery', label: 'Gallery', icon: '🖼️' },
  { path: '/media', label: 'Media', icon: '🎨' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
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
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span/><span/><span/>
          </button>
          <div className="topbar-right">
            <span className="admin-name">👤 {user?.name}</span>
            <button onClick={handleLogout} className="topbar-logout">Logout</button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
