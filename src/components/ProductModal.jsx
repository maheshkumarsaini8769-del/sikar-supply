import { useState, useEffect } from 'react';

export default function ProductModal({ product, onClose }) {
  const [activeImg, setActiveImg] = useState(0);
  const [sqft, setSqft] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const prev = () => setActiveImg((p) => (p === 0 ? product.images.length - 1 : p - 1));
  const next = () => setActiveImg((p) => (p === product.images.length - 1 ? 0 : p + 1));

  const sqftValue = sqft ? parseInt(sqft) : 0;
  const totalEstimate = sqftValue * product.pricePerSqFt;

  const whatsappMessage = sqftValue > 0
    ? `Hello Star Home Design,\n\nI am interested in:\n\nProduct: ${product.title}\nCategory: ${product.category.toUpperCase()}\nPrice: ₹ ${product.pricePerSqFt}/sq.ft\nArea: ${sqft} sq.ft\nTotal Estimate: ₹ ${totalEstimate.toLocaleString()}\n\nPlease share more details and availability.`
    : `Hello Star Home Design,\n\nI am interested in:\n\nProduct: ${product.title}\nCategory: ${product.category.toUpperCase()}\nPrice: ₹ ${product.pricePerSqFt}/sq.ft\n\nPlease share more details and availability.`;

  const whatsappLink = `https://wa.me/918239409535?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Product details: ${product.title}`}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close product details">&times;</button>

        <div className="modal-gallery">
          <div className="modal-main-image">
            <img src={product.images[activeImg]} alt={`${product.title} - main view`} loading="lazy" />
            {product.images.length > 1 && (
              <>
                <button className="gallery-prev" onClick={prev} aria-label="Previous image">&#8249;</button>
                <button className="gallery-next" onClick={next} aria-label="Next image">&#8250;</button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="modal-thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`modal-thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.title} thumbnail ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-info">
          <span className="product-card-category">{product.category}</span>
          <h2 className="modal-title">{product.title}</h2>
          <div className="modal-price-row">
            <span className="modal-price">₹ {product.pricePerSqFt}</span>
            <span className="modal-price-unit">/ sq.ft</span>
          </div>
          <p className="modal-desc">{product.desc}</p>
          <div className="modal-features">
            <div className="modal-feature">
              <span className="modal-feature-icon">&#10003;</span>
              <span>Premium Quality</span>
            </div>
            <div className="modal-feature">
              <span className="modal-feature-icon">&#10003;</span>
              <span>Easy Installation</span>
            </div>
            <div className="modal-feature">
              <span className="modal-feature-icon">&#10003;</span>
              <span>Durable Finish</span>
            </div>
          </div>

          <div className="modal-sqft">
            <label htmlFor="sqft-input">Required Area (sq.ft)</label>
            <div className="modal-sqft-input">
              <input
                id="sqft-input"
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
              />
              <span className="modal-sqft-unit">sq.ft</span>
            </div>
            {sqftValue > 0 && (
              <div className="modal-estimate">
                Estimated: ₹ {totalEstimate.toLocaleString()}
              </div>
            )}
          </div>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary modal-cta" aria-label="Contact on WhatsApp for pricing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {sqftValue > 0 ? `WhatsApp - ₹ ${totalEstimate.toLocaleString()}` : 'WhatsApp / Get Price'}
          </a>
        </div>
      </div>
    </div>
  );
}
