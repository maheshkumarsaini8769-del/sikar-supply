import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${CANONICAL_DOMAIN}/privacy-policy` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Privacy Policy | Star Home Design Sikar"
        description="Privacy Policy for Star Home Design, Sikar, Rajasthan. Learn how we collect, use, and protect your customer information during quotes and consultations."
        canonicalUrl={`${CANONICAL_DOMAIN}/privacy-policy`}
        keywords="Privacy Policy Star Home Design, Sikar Interior Decorator Privacy"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">LEGAL &amp; COMPLIANCE</span>
            <h1 className="page-title">Privacy Policy</h1>
            <p className="page-subtitle">
              Last Updated: March 2026. How Star Home Design safeguards your personal information when you browse our site, request quotations, or book on-site consultations in Sikar.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Privacy Policy</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="legal-content-section">
          <div className="container">
            <div className="legal-document-card">
              <div className="legal-section">
                <h2>1. Introduction &amp; Ownership</h2>
                <p>
                  This Privacy Policy governs the manner in which <strong>Star Home Design</strong> ("we", "our", or "us"), located at Jaipur-Jhunjhunu Bypass Road, Opposite Maruti Authorized Service Center, Sikar, Rajasthan 332001, collects, uses, maintains, and discloses information collected from users (each, a "User") of the website <a href={CANONICAL_DOMAIN}>{CANONICAL_DOMAIN}</a>.
                </p>
              </div>

              <div className="legal-section">
                <h2>2. Personal Identification Information We Collect</h2>
                <p>We may collect personal identification information from Users in a variety of ways, including, but not limited to:</p>
                <ul>
                  <li>When Users request a free on-site measurement or quotation (Name, Phone Number, Locality in Sikar, Room Dimensions).</li>
                  <li>When Users contact us via our consultation forms, phone calls, or WhatsApp messages.</li>
                  <li>When Users visit our showroom and place custom orders for PVC panels, fluted louvers, or UV marble sheets.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>3. How We Use Collected Information</h2>
                <p>Star Home Design uses customer information strictly for legitimate interior business purposes:</p>
                <ul>
                  <li>To calculate accurate, transparent material and installation estimates.</li>
                  <li>To coordinate and schedule free on-site laser measurement visits in Sikar.</li>
                  <li>To deliver official quotations and order status updates via WhatsApp, SMS, or telephone.</li>
                  <li>To honor our 10-year product warranties and after-sales service requests.</li>
                </ul>
              </div>

              <div className="legal-section">
                <h2>4. Zero Third-Party Sale Policy</h2>
                <p>
                  <strong>We do not sell, trade, or rent Users' personal identification information to others.</strong> We do not share your contact details with external advertising networks, telemarketers, or unrelated third parties. Your data is used exclusively by Star Home Design employees and certified installation supervisors.
                </p>
              </div>

              <div className="legal-section">
                <h2>5. Cookies &amp; Web Analytics</h2>
                <p>
                  Our website may use anonymous browser "cookies" and light analytics to enhance User experience, track overall site traffic, and optimize loading speeds. Users may choose to set their web browser to refuse cookies, or to alert them when cookies are being sent.
                </p>
              </div>

              <div className="legal-section">
                <h2>6. Data Security</h2>
                <p>
                  We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information and transaction records.
                </p>
              </div>

              <div className="legal-section">
                <h2>7. Contacting Us About Privacy</h2>
                <p>
                  If you have any questions regarding this Privacy Policy or your personal information, please contact us at:
                </p>
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
