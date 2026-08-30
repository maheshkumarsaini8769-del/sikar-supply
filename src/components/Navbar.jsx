import { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { trackSearch } from '../utils/analytics';
import Logo from './Logo';

export default function Navbar({ onSearchProduct }) {
  const { products, settings } = useSite();
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
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? 'hidden' : '';
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => document.querySelector('.search-overlay input')?.focus(), 100);
  }, [searchOpen]);

  const navItems = ['Home', 'Products', 'About', 'Why Us', 'Showroom', 'Gallery', 'Contact'];

  const scrollTo = (id) => {
    setMenuOpen(false);
    setSearchOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.history.pushState(null, '', `#${id}`);
      el.scrollIntoView({ behavior: 'smooth' });
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
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase().replace(' ', '-')); }}>{item}</a>
              </li>
            ))}
          </ul>
          <div className="navbar-actions">
            <button className="navbar-search-btn" onClick={() => { if (!searchOpen) window.history.pushState({ search: true }, ''); setSearchOpen(!searchOpen); }} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <a href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=${encodeURIComponent(settings?.whatsappGreeting || "Hi, I'm interested in your products")}`} target="_blank" rel="noopener noreferrer" className="navbar-whatsapp-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
          <div className="mobile-nav-right">
            <button className="navbar-search-btn" onClick={() => { if (!searchOpen) window.history.pushState({ search: true }, ''); setSearchOpen(!searchOpen); }} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <a href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=${encodeURIComponent(settings?.whatsappGreeting || "Hi, I'm interested in your products")}`} target="_blank" rel="noopener noreferrer" className="mobile-whatsapp-btn" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

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

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={e => { e.preventDefault(); scrollTo(item.toLowerCase().replace(' ', '-')); }}>{item}</a>
        ))}
      </div>
    </>
  );
}
