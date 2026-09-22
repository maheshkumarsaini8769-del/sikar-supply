import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function CancellationRefundPolicyPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Cancellation & Refund Policy', item: `${CANONICAL_DOMAIN}/cancellation-refund-policy` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Cancellation & Refund Policy | Star Home Design Sikar"
        description="Learn about Star Home Design's cancellation, replacement, and refund policies for wall panels, UV sheets, and installation contracts in Sikar, Rajasthan."
        canonicalUrl={`${CANONICAL_DOMAIN}/cancellation-refund-policy`}
        keywords="Cancellation Policy Star Home Design, Refund Policy Wall Panels Sikar"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">CUSTOMER PROTECTION</span>
            <h1 className="page-title">Cancellation &amp; Refund Policy</h1>
            <p className="page-subtitle">
              Last Updated: March 2026. Fair, transparent guidelines on project cancellations, transit damage replacements, and material return procedures in Sikar.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Cancellation &amp; Refund Policy</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="legal-content-section">
          <div className="container">
            <div className="legal-document-card">
              <div className="legal-section">
                <h2>1. Commitment to Customer Satisfaction</h2>
                <p>
                  At <strong>Star Home Design</strong>, customer satisfaction and trust are foundational to our reputation in Sikar. We strive to provide transparent terms for order cancellations, replacements, and refunds.
                </p>
              </div>

              <div className="legal-section">
                <h2>2. Project Cancellation Prior to Commencement</h2>
                <ul>
                  <li>
                    <strong>Within 24 Hours of Booking:</strong> You may cancel any scheduled installation project within 24 hours of booking for a full refund of your token deposit, provided materials have not yet been custom-cut or dispatched from our warehouse.
                  </li>
                  <li>
                    <strong>After Materials Are Dispatched:</strong> If materials have already arrived at your site, standard restocking and local delivery charges (typically ₹1,000–₹1,500 in Sikar municipal area) will be deducted from the token advance.
                  </li>
                  <li>
                    <strong>Once Installation Has Commenced:</strong> Projects cannot be cancelled once wall framing, adhesive bonding, or panel cutting has begun.
                  </li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>3. Standard Stock Material Returns &amp; Exchanges</h2>
                <p>For standard, un-cut panels purchased directly from our Sikar showroom:</p>
                <ul>
                  <li>Unopened, un-cut standard panels in their original factory protective film may be exchanged or returned within <strong>7 days</strong> of delivery.</li>
                  <li>Any returned materials must be in pristine, resalable condition without chips, scratches, or adhesive residue.</li>
                  <li>Custom-milled profiles, specially sourced non-stock colors, or panels that have been cut to custom room heights are non-returnable.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>4. Transit Damage &amp; Defect Replacement Guarantee</h2>
                <p>
                  In the rare event that any UV marble sheet or fluted panel arrives at your site with transport damage (chipped corners, surface scuffs, or manufacturing grain flaws):
                </p>
                <ul>
                  <li>Notify our site supervisor or WhatsApp us at <strong>+91 82394 09535</strong> immediately upon delivery.</li>
                  <li>We will replace the damaged panel <strong>100% free of charge</strong> within 24 hours directly from our local Sikar warehouse ready-stock.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>5. Refund Processing Timeline</h2>
                <p>
                  Approved refunds will be processed via the original payment method (Bank Transfer, UPI, or Cash Receipt) within <strong>3 to 5 business days</strong> of material inspection and return approval.
                </p>
              </div>

              <div className="legal-section">
                <h2>6. How to Request a Cancellation or Replacement</h2>
                <p>
                  To request an order modification, replacement, or cancellation, please visit our showroom or reach us at:
                </p>
                <div className="legal-contact-box">
                  <p><strong>Star Home Design</strong></p>
                  <p>{BUSINESS_NAP.streetAddress}, Sikar, Rajasthan {BUSINESS_NAP.postalCode}</p>
                  <p>Phone / WhatsApp: <a href={`tel:${BUSINESS_NAP.rawPhone}`}>{BUSINESS_NAP.phone}</a></p>
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
