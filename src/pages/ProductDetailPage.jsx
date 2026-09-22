import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import ProductCategoryPage from './ProductCategoryPage';
import { PRODUCTS_CATALOG } from '../data/productsCatalogData';
import { PRODUCT_CATEGORIES, BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProductDetailPage() {
  const { categorySlug, slug } = useParams();
  const currentSlug = categorySlug || slug;

  // Check if this slug is an existing SEO category page
  if (PRODUCT_CATEGORIES[currentSlug]) {
    return <ProductCategoryPage />;
  }

  // Find product by slug in PRODUCTS_CATALOG
  const product = PRODUCTS_CATALOG.find((p) => p.slug === currentSlug);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const [activeImage, setActiveImage] = useState(product.image);

  const relatedProducts = PRODUCTS_CATALOG
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  // SEO Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${CANONICAL_DOMAIN}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${CANONICAL_DOMAIN}/products/${product.slug}` },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Star Home Design',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: product.priceIndicator.replace(/[^0-9]/g, '').slice(0, 2) || '50',
      highPrice: product.priceIndicator.replace(/[^0-9]/g, '').slice(-2) || '150',
      priceUnit: 'Square Foot',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="site-page">
      <SEOHead
        title={`${product.name} in Sikar | Star Home Design`}
        description={`${product.shortDesc} Available in multiple colors and textures with professional installation in Sikar. Price: ${product.priceIndicator}.`}
        canonicalUrl={`${CANONICAL_DOMAIN}/products/${product.slug}`}
        keywords={`${product.name}, ${product.categoryName} Sikar, Wall Panels Sikar, Star Home Design`}
        ogImage={product.image}
        ogType="product"
        schemas={[breadcrumbSchema, productSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">{product.categoryName}</span>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">{product.shortDesc}</p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <Link to="/products">Products</Link>
              <span className="separator">/</span>
              <span className="current">{product.name}</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="about-section">
          <div className="container">
            <div className="product-detail-layout">
              {/* Left Column: Visual Gallery */}
              <div className="product-detail-gallery">
                <div className="product-main-img-box">
                  <img
                    src={activeImage}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="600"
                  />
                </div>

                {product.gallery && product.gallery.length > 1 && (
                  <div className="product-thumbs-strip">
                    {product.gallery.map((thumb, idx) => (
                      <button
                        key={idx}
                        className={`thumb-btn ${activeImage === thumb ? 'active' : ''}`}
                        onClick={() => setActiveImage(thumb)}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        <img src={thumb} alt={`Thumbnail ${idx + 1}`} width="100" height="75" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Information & Specs */}
              <div className="product-detail-info">
                <span className="product-cat-pill">{product.categoryName}</span>
                <h2 className="product-detail-name">{product.name}</h2>

                <div className="product-price-box">
                  <span className="price-tag-label">Estimated Rate:</span>
                  <span className="price-tag-val">{product.priceIndicator}</span>
                  <span className="price-tag-note">(Supply + Optional Installation)</span>
                </div>

                <div className="product-description-block">
                  <p>{product.description}</p>
                </div>

                {/* Available Color / Finish Variants */}
                {product.availableDesigns && product.availableDesigns.length > 0 && (
                  <div className="product-variants-section">
                    <h4>Popular Finishes in Stock:</h4>
                    <div className="variants-chips">
                      {product.availableDesigns.map((variant, vIdx) => (
                        <span key={vIdx} className="variant-chip">
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Specifications */}
                <div className="product-specs-section">
                  <h4>Technical Specifications:</h4>
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specs || {}).map(([key, val]) => (
                        <tr key={key}>
                          <td className="spec-label">{key}</td>
                          <td className="spec-val">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recommended Applications */}
                {product.applications && product.applications.length > 0 && (
                  <div className="product-apps-section">
                    <h4>Ideal Applications:</h4>
                    <ul className="product-apps-list">
                      {product.applications.map((app, aIdx) => (
                        <li key={aIdx}>✓ {app}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action CTA Buttons */}
                <div className="product-detail-actions">
                  <a
                    href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                      `Hi Star Home Design, I am interested in ordering/inquiring about "${product.name}" in Sikar. Please send sample images and current pricing.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Inquire on WhatsApp
                  </a>
                  <Link to={`/get-quote?product=${product.slug}`} className="btn-outline">
                    Schedule Free Measurement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="about-section quality-section">
            <div className="container">
              <div className="section-header">
                <span className="section-badge">RELATED DESIGNS</span>
                <h2>More Options in {product.categoryName}</h2>
              </div>

              <div className="grid-3">
                {relatedProducts.map((rel) => (
                  <div key={rel.slug} className="product-card">
                    <div className="product-card-img-wrap">
                      <img src={rel.image} alt={rel.name} loading="lazy" width="400" height="280" />
                    </div>
                    <div className="product-card-info">
                      <h3 className="product-card-title">
                        <Link to={`/products/${rel.slug}`}>{rel.name}</Link>
                      </h3>
                      <p className="product-card-excerpt">{rel.shortDesc.slice(0, 85)}...</p>
                      <div className="product-card-bottom">
                        <span className="price-value">{rel.priceIndicator}</span>
                        <Link to={`/products/${rel.slug}`} className="btn-detail-link">
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
