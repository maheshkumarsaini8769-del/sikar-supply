import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function GetQuotePage() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';
  const preselectedProduct = searchParams.get('product') || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locality: '',
    propertyType: 'Independent House / Villa',
    spaceType: 'TV Unit & Media Wall',
    materials: ['PVC Wall Panels'],
    approxArea: '100',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preselectedService) {
      const formatted = preselectedService
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setFormData((prev) => ({
        ...prev,
        notes: `Interested in ${formatted} service. ` + prev.notes,
        materials: Array.from(new Set([...prev.materials, formatted])),
      }));
    }
    if (preselectedProduct) {
      setFormData((prev) => ({
        ...prev,
        notes: `Inquiring about product: ${preselectedProduct}. ` + prev.notes,
      }));
    }
  }, [preselectedService, preselectedProduct]);

  const handleMaterialToggle = (material) => {
    setFormData((prev) => {
      const exists = prev.materials.includes(material);
      const updated = exists
        ? prev.materials.filter((m) => m !== material)
        : [...prev.materials, material];
      return { ...prev, materials: updated.length > 0 ? updated : [material] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your name and 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const waText = `*New Quote Request - Star Home Design Sikar*\n` +
      `👤 Name: ${formData.name}\n` +
      `📞 Phone: ${formData.phone}\n` +
      `📍 Locality: ${formData.locality || 'Sikar'}\n` +
      `🏠 Property: ${formData.propertyType}\n` +
      `📐 Space: ${formData.spaceType}\n` +
      `✨ Materials: ${formData.materials.join(', ')}\n` +
      `📏 Approx Area: ${formData.approxArea} sq.ft\n` +
      (formData.notes ? `📝 Notes: ${formData.notes}\n` : '');

    try {
      // Post to existing order backend
      await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          phone: formData.phone,
          items: formData.materials.map((m) => ({ name: m, quantity: 1, price: 0 })),
          total: 0,
          notes: `${formData.propertyType} | ${formData.spaceType} | Area: ${formData.approxArea} sq.ft | Locality: ${formData.locality} | ${formData.notes}`,
          source: 'get-quote-page',
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
      { '@type': 'ListItem', position: 2, name: 'Get Free Quote', item: `${CANONICAL_DOMAIN}/get-quote` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Get Free Quote & Site Measurement in Sikar | Star Home Design"
        description="Request a free on-site visit and itemized quote for PVC wall panels, fluted louvers, UV marble sheets, and false ceilings in Sikar. Zero obligation."
        canonicalUrl={`${CANONICAL_DOMAIN}/get-quote`}
        keywords="Get Quote Sikar, Wall Panels Estimation Sikar, Free Site Visit Interior Sikar, Star Home Design Consultation"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">ZERO OBLIGATION ESTIMATE</span>
            <h1 className="page-title">Request Your Free On-Site Measurement &amp; Quote</h1>
            <p className="page-subtitle">
              Tell us about your room or property in Sikar. We will inspect your wall condition, take precision laser measurements, bring actual texture samples, and deliver a transparent quotation.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Get Free Quote</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="quote-form-section">
          <div className="container">
            <div className="quote-page-layout">
              {/* Left Column: The Form */}
              <div className="quote-form-card">
                {submitted ? (
                  <div className="quote-success-state">
                    <div className="success-icon">✓</div>
                    <h2>Thank You, {formData.name}!</h2>
                    <p>
                      Your quotation request has been received. Our Sikar interior specialist will call you at <strong>{formData.phone}</strong> within 2 hours to confirm your preferred time for the free site measurement visit.
                    </p>
                    <div className="success-actions">
                      <a
                        href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                          `Hi Star Home Design, I just submitted a quote request on your website for ${formData.spaceType} in ${formData.locality || 'Sikar'}. Let's discuss details!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ display: 'block', textAlign: 'center', marginBottom: '14px' }}
                      >
                        Open WhatsApp Directly
                      </a>
                      <button
                        className="btn-outline"
                        style={{ width: '100%' }}
                        onClick={() => setSubmitted(false)}
                      >
                        Submit Another Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="quote-detailed-form">
                    <h2 className="form-heading">Project &amp; Location Details</h2>
                    <p className="form-subheading">Fill in the details below to receive your personalized estimate.</p>

                    {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

                    {/* Personal Info */}
                    <div className="form-grid-2">
                      <div className="quote-field">
                        <label>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="quote-field">
                        <label>Mobile Number (for WhatsApp quote) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 98290 12345"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="quote-field">
                        <label>Locality / Area in Sikar *</label>
                        <input
                          type="text"
                          placeholder="e.g. Piprali Road, Radhakishanpura, Bypass"
                          value={formData.locality}
                          onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        />
                      </div>

                      <div className="quote-field">
                        <label>Property Type</label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        >
                          <option>Independent House / Villa</option>
                          <option>Apartment / Flat</option>
                          <option>Commercial Office / Clinic</option>
                          <option>Retail Showroom / Shop</option>
                          <option>Hotel / Cafe / Restaurant</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="quote-field">
                        <label>Space to Transform</label>
                        <select
                          value={formData.spaceType}
                          onChange={(e) => setFormData({ ...formData, spaceType: e.target.value })}
                        >
                          <option>TV Unit &amp; Feature Media Wall</option>
                          <option>Living Room Complete Makeover</option>
                          <option>Master Bedroom Bed Backdrop</option>
                          <option>Waterproof Wall Seepage Remedy</option>
                          <option>PVC False Ceiling System</option>
                          <option>Full House Turnkey Interior</option>
                        </select>
                      </div>

                      <div className="quote-field">
                        <label>Approximate Area (sq.ft)</label>
                        <input
                          type="number"
                          placeholder="e.g. 120"
                          value={formData.approxArea}
                          onChange={(e) => setFormData({ ...formData, approxArea: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Materials Checkbox Selection */}
                    <div className="quote-field">
                      <label>Materials You Are Interested In:</label>
                      <div className="quote-checkboxes-grid">
                        {[
                          'PVC Wall Panels',
                          'Fluted Louver Panels',
                          'UV Marble Sheets',
                          'False Ceiling Rafters',
                          'WPC Exterior Cladding',
                          'Acoustic Felt Slats',
                        ].map((mat) => (
                          <label
                            key={mat}
                            className={`quote-pill-checkbox ${
                              formData.materials.includes(mat) ? 'selected' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.materials.includes(mat)}
                              onChange={() => handleMaterialToggle(mat)}
                            />
                            <span>{mat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Specific Requirements / Notes */}
                    <div className="quote-field">
                      <label>Specific Requirements or Questions (Optional)</label>
                      <textarea
                        rows="3"
                        placeholder="Mention any wall dampness issues, preferred color palettes, or desired installation dates..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary quote-submit-btn">
                      {loading ? 'Processing Your Request...' : 'Submit Request for Free Site Visit'}
                    </button>
                    <p className="form-privacy-note">
                      🔒 Your contact information is kept strictly private and used exclusively for your quotation.
                    </p>
                  </form>
                )}
              </div>

              {/* Right Column: Trust & Showroom Details */}
              <div className="quote-info-sidebar">
                <div className="quote-trust-card">
                  <span className="section-badge">WHAT TO EXPECT</span>
                  <h3>Why Book a Free Site Measurement?</h3>
                  <ul className="quote-benefits-list">
                    <li>
                      <div className="q-icon">📏</div>
                      <div>
                        <strong>Accurate Laser Measurements</strong>
                        <p>Eliminate material over-ordering or costly measurement errors.</p>
                      </div>
                    </li>
                    <li>
                      <div className="q-icon">💼</div>
                      <div>
                        <strong>Real Physical Swatch Samples</strong>
                        <p>Touch 3D fluted slats, woodgrains, and marble gloss right in your room lighting.</p>
                      </div>
                    </li>
                    <li>
                      <div className="q-icon">🛡️</div>
                      <div>
                        <strong>Dampness &amp; Masonry Audit</strong>
                        <p>We check for wall seepage and prescribe the right sub-framing solution.</p>
                      </div>
                    </li>
                    <li>
                      <div className="q-icon">📄</div>
                      <div>
                        <strong>Fixed-Price Itemized Quote</strong>
                        <p>Receive an exact, transparent cost breakdown within hours.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="quote-showroom-box">
                  <h4>Prefer to visit our Showroom first?</h4>
                  <p>
                    Inspect 200+ full-scale panel displays at our showroom on <strong>Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar</strong>.
                  </p>
                  <div className="quote-direct-contact">
                    <a href={`tel:${BUSINESS_NAP.rawPhone}`} className="direct-phone-link">
                      📞 Call {BUSINESS_NAP.phone}
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
