import { useState, useEffect } from 'react';
import { UPLOAD_URL } from '../api';

export default function ProductModal({ product, onClose }) {
  const [activeImg, setActiveImg] = useState(0);
  const [sqft, setSqft] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const prev = () => setActiveImg((p) => (p === 0 ? (product.images?.length || 1) - 1 : p - 1));
  const next = () => setActiveImg((p) => (p === (product.images?.length || 1) - 1 ? 0 : p + 1));

  const sqftValue = sqft ? parseInt(sqft) : 0;
  const price = product.salePrice || product.price || 0;
  const totalEstimate = sqftValue * price;

  const getProductImage = () => {
    if (product.images?.[activeImg]) {
      const img = product.images[activeImg];
      const url = typeof img === 'string' ? img : img.url;
      if (url?.startsWith('http') || url?.startsWith('data:')) return url;
      return UPLOAD_URL + url;
    }
    return 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop';
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required hai';
    if (!form.phone.trim()) e.phone = 'Phone number required hai';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = '10 digit phone daalo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGetPrice = () => {
    if (showForm) return;
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);

    // Build WhatsApp message with customer details
    const area = sqftValue > 0 ? `Area: ${sqft} ${product.unit || 'sq.ft'}` : '';
    const estimate = sqftValue > 0 ? `Total Estimate: ₹ ${totalEstimate.toLocaleString()}` : '';
    const lines = [
      `Hello Star Home Design,`,
      ``,
      `I am interested in:`,
      ``,
      `Product: ${product.name}`,
      `Category: ${product.category?.name || ''}`,
      `Price: ₹ ${price}/${product.unit || 'sqft'}`,
      area,
      estimate,
      ``,
      `--- My Details ---`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.address.trim() ? `Address: ${form.address.trim()}` : '',
      ``,
      `Please share more details and availability.`,
    ].filter(Boolean);
    const msg = lines.join('\n');

    // Save order to panel
    try {
      const orderItems = [{
        product: product._id || undefined,
        productName: product.name || '',
        quantity: sqftValue || 1,
        price: price,
        total: totalEstimate || price,
      }];

      const res = await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          items: orderItems,
          total: totalEstimate || price,
          notes: sqftValue > 0 ? `${sqftValue} ${product.unit || 'sqft'} requested` : 'Product enquiry via website',
          source: 'website',
          whatsappMessage: msg,
        }),
      });
      const data = await res.json();
      if (!data.success) console.error('Order save failed:', data.message);
    } catch (e) {
      console.error('Order save error:', e);
    }

    // Open WhatsApp
    window.open(`https://wa.me/918239409535?text=${encodeURIComponent(msg)}`, '_blank');
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Product details: ${product.name}`}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close product details">&times;</button>

        <div className="modal-gallery">
          <div className="modal-main-image">
            <img src={getProductImage()} alt={`${product.name} - main view`} loading="lazy" />
            {(product.images?.length || 0) > 1 && (
              <>
                <button className="gallery-prev" onClick={prev} aria-label="Previous image">&#8249;</button>
                <button className="gallery-next" onClick={next} aria-label="Next image">&#8250;</button>
              </>
            )}
          </div>
          {(product.images?.length || 0) > 1 && (
            <div className="modal-thumbnails">
              {product.images.map((img, i) => {
                const url = typeof img === 'string' ? img : img.url;
                const src = (url?.startsWith('http') || url?.startsWith('data:')) ? url : UPLOAD_URL + url;
                return (
                  <button key={i} className={`modal-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                    <img src={src} alt={`${product.name} thumbnail ${i + 1}`} loading="lazy" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-info">
          <span className="product-card-category">{product.category?.name || ''}</span>
          <h2 className="modal-title">{product.name}</h2>
          <div className="modal-price-row">
            {product.salePrice > 0 && <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: 16, marginRight: 8 }}>₹{product.price}</span>}
            <span className="modal-price">₹ {product.salePrice || product.price}</span>
            <span className="modal-price-unit">/ {product.unit || 'sq.ft'}</span>
          </div>
          {product.sku && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>SKU: {product.sku}</div>}
          <p className="modal-desc">{product.description || product.shortDescription || ''}</p>

          {product.specs?.length > 0 && (
            <div style={{ margin: '12px 0' }}>
              {product.specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ color: '#888', minWidth: 80 }}>{s.label}:</span>
                  <span style={{ color: '#ccc' }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="modal-features">
            <div className="modal-feature"><span className="modal-feature-icon">&#10003;</span><span>Premium Quality</span></div>
            <div className="modal-feature"><span className="modal-feature-icon">&#10003;</span><span>Easy Installation</span></div>
            <div className="modal-feature"><span className="modal-feature-icon">&#10003;</span><span>Durable Finish</span></div>
          </div>

          {/* Area input */}
          <div className="modal-sqft">
            <label htmlFor="sqft-input">Required Area ({product.unit || 'sq.ft'})</label>
            <div className="modal-sqft-input">
              <input id="sqft-input" type="number" min="1" placeholder="e.g. 100" value={sqft} onChange={(e) => setSqft(e.target.value)} />
              <span className="modal-sqft-unit">{product.unit || 'sq.ft'}</span>
            </div>
            {sqftValue > 0 && (
              <div className="modal-estimate">
                Estimated: ₹ {totalEstimate.toLocaleString()}
              </div>
            )}
          </div>

          {/* Customer Form - WhatsApp click ke baad dikhta hai */}
          {showForm && (
            <div style={{ marginTop: 16, padding: 16, background: '#0d0d0d', borderRadius: 12, border: '1px solid #262626' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#b8956a', marginBottom: 12 }}>Aapki Details</h3>

              <div style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Aapka Naam *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: errors.name ? '1px solid #ef4444' : '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
                {errors.name && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.name}</span>}
              </div>

              <div style={{ marginBottom: 10 }}>
                <input
                  type="tel"
                  placeholder="Phone Number * (10 digit)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: errors.phone ? '1px solid #ef4444' : '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
                {errors.phone && <span style={{ color: '#ef4444', fontSize: 11 }}>{errors.phone}</span>}
              </div>

              <div style={{ marginBottom: 10 }}>
                <textarea
                  placeholder="Address (optional)"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* Main CTA Button */}
          {!showForm ? (
            <button onClick={handleGetPrice} className="btn-primary modal-cta" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {sqftValue > 0 ? `WhatsApp - ₹ ${totalEstimate.toLocaleString()}` : 'WhatsApp / Get Price'}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary modal-cta" style={{ cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, background: saving ? '#666' : '#25d366', color: '#fff' }}>
              {saving ? (
                'Sending...'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send on WhatsApp
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
