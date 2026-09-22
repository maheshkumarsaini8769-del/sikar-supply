import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'PVC Wall Panels',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setLoading(true);

    const waText = `*Contact Enquiry - Star Home Design Sikar*\n` +
      `👤 Name: ${formData.name}\n` +
      `📞 Phone: ${formData.phone}\n` +
      (formData.email ? `📧 Email: ${formData.email}\n` : '') +
      `✨ Interested in: ${formData.service}\n` +
      (formData.message ? `💬 Message: ${formData.message}\n` : '');

    try {
      await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          phone: formData.phone,
          items: [{ name: formData.service, quantity: 1, price: 0 }],
          total: 0,
          notes: `Contact Page Consultation | Email: ${formData.email} | ${formData.message}`,
          source: 'contact-page',
          whatsappMessage: waText,
        }),
      });
    } catch {
      // Backend failure should not block user experience
    }

    setLoading(false);
    setSubmitted(true);
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${CANONICAL_DOMAIN}/contact` },
    ],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: BUSINESS_NAP.name,
    telephone: BUSINESS_NAP.rawPhone,
    email: BUSINESS_NAP.email,
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:00',
        closes: '17:00',
      },
    ],
    url: `${CANONICAL_DOMAIN}/contact`,
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Contact Star Home Design Sikar | Showroom Location, Phone & Directions"
        description="Visit Star Home Design showroom on Jaipur-Jhunjhunu Bypass Road, Sikar (Opp. Maruti Service Center). Phone: +91 82394 09535. Free site consultation & quotes."
        canonicalUrl={`${CANONICAL_DOMAIN}/contact`}
        keywords="Contact Star Home Design, Wall Panels Showroom Sikar, PVC Panels Shop Sikar, Star Home Design Location Sikar"
        ogType="website"
        schemas={[breadcrumbSchema, localBusinessSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">VISIT OUR SHOWROOM</span>
            <h1 className="page-title">Contact Star Home Design in Sikar</h1>
            <p className="page-subtitle">
              Have a question about wall panels, UV sheets, or installation timelines? Visit our showroom, call us directly, or book a free on-site design consultation.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Contact Us</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Contact Info Cards */}
        <section className="contact-info-section">
          <div className="container">
            <div className="contact-cards-grid">
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Showroom Address</h3>
                <p>{BUSINESS_NAP.streetAddress}</p>
                <p>Sikar, Rajasthan {BUSINESS_NAP.postalCode}</p>
                <span className="contact-subtext">(Opposite Maruti Authorized Service Center)</span>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Direct Phone &amp; WhatsApp</h3>
                <p>
                  <a href={`tel:${BUSINESS_NAP.rawPhone}`} className="contact-link-highlight">
                    {BUSINESS_NAP.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`https://wa.me/${BUSINESS_NAP.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link-highlight"
                  >
                    WhatsApp: +91 {BUSINESS_NAP.whatsapp}
                  </a>
                </p>
                <span className="contact-subtext">Immediate response during showroom hours</span>
              </div>

              <div className="contact-card">
                <div className="contact-icon">⏰</div>
                <h3>Business Hours</h3>
                <p><strong>Mon – Sat:</strong> 10:00 AM – 8:00 PM</p>
                <p><strong>Sunday:</strong> 11:00 AM – 5:00 PM</p>
                <span className="contact-subtext">Walk-ins always welcome</span>
              </div>

              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <h3>Email Inquiries</h3>
                <p>
                  <a href={`mailto:${BUSINESS_NAP.email}`} className="contact-link-highlight">
                    {BUSINESS_NAP.email}
                  </a>
                </p>
                <p className="contact-subtext">Commercial blueprints &amp; contractor quotes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form + Map Layout */}
        <section className="about-section">
          <div className="container">
            <div className="contact-main-grid">
              {/* Consultation Form */}
              <div className="contact-form-col">
                <div className="contact-form-wrapper">
                  <span className="section-badge">MESSAGE US</span>
                  <h2>Book a Consultation or Inquiry</h2>
                  <p>Send your message and our team will get back to you promptly.</p>

                  {submitted ? (
                    <div className="form-success-box">
                      <div className="success-check">✓</div>
                      <h3>Message Sent Successfully!</h3>
                      <p>
                        Thank you, {formData.name}. We will reach out to you at {formData.phone} shortly.
                      </p>
                      <a
                        href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                          `Hi Star Home Design, I sent a consultation inquiry on your contact page regarding ${formData.service}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ marginTop: '16px', display: 'inline-block' }}
                      >
                        Connect on WhatsApp Now
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="contact-form">
                      <div className="form-group-row">
                        <div className="input-group">
                          <label>Your Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Anil Choudhary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="input-group">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 98290 12345"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="input-group">
                          <label>Email Address (Optional)</label>
                          <input
                            type="email"
                            placeholder="e.g. anil@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="input-group">
                          <label>Product / Service Needed</label>
                          <select
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          >
                            <option>PVC Wall Panels</option>
                            <option>Fluted Louver Panels</option>
                            <option>UV Marble Sheets</option>
                            <option>PVC False Ceiling</option>
                            <option>TV Unit Styling</option>
                            <option>Commercial Interior</option>
                            <option>General Showroom Inquiry</option>
                          </select>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Your Message or Room Requirements</label>
                        <textarea
                          rows="4"
                          placeholder="Tell us about your room size, location in Sikar, or any questions you have..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>

                      <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Sending Message...' : 'Send Consultation Request'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Map & Landmark Directions */}
              <div className="contact-map-col">
                <div className="map-card">
                  <h3>Showroom Location Map</h3>
                  <div className="map-iframe-container">
                    <iframe
                      title="Star Home Design Showroom Location Sikar"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113337.89269584742!2d75.06456300439453!3d27.609438999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396ca371077be0ef%3A0xe54e60ca213e8ca7!2sSikar%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                      width="100%"
                      height="320"
                      style={{ border: 0, borderRadius: '8px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="landmark-directions">
                    <h4>How to Reach Us:</h4>
                    <ul className="landmark-list">
                      <li>
                        <strong>From Kalyan Circle:</strong> Drive north towards Jhunjhunu Bypass (approx. 7 mins). We are located opposite the Maruti Authorized Service Center.
                      </li>
                      <li>
                        <strong>From Piprali Road:</strong> Take the bypass connector road west towards Jhunjhunu Highway (approx. 5 mins).
                      </li>
                      <li>
                        <strong>From Sikar Railway Station:</strong> Take Station Road toward the bypass (approx. 10 mins).
                      </li>
                    </ul>
                    <a
                      href="https://maps.google.com/?q=Star+Home+Design+Jaipur-Jhunjhunu+Bypass+Road+Sikar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline btn-sm"
                      style={{ marginTop: '12px', display: 'inline-block' }}
                    >
                      Open in Google Maps App &rarr;
                    </a>
                  </div>
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
