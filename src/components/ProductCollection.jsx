import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import { trackClick } from '../utils/analytics';
import ScrollReveal from './ScrollReveal';
import ProductModal from './ProductModal';
import { UPLOAD_URL } from '../api';

export default function ProductCollection({ activeCategory }) {
  const { products, categories, settings } = useSite();
  const [activeFilter, setActiveFilter] = useState(activeCategory || 'all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (activeCategory) setActiveFilter(activeCategory);
  }, [activeCategory]);

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
    if (window.history.state?.modal) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct && !window.history.state?.modal) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct]);

  const getImage = (p) => {
    if (p.images && p.images.length > 0) {
      const url = p.images.find(i => i.isPrimary)?.url || p.images[0].url;
      return (url.startsWith('http') || url.startsWith('data:')) ? url : UPLOAD_URL + url;
    }
    return 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop';
  };

  const modalImages = (p) => {
    if (p.images && p.images.length > 0) {
      return p.images.map(i => (i.url.startsWith('http') || i.url.startsWith('data:')) ? i.url : UPLOAD_URL + i.url);
    }
    return [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=85&auto=format&fit=crop',
    ];
  };

  // Category items with count
  const allFilters = useMemo(() => [
    { label: 'All', slug: 'all', count: products.length },
    ...categories.map(c => ({
      label: c.name,
      slug: c.slug,
      count: products.filter(p => p.category?.slug === c.slug).length,
    })),
  ], [categories, products]);

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let result = products;

    // Filter by Category
    if (activeFilter !== 'all') {
      result = result.filter(p => p.category?.slug === activeFilter);
    }

    // Filter by Search Keyword
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      const priceA = a.salePrice || a.price || 0;
      const priceB = b.salePrice || b.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, activeFilter, searchKeyword, sortBy]);

  useEffect(() => {
    if (filteredAndSorted.length === 0) return;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Star Home Design - Interior Materials Collection',
      numberOfItems: filteredAndSorted.length,
      itemListElement: filteredAndSorted.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description || p.shortDescription || '',
          image: getImage(p),
          url: window.location.origin + '/#products',
          brand: { '@type': 'Brand', name: 'Star Home Design' },
          offers: p.price > 0 ? {
            '@type': 'Offer',
            price: p.salePrice || p.price,
            priceCurrency: 'INR',
            availability: p.stockStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31',
          } : undefined,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '13',
          },
        },
      })),
    };
    document.querySelectorAll('script[data-seo-products]').forEach(el => el.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-products', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [filteredAndSorted]);

  const handleFilter = (val) => {
    setActiveFilter(val);
    const el = document.getElementById('products');
    if (el) {
      window.history.pushState(null, '', '#products');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickWhatsApp = (e, product) => {
    e.stopPropagation();
    const phone = settings?.whatsapp || '918239409535';
    const text = `Hello Star Home Design, I am interested in *${product.name}* (Price: ₹${product.salePrice || product.price}/${product.unit || 'sqft'}). Please share catalog designs and availability.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products-header">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Curated Masterpieces</span>
              <h2 className="section-heading">Explore Our Collection</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
                Discover our range of premium wall panels, architectural louvers, ceiling rafters, and luxury UV marble sheets.
              </p>
            </div>
          </ScrollReveal>

          {/* Search & Sort Toolbar */}
          <div className="collection-toolbar">
            <div className="collection-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search collection (e.g. fluted, PVC, marble, tile)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button className="clear-search-btn" onClick={() => setSearchKeyword('')}>×</button>
              )}
            </div>

            <div className="collection-sort-box">
              <span>Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="product-filter">
            {allFilters.map((f) => (
              <button
                key={f.slug}
                className={`filter-btn ${activeFilter === f.slug ? 'active' : ''}`}
                onClick={() => handleFilter(f.slug)}
              >
                {f.label}
                <span className="filter-count-badge">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {filteredAndSorted.map((product, i) => (
            <ScrollReveal key={product._id} delay={i * 80}>
              <div
                className="product-card"
                onClick={() => {
                  trackClick(product);
                  setSelectedProduct(product);
                  window.history.pushState({ modal: true }, '');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    trackClick(product);
                    setSelectedProduct(product);
                    window.history.pushState({ modal: true }, '');
                  }
                }}
              >
                <div className="product-card-image">
                  <img
                    src={getImage(product)}
                    alt={`${product.name} - Premium interior material`}
                    loading="lazy"
                    width="800"
                    height="600"
                  />
                  <div className="product-card-number">{String(i + 1).padStart(2, '0')}</div>
                  {product.stockStatus === 'out_of_stock' && (
                    <div className="out-of-stock-badge">OUT OF STOCK</div>
                  )}
                  {product.stockStatus === 'low_stock' && (
                    <div className="out-of-stock-badge" style={{ background: '#f59e0b' }}>LIMITED STOCK</div>
                  )}
                </div>

                <div className="product-card-content">
                  <div className="product-card-meta">
                    <span className="product-card-category">{product.category?.name || ''}</span>
                    <span className="product-card-price">
                      {product.salePrice > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '6px', fontSize: '12px' }}>
                            ₹{product.price}
                          </span>
                          <span style={{ color: 'var(--color-accent)' }}>
                            ₹{product.salePrice}/{product.unit || 'sq.ft'}
                          </span>
                        </>
                      ) : product.price > 0 ? (
                        `₹ ${product.price}/${product.unit || 'sq.ft'}`
                      ) : (
                        'GET PRICE'
                      )}
                    </span>
                  </div>

                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-desc">{product.description || product.shortDescription || ''}</p>

                  <div className="product-card-actions">
                    <span className="product-card-link">View Details</span>
                    <button
                      type="button"
                      className="card-quick-wa-btn"
                      onClick={(e) => handleQuickWhatsApp(e, product)}
                      title="Enquire on WhatsApp"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}

          {filteredAndSorted.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                No products match "{searchKeyword}"
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '12px', marginTop: '10px' }}
                onClick={() => { setSearchKeyword(''); setActiveFilter('all'); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={{
            ...selectedProduct,
            images: modalImages(selectedProduct),
            title: selectedProduct.name,
            category: selectedProduct.category?.slug || '',
            pricePerSqFt: selectedProduct.price,
          }}
          onClose={closeModal}
        />
      )}
    </section>
  );
}
