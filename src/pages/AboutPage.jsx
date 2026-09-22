import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function AboutPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'About Us', item: `${CANONICAL_DOMAIN}/about` },
    ],
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
    url: `${CANONICAL_DOMAIN}/about`,
  };

  const specializations = [
    {
      title: 'Waterproof PVC Wall Panels',
      desc: 'Engineered interlocking panels that create an absolute seal against groundwater seepage (seelan), dampness, and crumbling wall paint.',
      icon: '🛡️',
    },
    {
      title: 'Architectural Fluted Louvers',
      desc: 'Contemporary 3D ribbed vertical slats in natural oak, charcoal, and metallic finishes for signature living room and TV backdrops.',
      icon: '║',
    },
    {
      title: 'High-Gloss UV Marble Sheets',
      desc: 'Seamless 8x4 ft engineered panels replicating Italian Statuario, Calacatta, and Nero Marquina at 80% lower cost than natural stone.',
      icon: '💎',
    },
    {
      title: 'Designer False Ceilings',
      desc: 'Waterproof PVC and acoustic false ceilings integrated with warm cove lighting and magnetic magnetic profile track lights.',
      icon: '✨',
    },
    {
      title: 'Custom TV Entertainment Units',
      desc: 'Turnkey media wall styling combining marble backdrops, fluted acoustic slats, floating consoles, and hidden cable management.',
      icon: '📺',
    },
    {
      title: 'Commercial & Retail Interiors',
      desc: 'Durable, low-maintenance wall cladding for clinics, showrooms, corporate offices, and salons throughout Sikar and Shekhawati.',
      icon: '🏢',
    },
  ];

  const milestones = [
    { number: '8+', label: 'Years of Interior Craft' },
    { number: '500+', label: 'Homes Transformed in Sikar' },
    { number: '200+', label: 'Panel Textures & Patterns in Stock' },
    { number: '100%', label: 'Waterproof & Termite Guarantee' },
  ];

  const qualityPillars = [
    {
      title: 'Virgin Polymer Core',
      desc: 'We never use recycled brittle plastics. All our panels feature high-density virgin PVC with impact-resistant mineral stabilization.',
    },
    {
      title: 'UV-Cured Ceramic Scratch Coat',
      desc: 'Our UV marble sheets and fluted surfaces are protected with high-grade polyurethane topcoats that resist scratches, stains, and daily wear.',
    },
    {
      title: 'Climate-Tuned for Rajasthan',
      desc: 'Formulated to withstand Sikar’s extreme temperature swings (from 48°C summers to near-freezing winters) without warping or delamination.',
    },
    {
      title: 'Zero Chemical Off-Gassing',
      desc: 'All materials are non-toxic, eco-friendly, and odorless immediately after installation, making them safe for kids and elderly residents.',
    },
  ];

  return (
    <div className="site-page">
      <SEOHead
        title="About Star Home Design | Sikar's Premier Wall Panel & Interior Showroom"
        description="Learn about Star Home Design, Sikar's leading interior showroom specializing in waterproof PVC panels, fluted louvers, UV marble sheets, and false ceilings on Jaipur-Jhunjhunu Bypass."
        canonicalUrl={`${CANONICAL_DOMAIN}/about`}
        keywords="About Star Home Design Sikar, Interior Decorators Sikar, Wall Panels Showroom Sikar, PVC panel supplier Rajasthan"
        ogType="website"
        schemas={[breadcrumbSchema, localBusinessSchema]}
      />

      <Navbar />

      {/* Hero Header */}
      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">ABOUT STAR HOME DESIGN</span>
            <h1 className="page-title">Transforming Sikar Homes with Modern Architectural Materials</h1>
            <p className="page-subtitle">
              From permanent dampness remedies to high-end luxury focal walls, Star Home Design is dedicated to bringing world-class interior finishing products directly to homeowners, architects, and contractors across Sikar and Shekhawati.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">About Us</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Intro & Origin Story */}
        <section className="about-section">
          <div className="container">
            <div className="about-grid">
              <ScrollReveal>
                <div className="about-content-block">
                  <span className="section-badge">OUR STORY</span>
                  <h2>Pioneering Resilient &amp; Elegant Wall Finishes in Sikar</h2>
                  <p>
                    Founded in the heart of Sikar, Rajasthan, <strong>Star Home Design</strong> emerged with a clear, uncompromising mission: to solve one of the most frustrating problems faced by regional property owners — persistent wall seepage, blistering plaster, and peeling paint — while delivering sophisticated interior aesthetics once reserved only for metropolitan luxury penthouses.
                  </p>
                  <p>
                    Traditional wall treatments like POP, putty, and repeated wall repainting fail within 12 to 24 months due to groundwater dampness (seelan) common across Shekhawati. We introduced heavy-duty, 100% waterproof virgin PVC wall panels and seamless UV marble sheets as permanent, lifetime-grade solutions.
                  </p>
                  <p>
                    Today, our flagship showroom located on the <strong>Jaipur-Jhunjhunu Bypass Road (Opposite Maruti Authorized Service Center)</strong> stands as Sikar’s premier destination for homeowners, commercial designers, and builders seeking tangible material quality and trusted installation expertise.
                  </p>
                  <div style={{ marginTop: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <Link to="/products" className="btn-primary">
                      Explore Materials
                    </Link>
                    <Link to="/contact" className="btn-outline">
                      Visit Showroom
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="about-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=85&auto=format&fit=crop"
                    alt="Star Home Design Showroom Experience in Sikar"
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="700"
                  />
                  <div className="experience-badge">
                    <span className="exp-years">8+</span>
                    <span className="exp-text">Years of Excellence in Sikar</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="about-stats-section">
          <div className="container">
            <div className="stats-cards-grid">
              {milestones.map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 60}>
                  <div className="stat-card">
                    <span className="stat-number">{item.number}</span>
                    <span className="stat-label">{item.label}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Specializations */}
        <section className="about-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">WHAT WE SPECIALIZE IN</span>
              <h2>Comprehensive Wall &amp; Interior Solutions</h2>
              <p className="section-subtitle">
                Engineered materials paired with precision craftsmanship to elevate every residential and commercial space.
              </p>
            </div>

            <div className="specializations-grid">
              {specializations.map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 80}>
                  <div className="spec-card">
                    <div className="spec-icon">{item.icon}</div>
                    <h3 className="spec-title">{item.title}</h3>
                    <p className="spec-desc">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Quality & Materials */}
        <section className="about-section quality-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">MATERIAL QUALITY STANDARDS</span>
              <h2>Why Star Home Design Panels Last Longer</h2>
              <p className="section-subtitle">
                We refuse to stock lightweight, brittle or substandard panels. Every batch meets rigorous durability parameters.
              </p>
            </div>

            <div className="quality-grid">
              {qualityPillars.map((pillar, idx) => (
                <ScrollReveal key={idx} delay={idx * 80}>
                  <div className="quality-card">
                    <div className="quality-card-header">
                      <span className="quality-index">0{idx + 1}</span>
                      <h3>{pillar.title}</h3>
                    </div>
                    <p>{pillar.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="about-section">
          <div className="container">
            <div className="why-choose-box">
              <div className="why-choose-content">
                <span className="section-badge">WHY CHOOSE US</span>
                <h2>Sikar’s Most Reliable Partner for Modern Interiors</h2>
                <ul className="why-choose-list">
                  <li>
                    <strong>Direct Factory Sourcing:</strong> By cutting middleman margins, we provide commercial-grade PVC and UV sheets at honest, wholesale rates.
                  </li>
                  <li>
                    <strong>Experienced In-House Artisans:</strong> Our installers are specialized in panel framing, miter cuts, and invisible joint bonding.
                  </li>
                  <li>
                    <strong>Transparent Sq.Ft Pricing:</strong> Itemized estimates with zero hidden measurement inflations or unexpected surcharges.
                  </li>
                  <li>
                    <strong>Rapid 24 to 48 Hour Turnaround:</strong> Most single-room renovations are completed within 1 to 2 days without civil mess.
                  </li>
                  <li>
                    <strong>Comprehensive 10-Year Warranty:</strong> Guaranteed protection against moisture buckling, surface peeling, and termite decay.
                  </li>
                </ul>
              </div>

              <div className="why-choose-visual">
                <div className="showroom-card-inner">
                  <h4>Visit Our Sikar Showroom</h4>
                  <p className="showroom-address">
                    {BUSINESS_NAP.streetAddress}, Sikar, Rajasthan {BUSINESS_NAP.postalCode}
                  </p>
                  <p className="showroom-hours">Open Daily: {BUSINESS_NAP.openingHours}</p>
                  <div className="showroom-actions">
                    <a href={`tel:${BUSINESS_NAP.rawPhone}`} className="btn-primary">
                      Call {BUSINESS_NAP.phone}
                    </a>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      Showroom Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Ready to Redesign Your Home in Sikar?</h2>
              <p>
                Schedule a free site measurement visit anywhere in Sikar or visit our showroom to touch our full material collection.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Request Free Estimate
                </Link>
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    'Hi Star Home Design, I would like to schedule a free site measurement visit in Sikar.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  Chat on WhatsApp
                </a>
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
