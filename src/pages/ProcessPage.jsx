import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PROCESS_STEPS } from '../data/processData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProcessPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Process', item: `${CANONICAL_DOMAIN}/process` },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How Star Home Design Executes Wall Panel & Interior Transformations in Sikar',
    description: 'Our smooth 9-step turnkey process from initial consultation and free laser site measurement to master craftsman panel installation and warranty handover.',
    step: PROCESS_STEPS.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.description,
    })),
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Our 9-Step Interior Execution Process in Sikar | Star Home Design"
        description="Discover how Star Home Design transforms rooms in 9 smooth steps: free site laser measurement in Sikar, material selection, transparent quote, and rapid 24-48hr installation."
        canonicalUrl={`${CANONICAL_DOMAIN}/process`}
        keywords="Interior Design Process Sikar, Wall Panel Installation Steps, Home Renovation Sikar, Star Home Design Process"
        ogType="website"
        schemas={[breadcrumbSchema, howToSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">OUR STEP-BY-STEP WORKFLOW</span>
            <h1 className="page-title">The 9-Step Journey to Your Flawless Interior</h1>
            <p className="page-subtitle">
              We have eliminated the chaos, dust, delays, and unexpected costs of traditional interior renovations. Here is exactly how we take your home from consultation to final handover in Sikar.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Process</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="process-timeline-section">
          <div className="container">
            <div className="process-timeline-wrapper">
              {PROCESS_STEPS.map((step, idx) => (
                <ScrollReveal key={step.step} delay={idx * 60}>
                  <div className={`process-step-item ${idx % 2 === 1 ? 'reverse' : ''}`}>
                    <div className="process-step-number-col">
                      <div className="step-badge-circle">
                        <span className="step-num">{step.step}</span>
                        <span className="step-icon">{step.icon}</span>
                      </div>
                      {idx < PROCESS_STEPS.length - 1 && <div className="step-connector-line" />}
                    </div>

                    <div className="process-step-content-card">
                      <div className="step-card-header">
                        <span className="step-duration-badge">⏱ {step.duration}</span>
                        <h3>{step.title}</h3>
                        <p className="step-subtitle">{step.subtitle}</p>
                      </div>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* The 3 Zero-Risk Guarantees */}
        <section className="about-section quality-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">PEACE OF MIND</span>
              <h2>Our Three Core Commitments to Every Client</h2>
              <p className="section-subtitle">
                Renovations shouldn't be stressful. We back our process with concrete guarantees.
              </p>
            </div>

            <div className="grid-3">
              <ScrollReveal delay={50}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">01</span>
                    <h3>Fixed-Price Guarantee</h3>
                  </div>
                  <p>
                    Once our on-site measurement is complete and your quote is signed, your price is 100% locked. Zero unexpected mid-project price spikes.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">02</span>
                    <h3>Clean Workspace Pledge</h3>
                  </div>
                  <p>
                    Our technicians use high-efficiency dust collection tools during trimming, protect your existing floors, and vacuum before departure.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="quality-card">
                  <div className="quality-card-header">
                    <span className="quality-index">03</span>
                    <h3>10-Year Moisture Warranty</h3>
                  </div>
                  <p>
                    All PVC panel and UV marble sheet installations are protected against warping, buckling, and termite decay under Rajasthan climate conditions.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Start Step 1 Banner */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Ready to Begin Step 1?</h2>
              <p>
                Schedule your free, zero-obligation site measurement visit anywhere in Sikar today.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Start Step 1: Request Quote
                </Link>
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    'Hi Star Home Design, I would like to book an on-site consultation to discuss my wall panel project in Sikar.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  Message on WhatsApp
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
