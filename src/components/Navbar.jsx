import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { trackSearch } from '../utils/analytics';
import Logo from './Logo';

export default function Navbar({ onSearchProduct }) {
  const { products, settings } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 60);
      if (current < 100) setHidden(false);
      else if (current > lastScroll.current + 5) setHidden(true);
      else if (current < lastScroll.current - 5) setHidden(false);
      lastScroll.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (searchOpen) {
        setSearchOpen(false);
        return;
      }
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchOpen, menuOpen]);

  // Lock body scroll when drawer or search is open
  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? 'hidden' : '';
  }, [menuOpen, searchOpen]);

  // Escape key closes modal / drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => document.querySelector('.search-overlay input')?.focus(), 100);
  }, [searchOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', desktopLabel: 'Home', path: '/', icon: '🏠' },
    { label: 'About Us', desktopLabel: 'About', path: '/about', icon: '🏢' },
    { label: 'Services', desktopLabel: 'Services', path: '/services', icon: '🛡️', badge: '9 Services' },
    { label: 'Products Catalog', desktopLabel: 'Products', path: '/products', icon: '📦', badge: 'In-Stock' },
    { label: 'Project Portfolio', desktopLabel: 'Projects', path: '/projects', icon: '📸', badge: 'Portfolio' },
    { label: 'Photo Gallery', desktopLabel: 'Gallery', path: '/gallery', icon: '🖼️' },
    { label: 'Pricing & Calculator', desktopLabel: 'Pricing', path: '/pricing', icon: '💰', badge: 'Estimator' },
    { label: 'Design Blog', desktopLabel: 'Blog', path: '/blog', icon: '📰' },
    { label: 'Showroom & Contact', desktopLabel: 'Contact', path: '/contact', icon: '📍' },
  ];

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setMenuOpen(false);
    setSearchOpen(false);

    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    trackSearch(searchQuery);
    const q = searchQuery.toLowerCase();
    const results = products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.category?.slug?.includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
    setSearchResults(results.map(p => ({ id: p._id, title: p.name, category: p.category?.slug || '', categoryLabel: p.category?.name || '' })));
    setSearched(true);

    if (results.length > 0 && onSearchProduct) {
      onSearchProduct(results[0].category?.slug);
      setSearchOpen(false);
      setSearchQuery('');
      setSearched(false);
    }
  };

  const handleResultClick = (product) => {
    if (onSearchProduct) onSearchProduct(product.category);
    setSearchOpen(false);
    setSearchQuery('');
    setSearched(false);
  };

  const handleTagClick = (tag) => setSearchQuery(tag);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${hidden ? 'navbar-hidden' : ''}`}>
        <div className="container">
          <Logo />
          
          {/* Desktop Navbar Links */}
          <ul className="navbar-links">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <a
                    href={item.path}
                    className={isActive ? 'nav-link-active' : ''}
                    onClick={(e) => handleNavClick(e, item.path)}
                    style={isActive ? { color: 'var(--color-accent)', fontWeight: 700 } : undefined}
                  >
                    {item.desktopLabel || item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Desktop Right Actions */}
          <div className="navbar-actions">
            <button
              className="navbar-search-btn"
              onClick={() => { if (!searchOpen) window.history.pushState({ search: true }, ''); setSearchOpen(!searchOpen); }}
              aria-label="Search products"
              title="Search materials"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <Link
              to="/get-quote"
              className="navbar-quote-cta-btn"
            >
              Get Free Quote
            </Link>
            <a
              href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=${encodeURIComponent(settings?.whatsappGreeting || "Hi, I'm interested in your products")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-whatsapp-btn"
              title="WhatsApp us"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <button
              className={`hamburger ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              title="Menu directory"
            >
              <span></span><span></span><span></span>
            </button>
          </div>

          {/* Mobile Right Bar */}
          <div className="mobile-nav-right">
            <button
              className="navbar-search-btn"
              onClick={() => { if (!searchOpen) window.history.pushState({ search: true }, ''); setSearchOpen(!searchOpen); }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <a
              href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=${encodeURIComponent(settings?.whatsappGreeting || "Hi, I'm interested in your products")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-whatsapp-btn"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <button
              className={`hamburger ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Slide-In Menu Drawer */}
      <div
        className={`drawer-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <aside
        className={`drawer-panel ${menuOpen ? 'open' : ''}`}
        aria-label="Site Navigation Directory"
        aria-hidden={!menuOpen}
      >
        {/* Drawer Header with Brand & Close Button */}
        <div className="drawer-header">
          <Logo />
          <button
            className="drawer-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-body">
          {/* Quick Quote Promo Banner */}
          <div className="drawer-promo-card">
            <span className="promo-badge">FREE SITE VISIT • SIKAR</span>
            <h4>Transform Your Walls</h4>
            <p>Accurate laser measurement, dampness audit, and real texture samples brought to your doorstep.</p>
            <Link
              to="/get-quote"
              className="btn-primary drawer-promo-btn"
              onClick={() => setMenuOpen(false)}
            >
              Get Free Estimate &rarr;
            </Link>
          </div>

          {/* Core Directory */}
          <div className="drawer-nav-group">
            <span className="drawer-group-title">MAIN DIRECTORY</span>
            <nav className="drawer-nav-list">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.path)}
                  >
                    <div className="drawer-nav-item-left">
                      <span className="drawer-item-icon">{item.icon}</span>
                      <span className="drawer-item-label">{item.label}</span>
                      {item.badge && <span className="drawer-item-badge">{item.badge}</span>}
                    </div>
                    <span className="drawer-item-arrow">&rsaquo;</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Process & Help */}
          <div className="drawer-nav-group">
            <span className="drawer-group-title">GUIDES &amp; PROCESS</span>
            <nav className="drawer-nav-list">
              <Link
                to="/process"
                className={`drawer-nav-item ${location.pathname === '/process' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/process')}
              >
                <div className="drawer-nav-item-left">
                  <span className="drawer-item-icon">⏱️</span>
                  <span className="drawer-item-label">Our 9-Step Process</span>
                </div>
                <span className="drawer-item-arrow">&rsaquo;</span>
              </Link>
              <Link
                to="/faq"
                className={`drawer-nav-item ${location.pathname === '/faq' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/faq')}
              >
                <div className="drawer-nav-item-left">
                  <span className="drawer-item-icon">❓</span>
                  <span className="drawer-item-label">Frequently Asked Questions</span>
                </div>
                <span className="drawer-item-arrow">&rsaquo;</span>
              </Link>
              <Link
                to="/guides"
                className={`drawer-nav-item ${location.pathname === '/guides' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, '/guides')}
              >
                <div className="drawer-nav-item-left">
                  <span className="drawer-item-icon">📚</span>
                  <span className="drawer-item-label">Interior Advice Guides</span>
                </div>
                <span className="drawer-item-arrow">&rsaquo;</span>
              </Link>
            </nav>
          </div>

          {/* Showroom & Fast Action Contacts */}
          <div className="drawer-contact-card">
            <div className="drawer-showroom-header">
              <span className="showroom-badge">SIKAR SHOWROOM</span>
              <h5>Star Home Design</h5>
              <p>Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar</p>
            </div>

            <div className="drawer-contact-buttons">
              <a href="tel:+918239409535" className="drawer-action-btn call">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Call Us
              </a>
              <a
                href="https://wa.me/918239409535?text=Hi%20Star%20Home%20Design%2C%20I%20am%20interested%20in%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-action-btn wa"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>

            <div className="drawer-timings">
              <span>⏰ Hours: Mon - Sat: 10:00 AM – 8:00 PM</span>
              <span>Sunday: 11:00 AM – 5:00 PM</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Overlay */}
      <div className={`search-overlay ${searchOpen ? 'open' : ''}`} onClick={() => setSearchOpen(false)}>
        <div className="search-box" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSearch}>
            <input type="text" placeholder="Search products, materials..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search products" />
            <button type="submit" className="search-submit">Search</button>
          </form>
          {searched && searchResults.length === 0 && <div className="search-not-found">No products found for "{searchQuery}"</div>}
          {searched && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(p => (
                <div key={p.id} className="search-result-item" onClick={() => handleResultClick(p)}>
                  <span className="search-result-title">{p.title}</span>
                  <span className="search-result-cat">{p.categoryLabel}</span>
                </div>
              ))}
            </div>
          )}
          <div className="search-tags">
            <span onClick={() => handleTagClick('PVC')}>PVC Panels</span>
            <span onClick={() => handleTagClick('Fluted')}>Fluted</span>
            <span onClick={() => handleTagClick('Rafter')}>Rafter</span>
            <span onClick={() => handleTagClick('UV')}>UV Sheets</span>
            <span onClick={() => handleTagClick('Tiles')}>Tiles</span>
          </div>
        </div>
      </div>
    </>
  );
}
