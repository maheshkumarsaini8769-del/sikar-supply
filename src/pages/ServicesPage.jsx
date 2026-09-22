import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { SERVICES_LIST } from '../data/servicesData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ServicesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${CANONICAL_DOMAIN}/services` },
    ],
  };

  const servicesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Interior & Wall Panel Services in Sikar',
    description: 'Complete range of wall panel installation, false ceilings, TV units, and interior decoration services in Sikar, Rajasthan.',
    numberOfItems: SERVICES_LIST.length,
    itemListElement: SERVICES_LIST.map((srv, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: srv.title,
        description: srv.shortDesc,
        url: `${CANONICAL_DOMAIN}/services/${srv.slug}`,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          name: BUSINESS_NAP.name,
        },
      },
    })),
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Interior & Wall Panel Installation Services in Sikar | Star Home Design"
        description="Explore 9 specialized interior decoration services in Sikar: waterproof PVC wall panels, fluted louvers, UV marble sheets, false ceilings, TV units & commercial fitouts."
        canonicalUrl={`${CANONICAL_DOMAIN}/services`}
        keywords="Wall Panel Installation Sikar, PVC Wall Panels Sikar, False Ceiling Sikar, UV Marble Sheet Installation Sikar, TV Unit Design Sikar"
        ogType="website"
        schemas={[breadcrumbSchema, servicesListSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">OUR SPECIALIZED SERVICES</span>
            <h1 className="page-title">Professional Wall Cladding &amp; Interior Services in Sikar</h1>
            <p className="page-subtitle">
              From damp-proofing crumbling walls with waterproof PVC to crafting architectural marble backdrops and luxury ceilings, we provide turnkey execution with premium materials and certified craftsmen.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Services</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Services Grid */}
        <section className="services-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">END-TO-END EXECUTION</span>
              <h2>Explore Our 9 Signature Services</h2>
              <p className="section-subtitle">
                Each service is delivered with direct factory materials, laser-precise framing, and our 10-year anti-moisture warranty.
              </p>
            </div>

            <div className="services-grid">
              {SERVICES_LIST.map((service, idx) => (
                <ScrollReveal key={service.slug} delay={idx * 50}>
                  <div className="service-card">
                    <div className="service-img-wrapper">
                      <img
                        src={service.image}
                        alt={`${service.title} in Sikar`}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="400"
                      />
                      <span className="service-badge">{service.badge}</span>
                      <span className="service-price-tag">From {service.startingPrice}</span>
                    </div>
                    <div className="service-body">
                      <div className="service-title-row">
                        <span className="service-icon" aria-hidden="true">{service.icon}</span>
                        <h3>{service.title}</h3>
                      </div>
                      <p className="service-short-desc">{service.shortDesc}</p>
                      
                      <ul className="service-features-list">
                        {service.features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx}>
                            <span className="check-icon">✓</span> {feat}
                          </li>
                        ))}
                      </ul>

                      <div className="service-card-footer">
                        <Link to={`/services/${service.slug}`} className="btn-service-detail">
                          Explore Service &rarr;
                        </Link>
                        <a
                          href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                            `Hi Star Home Design, I am interested in ${service.title} in Sikar. Please share cost estimate and details.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-service-wa"
                          aria-label={`Inquire about ${service.title} on WhatsApp`}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why Our Installation Beats Local Contractors */}
        <section className="about-section quality-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">THE STAR HOME DESIGN ADVANTAGE</span>
              <h2>How We Deliver Precision Workmanship</h2>
              <p className="section-subtitle">
                Installing architectural wall panels requires laser alignment, specialized framing, and concealed fastening.
              </p>
            </div>

            <div className="quality-grid">
              <ScrollReveal delay={50}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">01</span>
                    <h3>Laser-Calibrated Alignment</h3>
                  </div>
                  <p>
                    We never rely on guesswork. Every wall and ceiling panel is positioned using 3D laser levels to guarantee perfectly straight vertical joints.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">02</span>
                    <h3>Anti-Moisture Sub-Framing</h3>
                  </div>
                  <p>
                    On damp walls, we construct an isolated galvanized channel or PVC runner frame so moisture never makes direct contact with panel face.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">03</span>
                    <h3>Invisible Joint Sealing</h3>
                  </div>
                  <p>
                    Engineered tongue-and-groove click locks and matched metallic T-trims eliminate unsightly gaps, creating seamless continuous surfaces.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">04</span>
                    <h3>Post-Work Deep Cleaning</h3>
                  </div>
                  <p>
                    Our crews respect your living space. We pack up cutting scraps, vacuum dust, and leave your freshly renovated room ready to live in.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Need Help Choosing the Right Material for Your Home?</h2>
              <p>
                Our interior consultants can visit your location in Sikar to inspect your walls, take measurements, and show you physical samples.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Request Free Site Visit
                </Link>
                <Link to="/pricing" className="btn-outline">
                  Calculate Instant Cost
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
