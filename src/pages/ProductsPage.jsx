import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PRODUCTS_CATALOG, PRODUCT_CATALOG_CATEGORIES } from '../data/productsCatalogData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'all';
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: catId });
    }
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS_CATALOG.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch =
        !searchFilter.trim() ||
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchFilter]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${CANONICAL_DOMAIN}/products` },
    ],
  };

  const catalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Interior Products & Wall Panels Catalog in Sikar',
    description: 'High-density PVC wall panels, fluted louvers, UV marble sheets, and false ceilings available at Star Home Design showroom in Sikar.',
    numberOfItems: PRODUCTS_CATALOG.length,
    itemListElement: PRODUCTS_CATALOG.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.shortDesc,
        image: p.image,
        url: `${CANONICAL_DOMAIN}/products/${p.slug}`,
        brand: { '@type': 'Brand', name: 'Star Home Design' },
      },
    })),
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Wall Panels, Fluted Louvers & UV Marble Catalog in Sikar | Star Home Design"
        description="Browse Star Home Design's full catalog of waterproof PVC panels, fluted louver slats, UV marble sheets, and ceiling panels in Sikar. Wholesale rates & professional installation."
        canonicalUrl={`${CANONICAL_DOMAIN}/products`}
        keywords="Wall Panels Sikar, PVC Panels Catalog, Fluted Panels Price Sikar, UV Marble Sheet Sikar, WPC Louvers Rajasthan"
        ogType="website"
        schemas={[breadcrumbSchema, catalogSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">ARCHITECTURAL MATERIAL CATALOG</span>
            <h1 className="page-title">Explore Wall Panels &amp; Decorative Finishes in Sikar</h1>
            <p className="page-subtitle">
              Browse our comprehensive collection of moisture-proof PVC panels, modern 3D fluted louvers, high-gloss UV marble slabs, and designer ceiling systems ready for installation.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Products</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="catalog-section">
          <div className="container">
            {/* Filter & Search Bar */}
            <div className="catalog-controls">
              <div className="filter-bar">
                {PRODUCT_CATALOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="catalog-search-wrapper">
                <input
                  type="text"
                  placeholder="Search textures, woodgrain, marble..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="catalog-search-input"
                  aria-label="Filter products"
                />
                {searchFilter && (
                  <button className="search-clear-btn" onClick={() => setSearchFilter('')}>
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Results count indicator */}
            <div className="catalog-meta-bar">
              <span>Showing {filteredProducts.length} architectural product{filteredProducts.length === 1 ? '' : 's'}</span>
              <span className="stock-guarantee">✓ In-Stock at Sikar Warehouse</span>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty-state">
                <p>No products match your current search or filter.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchFilter('');
                  }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, idx) => (
                  <ScrollReveal key={product.slug} delay={idx % 4 * 60}>
                    <div className="product-card">
                      <div className="product-card-img-wrap">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          width="600"
                          height="420"
                        />
                        <span className="product-cat-pill">{product.categoryName}</span>
                      </div>

                      <div className="product-card-info">
                        <h3 className="product-card-title">
                          <Link to={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className="product-card-excerpt">{product.shortDesc}</p>

                        <div className="product-spec-quick">
                          {product.specs?.Thickness && (
                            <span className="spec-badge">Thick: {product.specs.Thickness}</span>
                          )}
                          {product.specs?.Finish && (
                            <span className="spec-badge">{product.specs.Finish}</span>
                          )}
                        </div>

                        <div className="product-card-bottom">
                          <div className="product-price-range">
                            <span className="price-label">Price Range</span>
                            <span className="price-value">{product.priceIndicator}</span>
                          </div>
                          <div className="product-actions-group">
                            <Link to={`/products/${product.slug}`} className="btn-detail-link">
                              Details &rarr;
                            </Link>
                            <a
                              href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                                `Hi Star Home Design, I want to inquire about "${product.name}" in Sikar. What are the wholesale rates and available designs?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-wa-icon"
                              title="Ask on WhatsApp"
                              aria-label="Ask on WhatsApp"
                            >
                              WA
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Physical Samples Callout */}
        <section className="about-section quality-section">
          <div className="container">
            <div className="samples-banner">
              <div className="samples-text">
                <span className="section-badge">PHYSICAL TEXTURE SAMPLES</span>
                <h2>Want to Touch &amp; Feel These Textures Before Deciding?</h2>
                <p>
                  Photos cannot capture the depth of 3D ribbed louvers, natural woodgrain embossing, or high-gloss Italian marble sheets. Visit our Sikar showroom or request an on-site sample suitcase brought right to your door.
                </p>
                <div style={{ display: 'flex', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <Link to="/contact" className="btn-primary">
                    Visit Sikar Showroom
                  </Link>
                  <Link to="/get-quote" className="btn-outline">
                    Request Samples at Site
                  </Link>
                </div>
              </div>
              <div className="samples-badge-box">
                <div className="samples-badge-number">200+</div>
                <div className="samples-badge-label">Sample Swatches Available on Display</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
