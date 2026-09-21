import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PRODUCT_CATEGORIES, BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProductCategoryPage() {
  const { categorySlug } = useParams();
  const category = PRODUCT_CATEGORIES[categorySlug];
  const [openFaq, setOpenFaq] = useState(0);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  // Structured Data for Category Page
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${CANONICAL_DOMAIN}/#products` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${CANONICAL_DOMAIN}/products/${category.slug}` },
    ],
  };

  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.pageTitle,
    description: category.metaDescription,
    numberOfItems: category.designs.length,
    itemListElement: category.designs.map((d, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: d.name,
        description: `${d.name} (${d.finish}) available at Star Home Design in Sikar, Rajasthan.`,
        image: d.image,
        brand: { '@type': 'Brand', name: 'Star Home Design' },
        category: category.name,
        url: `${CANONICAL_DOMAIN}/products/${category.slug}`,
      },
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: category.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: BUSINESS_NAP.name,
    telephone: BUSINESS_NAP.rawPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_NAP.streetAddress,
      addressLocality: BUSINESS_NAP.locality,
      addressRegion: BUSINESS_NAP.region,
      postalCode: BUSINESS_NAP.postalCode,
      addressCountry: BUSINESS_NAP.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_NAP.geo.latitude,
      longitude: BUSINESS_NAP.geo.longitude,
    },
    url: `${CANONICAL_DOMAIN}/products/${category.slug}`,
  };

  return (
    <>
      <SEOHead
        title={category.pageTitle}
        description={category.metaDescription}
        canonicalUrl={`${CANONICAL_DOMAIN}/products/${category.slug}`}
        keywords={`${category.keywordHeading}, ${category.name} in Sikar, Wall Panels Sikar, Star Home Design`}
        ogImage={category.designs[0]?.image}
        ogType="product.group"
        schemas={[breadcrumbSchema, productListSchema, faqSchema, localBusinessSchema]}
      />

      <Navbar />

      <main className="seo-page">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-separator" aria-hidden="true">/</li>
              <li className="breadcrumb-item">
                <a href="/#products">Products</a>
              </li>
              <li className="breadcrumb-separator" aria-hidden="true">/</li>
              <li className="breadcrumb-item breadcrumb-current" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Category Hero */}
          <header className="category-hero">
            <ScrollReveal>
              <span className="category-hero-badge">{category.badge}</span>
              <h1>{category.h1}</h1>
              <p className="category-hero-intro">{category.intro}</p>
              <div className="category-hero-actions">
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    `Hi Star Home Design, I am interested in ${category.name} in Sikar. Please share the catalog and prices.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Inquire on WhatsApp
                </a>
                <a href="/#contact" className="btn-outline">
                  Get Free Estimate
                </a>
              </div>
            </ScrollReveal>
          </header>

          {/* Benefits Section */}
          <section className="seo-section" aria-labelledby="benefits-heading">
            <ScrollReveal>
              <h2 className="seo-section-title" id="benefits-heading">
                Key Benefits &amp; Technical Advantages
              </h2>
            </ScrollReveal>
            <div className="benefits-grid">
              {category.benefits.map((b, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="benefit-card">
                    <h3 className="benefit-title">{b.title}</h3>
                    <p className="benefit-desc">{b.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Applications Section */}
          <section className="seo-section" aria-labelledby="applications-heading">
            <ScrollReveal>
              <h2 className="seo-section-title" id="applications-heading">
                Recommended Applications in Sikar Homes
              </h2>
            </ScrollReveal>
            <div className="applications-grid">
              {category.applications.map((app, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="application-card">
                    <h3>{app.title}</h3>
                    <p>{app.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Available Designs & Real Images */}
          <section className="seo-section" aria-labelledby="designs-heading">
            <ScrollReveal>
              <h2 className="seo-section-title" id="designs-heading">
                Popular Finishes &amp; Available Profiles
              </h2>
            </ScrollReveal>
            <div className="designs-grid">
              {category.designs.map((design, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="design-card">
                    <div className="design-card-img">
                      <img
                        src={design.image}
                        alt={design.alt}
                        loading="lazy"
                        decoding="async"
                        width="800"
                        height="500"
                      />
                    </div>
                    <div className="design-card-body">
                      <h3>{design.name}</h3>
                      <div className="design-card-meta">
                        <div>Finish: <span>{design.finish}</span></div>
                        {design.width && <div>Width: {design.width}</div>}
                        {design.dimensions && <div>Size: {design.dimensions}</div>}
                        {design.thickness && <div>Thickness: {design.thickness}</div>}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Visible FAQs */}
          <section className="seo-section" aria-labelledby="category-faqs-heading">
            <ScrollReveal>
              <h2 className="seo-section-title" id="category-faqs-heading">
                {category.name} FAQs
              </h2>
            </ScrollReveal>
            <div className="faq-list">
              {category.faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <ScrollReveal key={i} delay={i * 60}>
                    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
                      <button
                        className="faq-question"
                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-body-${category.slug}-${i}`}
                      >
                        <span className="faq-question-text">{faq.q}</span>
                        <span className="faq-icon" aria-hidden="true">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      <div
                        className="faq-answer"
                        id={`faq-body-${category.slug}-${i}`}
                        style={{ display: isOpen ? 'block' : 'none' }}
                      >
                        <p className="faq-details">{faq.a}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>

          {/* Showroom Visit CTA */}
          <div className="seo-section">
            <ScrollReveal>
              <div className="showroom-banner">
                <div className="showroom-banner-text">
                  <h2>Visit Our Sikar Showroom</h2>
                  <p>
                    Inspect actual panel mockups, touch textures, and consult with our interior specialists at{' '}
                    <strong>{BUSINESS_NAP.streetAddress}, Sikar</strong>.
                  </p>
                </div>
                <div className="category-hero-actions">
                  <a
                    href={`tel:${BUSINESS_NAP.rawPhone}`}
                    className="btn-primary"
                  >
                    Call {BUSINESS_NAP.phone}
                  </a>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Related Products Internal Linking */}
          <section className="seo-section" aria-labelledby="related-heading">
            <ScrollReveal>
              <h2 className="seo-section-title" id="related-heading">
                Explore Complementary Products
              </h2>
            </ScrollReveal>
            <div className="related-grid">
              {category.relatedCategories.map((relSlug) => {
                const rel = PRODUCT_CATEGORIES[relSlug];
                if (!rel) return null;
                return (
                  <Link
                    key={relSlug}
                    to={`/products/${rel.slug}`}
                    className="related-card"
                  >
                    <div>
                      <h3>{rel.name}</h3>
                      <p>{rel.metaDescription.slice(0, 110)}...</p>
                    </div>
                    <span className="related-card-link">View Details &rarr;</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
