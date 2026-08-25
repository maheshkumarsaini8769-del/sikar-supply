import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { UPLOAD_URL } from '../api';
import ScrollReveal from './ScrollReveal';

const CATEGORIES = ['all', 'interiors', 'kitchen', 'installation', 'showroom'];
const MOBILE_PREVIEW = 4;

export default function GallerySection() {
  const { gallery } = useSite();
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = filter === 'all' ? gallery : gallery.filter(g => g.category === filter);
  const mobilePreview = filtered.slice(0, MOBILE_PREVIEW);
  const hasMore = filtered.length > MOBILE_PREVIEW;

  const getImageSrc = (item) => {
    if (!item.image) return '';
    if (item.image.startsWith('http') || item.image.startsWith('data:')) return item.image;
    return UPLOAD_URL + item.image;
  };

  const renderGrid = (items, isModal = false) => (
    <div className={`gallery-grid ${isModal ? 'gallery-modal-grid' : ''}`}>
      {items.map((item, i) => (
        <ScrollReveal key={item._id || i} delay={isModal ? i * 50 : i * 80}>
          <div className="gallery-item" onClick={() => isModal ? setLightbox(item) : setLightbox(item)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightbox(item); }}>
            <img src={getImageSrc(item)} alt={item.title || `Gallery image ${i + 1}`} loading="lazy" />
            {item.title && <div className="gallery-item-overlay"><span>{item.title}</span></div>}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );

  return (
    <section className="gallery-section" id="gallery">
      <div className="container">
        <ScrollReveal>
          <p className="section-eyebrow">Our Work</p>
          <h2 className="section-heading">Gallery</h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="gallery-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`filter-btn ${filter === c ? 'active' : ''}`}
                onClick={() => { setFilter(c); setShowAll(false); }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Desktop: show all */}
        <div className="gallery-desktop-only">
          {renderGrid(filtered)}
        </div>

        {/* Mobile: show preview + View All */}
        <div className="gallery-mobile-only">
          {renderGrid(mobilePreview)}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn-outline" onClick={() => setShowAll(true)} style={{ fontSize: 14, padding: '10px 28px' }}>
                View All {filtered.length} Images
              </button>
            </div>
          )}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            {gallery.length === 0 ? 'No gallery images yet. Add from Admin Panel → Gallery.' : 'No images in this category.'}
          </div>
        )}
      </div>

      {/* All Images Modal */}
      {showAll && (
        <div className="gallery-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setShowAll(false); }} role="dialog" aria-modal="true" aria-label="All gallery images">
          <div className="gallery-modal-container">
            <div className="gallery-modal-header">
              <h2>All Gallery Images ({filtered.length})</h2>
              <button className="gallery-lightbox-close" onClick={() => setShowAll(false)} aria-label="Close gallery">×</button>
            </div>
            <div className="gallery-modal-body">
              {filtered.map((item, i) => (
                <div key={item._id || i} className="gallery-item" onClick={() => setLightbox(item)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightbox(item); }}>
                  <img src={getImageSrc(item)} alt={item.title || `Gallery image ${i + 1}`} loading="lazy" />
                  {item.title && <div className="gallery-item-overlay"><span>{item.title}</span></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single Image Lightbox */}
      {lightbox && !showAll && (
        <div className="gallery-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }} role="dialog" aria-modal="true" aria-label="Gallery image lightbox">
          <div className="gallery-lightbox-inner">
            <button className="gallery-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close lightbox">×</button>
            <img src={getImageSrc(lightbox)} alt={lightbox.title || 'Gallery image'} loading="lazy" />
            {lightbox.title && <p className="gallery-lightbox-caption">{lightbox.title}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
