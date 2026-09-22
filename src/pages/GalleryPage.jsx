import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../data/galleryData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.categories ? item.categories.includes(activeCategory) : item.category === activeCategory;
  });

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${CANONICAL_DOMAIN}/gallery` },
    ],
  };

  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Star Home Design Interior & Wall Panel Gallery Sikar',
    description: 'Photo gallery of waterproof PVC wall panels, fluted louvers, UV marble sheets, and false ceilings installed in Sikar, Rajasthan.',
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Interior Wall Panels & UV Marble Photo Gallery Sikar | Star Home Design"
        description="Browse our visual gallery of living room TV units, bedroom fluted accents, waterproof PVC panels, and false ceilings installed across Sikar and Shekhawati."
        canonicalUrl={`${CANONICAL_DOMAIN}/gallery`}
        keywords="Wall Panels Gallery Sikar, TV Unit Photos Sikar, PVC Wall Panels Photos, UV Marble Sheet Gallery"
        ogType="website"
        schemas={[breadcrumbSchema, imageGallerySchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">VISUAL INSPIRATION</span>
            <h1 className="page-title">Photo Gallery of Real Sikar Installations</h1>
            <p className="page-subtitle">
              Browse through our curated collection of luxury TV media walls, bedroom headboard louvers, water-resistant ceiling rafters, and seamless marble feature panels.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Gallery</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="gallery-page-section">
          <div className="container">
            {/* Filter Bar */}
            <div className="filter-bar">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setLightboxIndex(null);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="gallery-masonry-grid">
              {filteredItems.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx % 4 * 60}>
                  <div
                    className="gallery-grid-card"
                    onClick={() => setLightboxIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(idx)}
                  >
                    <div className="gallery-card-img-wrap">
                      <img
                        src={item.image}
                        alt={item.alt || item.title}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="450"
                      />
                      <div className="gallery-card-overlay">
                        <span className="gallery-zoom-icon">🔍</span>
                        <h3 className="gallery-card-title">{item.title}</h3>
                        <span className="gallery-card-location">📍 {item.location}</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>See Actual Material Samples at Our Showroom</h2>
              <p>
                Visit us opposite Maruti Authorized Service Center on Jaipur-Jhunjhunu Bypass Road, Sikar, to touch real panel profiles.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Request Free Measurement
                </Link>
                <Link to="/contact" className="btn-outline">
                  Get Showroom Directions
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Full-Screen Lightbox Modal */}
      {activeItem && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>

            <button
              className="lightbox-nav-btn prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              ‹
            </button>

            <div className="lightbox-image-holder">
              <img src={activeItem.image} alt={activeItem.title} />
              <div className="lightbox-caption">
                <div className="lightbox-caption-text">
                  <h3>{activeItem.title}</h3>
                  <span>📍 {activeItem.location}</span>
                </div>
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    `Hi Star Home Design, I saw this design in your gallery: "${activeItem.title}" (${activeItem.location}). Can you share pricing and installation details?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-sm"
                >
                  Inquire on WhatsApp
                </a>
              </div>
            </div>

            <button
              className="lightbox-nav-btn next"
              onClick={nextImage}
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
