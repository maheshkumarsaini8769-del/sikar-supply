import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PRICING_MATERIALS_COMPARISON, COST_FACTORS, ESTIMATOR_CONFIG } from '../data/pricingData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function PricingPage() {
  // Calculator state
  const [selectedProperty, setSelectedProperty] = useState(ESTIMATOR_CONFIG.propertyTypes[0].id);
  const [selectedRoom, setSelectedRoom] = useState(ESTIMATOR_CONFIG.rooms[1].id); // TV unit default
  const [customArea, setCustomArea] = useState(80);
  const [selectedService, setSelectedService] = useState(ESTIMATOR_CONFIG.services[1].id); // Fluted louvers default
  const [includeLed, setIncludeLed] = useState(true);
  const [includeTrims, setIncludeTrims] = useState(true);
  const [includeSubframing, setIncludeSubframing] = useState(false);

  // Update default area when room selection changes
  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    const foundRoom = ESTIMATOR_CONFIG.rooms.find((r) => r.id === roomId);
    if (foundRoom) {
      setCustomArea(foundRoom.defaultArea);
    }
  };

  // Calculation logic
  const calculation = useMemo(() => {
    const propertyObj = ESTIMATOR_CONFIG.propertyTypes.find((p) => p.id === selectedProperty) || ESTIMATOR_CONFIG.propertyTypes[0];
    const serviceObj = ESTIMATOR_CONFIG.services.find((s) => s.id === selectedService) || ESTIMATOR_CONFIG.services[0];
    const area = Number(customArea) || 50;

    let baseRate = serviceObj.rate;
    if (includeLed) baseRate += 18;
    if (includeTrims) baseRate += 12;
    if (includeSubframing) baseRate += 15;

    const adjustedRate = baseRate * propertyObj.multiplier;
    const baseTotal = Math.round(adjustedRate * area);
    const minEstimate = Math.round(baseTotal * 0.95);
    const maxEstimate = Math.round(baseTotal * 1.12);

    return {
      area,
      serviceName: serviceObj.label,
      minEstimate,
      maxEstimate,
    };
  }, [selectedProperty, selectedService, customArea, includeLed, includeTrims, includeSubframing]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${CANONICAL_DOMAIN}/pricing` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Wall Panel & Interior Pricing Sikar | Material Cost & Calculator | Star Home Design"
        description="Transparent pricing guide for PVC wall panels, fluted louvers, UV marble sheets, and false ceilings in Sikar. Compare materials and calculate your instant estimated project cost."
        canonicalUrl={`${CANONICAL_DOMAIN}/pricing`}
        keywords="Wall Panel Price Sikar, PVC Wall Panels Cost Sikar, Fluted Louvers Rate, UV Marble Sheet Price Sikar, Interior Cost Calculator"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">TRANSPARENT VALUE</span>
            <h1 className="page-title">Wall Panel Material Comparison &amp; Instant Cost Estimator</h1>
            <p className="page-subtitle">
              We believe in 100% upfront pricing. Compare rates across all interior materials and use our interactive calculator to estimate your room makeover in Sikar.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Pricing</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Interactive Estimator Calculator */}
        <section className="pricing-calc-section">
          <div className="container">
            <div className="pricing-calculator-card">
              <div className="calc-header">
                <span className="section-badge">INTERACTIVE CALCULATOR</span>
                <h2>Estimate Your Interior Transformation Cost</h2>
                <p>Select your room type, wall size, and preferred finishes to view an instant estimate.</p>
              </div>

              <div className="calc-grid">
                {/* Form Controls */}
                <div className="calc-controls">
                  <div className="calc-control-group">
                    <label>1. Property Type</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="calc-select"
                    >
                      {ESTIMATOR_CONFIG.propertyTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="calc-control-group">
                    <label>2. Space / Area to Decorate</label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="calc-select"
                    >
                      {ESTIMATOR_CONFIG.rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label} (~{r.defaultArea} sq.ft)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="calc-control-group">
                    <label>3. Approximate Wall Area (sq.ft)</label>
                    <div className="calc-input-with-range">
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={customArea}
                        onChange={(e) => setCustomArea(Number(e.target.value))}
                        className="calc-number-input"
                      />
                      <input
                        type="range"
                        min="30"
                        max="600"
                        step="10"
                        value={customArea}
                        onChange={(e) => setCustomArea(Number(e.target.value))}
                        className="calc-range-slider"
                      />
                    </div>
                  </div>

                  <div className="calc-control-group">
                    <label>4. Preferred Material &amp; Finish</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="calc-select"
                    >
                      {ESTIMATOR_CONFIG.services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label} (~₹{s.rate}/sq.ft)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="calc-control-group">
                    <label>5. Optional Enhancements</label>
                    <div className="calc-checkbox-group">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={includeLed}
                          onChange={(e) => setIncludeLed(e.target.checked)}
                        />
                        <span>Warm LED Strip Lighting &amp; Aluminum Profiles (+₹18/sq.ft)</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={includeTrims}
                          onChange={(e) => setIncludeTrims(e.target.checked)}
                        />
                        <span>Metallic Champagne Gold / Black Edge Trims (+₹12/sq.ft)</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={includeSubframing}
                          onChange={(e) => setIncludeSubframing(e.target.checked)}
                        />
                        <span>Anti-Dampness Framework Battens (for damp walls) (+₹15/sq.ft)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Calculation Result Box */}
                <div className="calc-result-box">
                  <div className="result-header">
                    <span className="result-badge">ESTIMATED INVESTMENT</span>
                    <h3 className="result-price-range">
                      ₹{calculation.minEstimate.toLocaleString('en-IN')} – ₹{calculation.maxEstimate.toLocaleString('en-IN')}
                    </h3>
                    <p className="result-sub">
                      Estimated Turnkey Cost for {calculation.area} sq.ft ({calculation.serviceName})
                    </p>
                  </div>

                  <div className="result-breakdown">
                    <div className="breakdown-row">
                      <span>Area:</span>
                      <strong>{calculation.area} sq.ft</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Material:</span>
                      <strong>{calculation.serviceName}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Includes:</span>
                      <span>Supply, Laser Installation &amp; Warranty</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Completion Time:</span>
                      <span>1 to 2 Working Days</span>
                    </div>
                  </div>

                  <div className="result-actions">
                    <a
                      href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                        `Hi Star Home Design, I calculated an estimate of ₹${calculation.minEstimate.toLocaleString('en-IN')} - ₹${calculation.maxEstimate.toLocaleString('en-IN')} on your website for ${calculation.area} sq.ft of ${calculation.serviceName}. Can you schedule an on-site visit to inspect the site and confirm the final quote?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}
                    >
                      Book Free On-Site Measurement
                    </a>
                    <Link
                      to="/get-quote"
                      className="btn-outline"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      Request Detailed Itemized Quote
                    </Link>
                  </div>
                  <p className="result-disclaimer">
                    *Estimates are indicative based on standard room geometries. Exact price is confirmed after laser site measurement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Material Comparison Table */}
        <section className="about-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">SIDE-BY-SIDE MATRIX</span>
              <h2>Compare Materials, Rates &amp; Performance</h2>
              <p className="section-subtitle">
                Understand how each panel category performs under everyday conditions and local Rajasthan weather.
              </p>
            </div>

            <div className="pricing-table-scroll">
              <table className="pricing-comparison-table">
                <thead>
                  <tr>
                    <th>Material Type</th>
                    <th>Average Rate</th>
                    <th>Durability</th>
                    <th>Water Resistance</th>
                    <th>Best Suited For</th>
                    <th>Maintenance</th>
                    <th>Install Time</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_MATERIALS_COMPARISON.map((row, idx) => (
                    <tr key={idx}>
                      <td className="mat-name-cell">
                        <strong>{row.material}</strong>
                      </td>
                      <td className="mat-price-cell">{row.range}</td>
                      <td>{row.durability}</td>
                      <td>{row.waterResistance}</td>
                      <td>{row.bestFor}</td>
                      <td>{row.maintenance}</td>
                      <td>{row.installationTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cost Factors */}
        <section className="about-section quality-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge">TRANSPARENCY</span>
              <h2>What Determines the Final Cost?</h2>
              <p className="section-subtitle">
                We believe in total clarity with zero hidden charges. Here are the 5 factors affecting every project.
              </p>
            </div>

            <div className="quality-grid">
              {COST_FACTORS.map((factor, idx) => (
                <ScrollReveal key={idx} delay={idx * 60}>
                  <div className="quality-card">
                    <div className="quality-card-header">
                      <span className="quality-index">0{idx + 1}</span>
                      <h3>{factor.title}</h3>
                    </div>
                    <p>{factor.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Get a Guaranteed Fixed-Price Quote for Your Space</h2>
              <p>
                Our technical specialist will visit your site in Sikar, conduct laser measurements, and give you an exact itemized quotation with zero obligation.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Request Free Measurement
                </Link>
                <Link to="/contact" className="btn-outline">
                  Visit Showroom
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
