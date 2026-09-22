import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function TermsConditionsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Terms & Conditions', item: `${CANONICAL_DOMAIN}/terms-and-conditions` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Terms and Conditions | Star Home Design Sikar"
        description="Official Terms and Conditions for interior material supply and installation services provided by Star Home Design in Sikar, Rajasthan."
        canonicalUrl={`${CANONICAL_DOMAIN}/terms-and-conditions`}
        keywords="Terms and Conditions Star Home Design, Sikar Interior Contract Terms"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">TERMS OF SERVICE</span>
            <h1 className="page-title">Terms &amp; Conditions</h1>
            <p className="page-subtitle">
              Last Updated: March 2026. Standard terms governing material purchases, site measurements, quotations, and on-site panel installations across Sikar and Shekhawati.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Terms &amp; Conditions</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="legal-content-section">
          <div className="container">
            <div className="legal-document-card">
              <div className="legal-section">
                <h2>1. Agreement to Terms</h2>
                <p>
                  By accessing our website, purchasing materials, or commissioning installation services from <strong>Star Home Design</strong>, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services or website.
                </p>
              </div>

              <div className="legal-section">
                <h2>2. Quotations &amp; Pricing Validity</h2>
                <ul>
                  <li>All official price estimates and itemized quotations issued by Star Home Design are valid for <strong>30 days</strong> from the date of issuance.</li>
                  <li>Online calculator estimates are indicative; final contractual pricing is confirmed only after our technical laser on-site measurement is performed.</li>
                  <li>All prices are quoted in Indian Rupees (INR) and include applicable taxes unless specifically stated otherwise.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>3. Site Readiness &amp; Execution Access</h2>
                <p>To ensure timely, high-precision installation without delays, clients are requested to ensure:</p>
                <ul>
                  <li>Working electrical power supply (220V AC) is available on site for miter saws and laser alignment equipment.</li>
                  <li>Furniture and personal belongings adjacent to the target installation walls are relocated or suitably protected.</li>
                  <li>In cases of active groundwater seepage or wet masonry, the client must permit the installation of our recommended anti-dampness sub-frame batten system to ensure long-term durability.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>4. Payment Schedules</h2>
                <p>Standard payment milestones for installation projects in Sikar:</p>
                <ul>
                  <li><strong>Token Advance:</strong> Required upon design finalization to schedule installers and allocate stock from our Sikar warehouse.</li>
                  <li><strong>Material Delivery:</strong> Upon unloading of certified panels and profiles at the client's premises.</li>
                  <li><strong>Final Balance:</strong> Payable immediately upon joint inspection, quality audit, and project handover.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>5. 10-Year Product Warranty Coverage</h2>
                <p>
                  Star Home Design warrants that virgin PVC panels and UV marble sheets supplied by us will remain free from manufacturing defects, moisture decay, swelling, delamination, and termite damage for a period of <strong>10 years</strong> from installation date.
                </p>
                <p>
                  <strong>Exclusions:</strong> The warranty does not cover damages caused by severe structural building settlement, external mechanical impact (hammering, heavy scratches from sharp metal objects), unauthorized third-party modifications, or natural disasters.
                </p>
              </div>

              <div className="legal-section">
                <h2>6. Governing Law &amp; Jurisdiction</h2>
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Sikar, Rajasthan</strong>.
                </p>
              </div>

              <div className="legal-section">
                <h2>7. Contact Information</h2>
                <div className="legal-contact-box">
                  <p><strong>Star Home Design</strong></p>
                  <p>{BUSINESS_NAP.streetAddress}, Sikar, Rajasthan {BUSINESS_NAP.postalCode}</p>
                  <p>Phone: <a href={`tel:${BUSINESS_NAP.rawPhone}`}>{BUSINESS_NAP.phone}</a></p>
                  <p>Email: <a href={`mailto:${BUSINESS_NAP.email}`}>{BUSINESS_NAP.email}</a></p>
                </div>
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
