import { useState, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

const MATERIALS = [
  {
    id: 'pvc',
    name: 'PVC Wall & Ceiling Panels',
    ratePerSqFt: 85,
    unitName: 'Panels (10ft × 10in)',
    coveragePerUnit: 8.33,
    icon: '🪵',
    popular: false,
    desc: 'Lightweight, 100% waterproof & easy to clean. Best for seelan walls.',
  },
  {
    id: 'fluted',
    name: 'Deep Fluted Charcoal Louvers',
    ratePerSqFt: 145,
    unitName: 'Louver Strips (9.5ft × 5in)',
    coveragePerUnit: 3.95,
    icon: '✨',
    popular: true,
    desc: 'Architectural vertical flutes with luxury matte/metallic finish for TV units.',
  },
  {
    id: 'rafter',
    name: 'Designer Rafter Ceiling Panels',
    ratePerSqFt: 125,
    unitName: 'Rafter Battens (10ft)',
    coveragePerUnit: 5.0,
    icon: '🏛️',
    popular: false,
    desc: 'Wooden textured ceiling rafters for warm, acoustic ambient lighting.',
  },
  {
    id: 'uv',
    name: 'UV High-Gloss Marble Sheets',
    ratePerSqFt: 95,
    unitName: 'Full Sheets (8ft × 4ft)',
    coveragePerUnit: 32,
    icon: '💎',
    popular: false,
    desc: 'Real Italian marble look with high-gloss scratch-resistant UV coating.',
  },
  {
    id: 'tiles',
    name: 'Decorative 3D Wall Tiles',
    ratePerSqFt: 110,
    unitName: 'Tiles (1ft × 1ft)',
    coveragePerUnit: 1,
    icon: '💠',
    popular: false,
    desc: 'Geometric and textured 3D tiles for accent niches and feature backdrops.',
  },
];

const PRESETS = [
  { label: 'TV Feature Wall', width: 10, height: 9, icon: '📺' },
  { label: 'Living Room Wall', width: 14, height: 10, icon: '🛋️' },
  { label: 'Bedroom Accent Wall', width: 11, height: 10, icon: '🛏️' },
  { label: 'False Ceiling Area', width: 12, height: 12, icon: '💡' },
];

export default function CostCalculator() {
  const { settings } = useSite();
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[1]);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [doors, setDoors] = useState(0);
  const [windows, setWindows] = useState(0);
  const [includeFitting, setIncludeFitting] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sending, setSending] = useState(false);

  // Calculation logic
  const grossArea = Math.max(0, width * height);
  const deductionArea = (doors * 21) + (windows * 16);
  const netArea = Math.max(10, grossArea - deductionArea);

  // Wastage buffer 5%
  const totalAreaWithWastage = Math.ceil(netArea * 1.05);

  const unitsNeeded = Math.ceil(totalAreaWithWastage / selectedMaterial.coveragePerUnit);
  const materialCost = netArea * selectedMaterial.ratePerSqFt;
  const fittingRate = 22; // ₹22 / sq.ft approx labor & hardware
  const fittingCost = includeFitting ? netArea * fittingRate : 0;
  const grandTotal = materialCost + fittingCost;

  const handlePreset = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleWhatsAppSend = async () => {
    const phone = settings?.whatsapp || '918239409535';
    const fittingText = includeFitting ? `+ Installation (₹${fittingCost.toLocaleString('en-IN')})` : 'Material Only';

    const msgLines = [
      'Hello Star Home Design,',
      'I calculated an estimated project quote on your website:',
      '',
      `📐 Area Dimensions: ${width}ft × ${height}ft (${grossArea} sq.ft gross)`,
      doors || windows ? `🚪 Deductions: ${doors} doors, ${windows} windows (Net: ${netArea} sq.ft)` : `📐 Net Area: ${netArea} sq.ft`,
      `🎨 Selected Material: ${selectedMaterial.name}`,
      `📦 Estimated Requirement: ~${unitsNeeded} ${selectedMaterial.unitName}`,
      `💰 Estimated Budget: ₹ ${grandTotal.toLocaleString('en-IN')} (${fittingText})`,
      customerName ? `👤 Name: ${customerName}` : '',
      customerPhone ? `📞 Phone: ${customerPhone}` : '',
      '',
      'Please share available catalog designs, exact quotes and showroom visit timing in Sikar.',
    ].filter(Boolean);

    const fullMessage = msgLines.join('\n');

    // Also record as a website quote request in the backend
    try {
      setSending(true);
      await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || 'Website Calculator User',
          phone: customerPhone.trim() || '',
          items: [{
            productName: `${selectedMaterial.name} (${netArea} sq.ft)`,
            quantity: unitsNeeded,
            price: selectedMaterial.ratePerSqFt,
            total: grandTotal,
          }],
          total: grandTotal,
          notes: `Calculator estimate: ${width}x${height} ft, ${netArea} sq.ft net. Fitting: ${includeFitting ? 'Yes' : 'No'}`,
          source: 'calculator',
          whatsappMessage: fullMessage,
        }),
      });
    } catch {
      // ignore
    } finally {
      setSending(false);
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`, '_blank');
  };

  return (
    <section className="cost-calculator-section" id="calculator">
      <div className="container">
        <ScrollReveal>
          <div className="calculator-header">
            <span className="eyebrow">Smart Cost & Area Estimator</span>
            <h2 className="section-heading">Plan Your Budget & Materials</h2>
            <p className="calculator-subtitle">
              कमरे का नाप डालें और तुरंत जानें कि आपके घर या ऑफिस के लिए कितने पैनल्स/शीट्स लगेंगे और कुल कितना खर्च आएगा।
            </p>
          </div>
        </ScrollReveal>

        <div className="calculator-wrapper">
          {/* Left Column: Interactive Controls */}
          <div className="calculator-controls">
            {/* 1. Room Presets */}
            <div className="calc-group">
              <label className="calc-label">1. Quick Room Presets (या नीचे कस्टम नाप डालें)</label>
              <div className="calc-presets">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`calc-preset-btn ${width === p.width && height === p.height ? 'active' : ''}`}
                    onClick={() => handlePreset(p)}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label} ({p.width}×{p.height} ft)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Dimension Sliders */}
            <div className="calc-group">
              <label className="calc-label">2. Wall / Ceiling Dimensions (Feet)</label>
              <div className="calc-dimensions-grid">
                <div className="calc-input-box">
                  <div className="calc-input-top">
                    <span>Width (चौड़ाई)</span>
                    <strong className="calc-val-highlight">{width} ft</strong>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                </div>

                <div className="calc-input-box">
                  <div className="calc-input-top">
                    <span>Height (ऊंचाई / लंबाई)</span>
                    <strong className="calc-val-highlight">{height} ft</strong>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="25"
                    step="0.5"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                </div>
              </div>
            </div>

            {/* 3. Deductions (Doors & Windows) */}
            <div className="calc-group">
              <label className="calc-label">3. Deductions (दरवाजे / खिड़कियाँ घटाएं)</label>
              <div className="calc-deductions-grid">
                <div className="calc-counter-box">
                  <span>🚪 Doors (-21 sq.ft each)</span>
                  <div className="calc-stepper">
                    <button type="button" onClick={() => setDoors(Math.max(0, doors - 1))}>−</button>
                    <span>{doors}</span>
                    <button type="button" onClick={() => setDoors(doors + 1)}>+</button>
                  </div>
                </div>

                <div className="calc-counter-box">
                  <span>🪟 Windows (-16 sq.ft each)</span>
                  <div className="calc-stepper">
                    <button type="button" onClick={() => setWindows(Math.max(0, windows - 1))}>−</button>
                    <span>{windows}</span>
                    <button type="button" onClick={() => setWindows(windows + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Select Material */}
            <div className="calc-group">
              <label className="calc-label">4. Select Interior Material (मटेरियल चुनें)</label>
              <div className="calc-materials-list">
                {MATERIALS.map((mat) => (
                  <div
                    key={mat.id}
                    className={`calc-material-card ${selectedMaterial.id === mat.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    <div className="calc-mat-icon">{mat.icon}</div>
                    <div className="calc-mat-info">
                      <div className="calc-mat-title-row">
                        <h4>{mat.name}</h4>
                        {mat.popular && <span className="calc-popular-badge">Most Popular</span>}
                      </div>
                      <p>{mat.desc}</p>
                    </div>
                    <div className="calc-mat-rate">
                      <span className="rate-num">₹{mat.ratePerSqFt}</span>
                      <span className="rate-unit">/sq.ft</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation Toggle */}
            <div className="calc-toggle-row">
              <label className="calc-switch">
                <input
                  type="checkbox"
                  checked={includeFitting}
                  onChange={(e) => setIncludeFitting(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="calc-toggle-label">
                Include Professional Installation & Fitting (+₹22/sq.ft approx)
              </span>
            </div>
          </div>

          {/* Right Column: Live Estimate Card */}
          <div className="calculator-summary-card">
            <div className="calc-summary-header">
              <span className="calc-summary-badge">⚡ Instant Calculation</span>
              <h3>Project Estimate Summary</h3>
              <p>Estimated for {netArea} sq.ft wall space</p>
            </div>

            <div className="calc-breakdown-list">
              <div className="calc-breakdown-row">
                <span>Gross Wall Area</span>
                <strong>{grossArea} sq.ft</strong>
              </div>

              {deductionArea > 0 && (
                <div className="calc-breakdown-row deduction">
                  <span>Doors/Windows Deduction</span>
                  <strong>−{deductionArea} sq.ft</strong>
                </div>
              )}

              <div className="calc-breakdown-row highlight">
                <span>Net Coverage Area</span>
                <strong>{netArea} sq.ft</strong>
              </div>

              <div className="calc-breakdown-row">
                <span>Estimated Material Quantity</span>
                <strong style={{ color: 'var(--color-accent)' }}>
                  ~{unitsNeeded} {selectedMaterial.unitName}
                </strong>
              </div>

              <div className="calc-divider" />

              <div className="calc-breakdown-row">
                <span>Material Cost (@ ₹{selectedMaterial.ratePerSqFt}/sq.ft)</span>
                <span>₹ {materialCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="calc-breakdown-row">
                <span>Fitting & Labor ({includeFitting ? 'Included' : 'Self'})</span>
                <span>{includeFitting ? `₹ ${fittingCost.toLocaleString('en-IN')}` : '₹ 0'}</span>
              </div>

              <div className="calc-total-box">
                <div>
                  <span className="total-label">Total Estimated Budget</span>
                  <span className="total-sub">Includes 5% cutting buffer</span>
                </div>
                <div className="total-amount">
                  ₹ {grandTotal.toLocaleString('en-IN')}*
                </div>
              </div>
            </div>

            {/* Quick Contact Inputs */}
            <div className="calc-contact-form">
              <input
                type="text"
                placeholder="Aapka Naam (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="calc-input-field"
              />
              <input
                type="tel"
                placeholder="Mobile Number (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="calc-input-field"
                maxLength={10}
              />
            </div>

            <button
              type="button"
              className="btn-primary calc-whatsapp-btn"
              onClick={handleWhatsAppSend}
              disabled={sending}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {sending ? 'Processing...' : 'Send Estimate on WhatsApp'}
            </button>
            <p className="calc-note">
              *Preliminary estimate based on standard catalog sizes. Exact rates confirmed upon site inspection or design selection in Sikar showroom.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
