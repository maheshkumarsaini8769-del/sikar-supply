import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { SERVICES_LIST } from '../data/servicesData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ServiceDetailPage() {
  const { serviceSlug } = useParams();
  const service = SERVICES_LIST.find((s) => s.slug === serviceSlug);
  const [openFaq, setOpenFaq] = useState(0);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const otherServices = SERVICES_LIST.filter((s) => s.slug !== service.slug).slice(0, 3);

  // SEO Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${CANONICAL_DOMAIN}/services` },
      { '@type': 'ListItem', position: 3, name: service.title, item: `${CANONICAL_DOMAIN}/services/${service.slug}` },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.title} in Sikar`,
    description: service.shortDesc,
    provider: {
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
    },
    areaServed: {
      '@type': 'City',
      name: 'Sikar',
    },
    offers: {
      '@type': 'Offer',
      price: service.startingPrice.replace(/[^0-9]/g, ''),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="site-page">
      <SEOHead
        title={`${service.title} in Sikar | Installation & Cost | Star Home Design`}
        description={`${service.shortDesc} Professional installation across Sikar, Jhunjhunu & Jaipur with 10-year warranty. Starting from ${service.startingPrice}.`}
        canonicalUrl={`${CANONICAL_DOMAIN}/services/${service.slug}`}
        keywords={`${service.title} Sikar, ${service.title} price in Sikar, Wall Panels Sikar, Star Home Design`}
        ogImage={service.image}
        ogType="service"
        schemas={[breadcrumbSchema, serviceSchema, faqSchema]}
      />

      <Navbar />

      {/* Service Hero */}
      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">
              <span style={{ marginRight: '6px' }}>{service.icon}</span>
              {service.badge}
            </span>
            <h1 className="page-title">{service.title} in Sikar</h1>
            <p className="page-subtitle">{service.subtitle}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', margin: '20px 0' }}>
              <span className="hero-price-badge">Starting from {service.startingPrice}</span>
              <span className="hero-warranty-badge">★ 10-Year Warranty</span>
            </div>

            <div className="page-hero-actions">
              <Link to={`/get-quote?service=${service.slug}`} className="btn-primary">
                Book Free Site Measurement
              </Link>
              <a
                href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                  `Hi Star Home Design, I am interested in ${service.title} in Sikar. Please share design options and pricing.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Inquire on WhatsApp
              </a>
            </div>

            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <Link to="/services">Services</Link>
              <span className="separator">/</span>
              <span className="current">{service.title}</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Detail Overview */}
        <section className="about-section">
          <div className="container">
            <div className="service-detail-overview-grid">
              <ScrollReveal>
                <div className="detail-overview-text">
                  <span className="section-badge">SERVICE OVERVIEW</span>
                  <h2>Engineered for Lasting Beauty &amp; Protection</h2>
                  <p className="lead-paragraph">{service.shortDesc}</p>
                  
                  <h3 style={{ fontSize: '18px', marginTop: '24px', marginBottom: '14px', color: 'var(--color-accent)' }}>
                    Core Advantages &amp; Properties
                  </h3>
                  <ul className="service-features-list-large">
                    {service.features.map((feat, idx) => (
                      <li key={idx}>
                        <span className="check-icon">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="detail-overview-image">
                  <img
                    src={service.image}
                    alt={`${service.title} installed in Sikar home`}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="540"
                  />
                  <div className="installation-time-tag">
                    <span>⏱ Typical Execution: 24 to 48 Hours</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="seo-section" style={{ background: 'var(--color-charcoal)' }}>
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">KEY BENEFITS</span>
              <h2>Why Sikar Homeowners Prefer Our {service.title}</h2>
              <p className="section-subtitle">
                Tailored to resolve real living challenges in Rajasthan homes while adding instant architectural value.
              </p>
            </div>

            <div className="benefits-grid">
              {service.benefits.map((benefit, idx) => (
                <ScrollReveal key={idx} delay={idx * 60}>
                  <div className="benefit-card">
                    <div className="benefit-number">0{idx + 1}</div>
                    <p className="benefit-desc">{benefit}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Specifications & Applications */}
        <section className="about-section">
          <div className="container">
            <div className="specs-apps-grid">
              {/* Technical Specs */}
              <ScrollReveal>
                <div className="detail-card-panel">
                  <span className="section-badge">SPECIFICATIONS</span>
                  <h3>Material &amp; Technical Attributes</h3>
                  <div className="specs-table-wrapper">
                    <table className="specs-table">
                      <tbody>
                        {Object.entries(service.materialInfo || {}).map(([key, val]) => (
                          <tr key={key}>
                            <td className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                            <td className="spec-val">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollReveal>

              {/* Applications */}
              <ScrollReveal delay={120}>
                <div className="detail-card-panel">
                  <span className="section-badge">RECOMMENDED SPACES</span>
                  <h3>Where to Use in Your Sikar Home</h3>
                  <div className="applications-pills-grid">
                    {service.applications.map((app, idx) => (
                      <div key={idx} className="app-pill">
                        <span className="pill-dot" />
                        <span>{app}</span>
                      </div>
                    ))}
                  </div>

                  <div className="quick-help-box">
                    <p>
                      <strong>Need guidance for your specific room layout?</strong>
                    </p>
                    <p>Our interior specialists provide on-site measurement and free 3D design suggestions.</p>
                    <Link to="/get-quote" className="btn-primary" style={{ marginTop: '12px' }}>
                      Request Site Inspection
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Project Gallery Preview */}
        {service.gallery && service.gallery.length > 0 && (
          <section className="seo-section">
            <div className="container">
              <div className="section-header text-center">
                <span className="section-badge">INSTALLATION SHOWCASE</span>
                <h2>Recent {service.title} Work in Sikar</h2>
              </div>
              <div className="service-gallery-grid">
                {service.gallery.map((imgUrl, gIdx) => (
                  <ScrollReveal key={gIdx} delay={gIdx * 70}>
                    <div className="service-gallery-item">
                      <img
                        src={imgUrl}
                        alt={`${service.title} installation photo ${gIdx + 1}`}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="400"
                      />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Service FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="seo-section" style={{ background: 'var(--color-charcoal)' }}>
            <div className="container">
              <div className="section-header text-center">
                <span className="section-badge">COMMON QUESTIONS</span>
                <h2>{service.title} FAQs</h2>
              </div>

              <div className="faq-list">
                {service.faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <ScrollReveal key={i} delay={i * 60}>
                      <div className={`faq-item ${isOpen ? 'active' : ''}`}>
                        <button
                          className="faq-question"
                          onClick={() => setOpenFaq(isOpen ? -1 : i)}
                          aria-expanded={isOpen}
                        >
                          <span className="faq-question-text">{faq.q}</span>
                          <span className="faq-icon" aria-hidden="true">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        <div className="faq-answer" style={{ display: isOpen ? 'block' : 'none' }}>
                          <p className="faq-details">{faq.a}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related / Other Services */}
        <section className="about-section">
          <div className="container">
            <div className="section-header">
              <span className="section-badge">EXPLORE MORE</span>
              <h2>Complementary Interior Services</h2>
            </div>

            <div className="grid-3">
              {otherServices.map((srv) => (
                <div key={srv.slug} className="related-service-card">
                  <img src={srv.image} alt={srv.title} loading="lazy" width="400" height="250" />
                  <div className="related-service-body">
                    <h4>{srv.title}</h4>
                    <p>{srv.shortDesc.slice(0, 95)}...</p>
                    <Link to={`/services/${srv.slug}`} className="related-link">
                      View Service Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Schedule Your Free {service.title} Site Inspection</h2>
              <p>
                Our Sikar team will visit your home or commercial site, inspect the wall conditions, measure area, and present texture samples.
              </p>
              <div className="cta-buttons">
                <Link to={`/get-quote?service=${service.slug}`} className="btn-primary">
                  Book Free Site Visit
                </Link>
                <Link to="/pricing" className="btn-outline">
                  Calculate Estimated Cost
                </Link>
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
