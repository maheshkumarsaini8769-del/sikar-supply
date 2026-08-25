import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { UPLOAD_URL } from '../api';
import ScrollReveal from './ScrollReveal';

const CATEGORIES = ['all', 'interiors', 'kitchen', 'installation', 'showroom'];

export default function GallerySection() {
  const { gallery } = useSite();
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const filtered = filter === 'all' ? gallery : gallery.filter(g => g.category === filter);

  const getImageSrc = (item) => {
    if (!item.image) return '';
    if (item.image.startsWith('http') || item.image.startsWith('data:')) return item.image;
    return UPLOAD_URL + item.image;
  };

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
                onClick={() => setFilter(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="gallery-grid">
          {filtered.map((item, i) => (
            <ScrollReveal key={item._id || i} delay={i * 80}>
              <div className="gallery-item" onClick={() => setLightbox(item)}>
                <img src={getImageSrc(item)} alt={item.title || ''} loading="lazy" />
                {item.title && <div className="gallery-item-overlay"><span>{item.title}</span></div>}
              </div>
            </ScrollReveal>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              {gallery.length === 0 ? 'No gallery images yet. Add from Admin Panel → Gallery.' : 'No images in this category.'}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="gallery-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}>
          <div className="gallery-lightbox-inner">
            <button className="gallery-lightbox-close" onClick={() => setLightbox(null)}>×</button>
            <img src={getImageSrc(lightbox)} alt={lightbox.title || ''} />
            {lightbox.title && <p className="gallery-lightbox-caption">{lightbox.title}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
