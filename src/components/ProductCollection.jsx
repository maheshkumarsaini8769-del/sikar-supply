import { useState, useEffect, useCallback } from 'react';
import { useSite } from '../context/SiteContext';
import { trackClick } from '../utils/analytics';
import ScrollReveal from './ScrollReveal';
import ProductModal from './ProductModal';
import { UPLOAD_URL } from '../api';

export default function ProductCollection({ activeCategory }) {
  const { products, categories } = useSite();
  const [activeFilter, setActiveFilter] = useState(activeCategory || 'all');
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const allFilters = [
    { label: 'All', slug: 'all' },
    ...categories.map(c => ({ label: c.name, slug: c.slug })),
  ];

  const filtered = activeFilter === 'all'
    ? products
    : products.filter((p) => p.category?.slug === activeFilter);

  const handleFilter = (val) => {
    setActiveFilter(val);
    const el = document.getElementById('products');
    if (el) {
      window.history.pushState(null, '', '#products');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products-header">
          <ScrollReveal>
            <h2 className="section-heading">Explore Our Collection</h2>
          </ScrollReveal>
          <div className="product-filter">
            {allFilters.map((f) => (
              <button
                key={f.slug}
                className={`filter-btn ${activeFilter === f.slug ? 'active' : ''}`}
                onClick={() => handleFilter(f.slug)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filtered.map((product, i) => (
            <ScrollReveal key={product._id} delay={i * 100}>
              <div className="product-card" onClick={() => { trackClick(product); setSelectedProduct(product); window.history.pushState({ modal: true }, ''); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { trackClick(product); setSelectedProduct(product); window.history.pushState({ modal: true }, ''); } }}>
                <div className="product-card-image">
                  <img src={getImage(product)} alt={`${product.name} - Premium interior material`} loading="lazy" width="800" height="600" />
                  <div className="product-card-number">{String(i + 1).padStart(2, '0')}</div>
                  {product.stockStatus === 'out_of_stock' && <div className="out-of-stock-badge">OUT OF STOCK</div>}
                </div>
                <div className="product-card-content">
                  <div className="product-card-meta">
                    <span className="product-card-category">{product.category?.name || ''}</span>
                    <span className="product-card-price">
                      {product.salePrice > 0 ? (
                        <>
                          <span style={{textDecoration:'line-through',opacity:0.5,marginRight:'6px',fontSize:'12px'}}>₹{product.price}</span>
                          <span style={{color:'var(--color-accent)'}}>₹{product.salePrice}/sq.ft</span>
                        </>
                      ) : product.price > 0 ? `₹ ${product.price}/sq.ft` : 'GET PRICE'}
                    </span>
                  </div>
                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-desc">{product.description || product.shortDescription || ''}</p>
                  <div className="product-card-actions">
                    <span className="product-card-link">View Details</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              No products found
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={{ ...selectedProduct, images: modalImages(selectedProduct), title: selectedProduct.name, category: selectedProduct.category?.slug || '', pricePerSqFt: selectedProduct.price }}
          onClose={closeModal}
        />
      )}
    </section>
  );
}
