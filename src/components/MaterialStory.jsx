import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';
import { UPLOAD_URL } from '../api';

const fallbackCategories = [
  {
    _id: 'cat-pvc',
    name: 'PVC Wall Panels',
    slug: 'pvc-panels',
    description: '100% waterproof, termite-proof wall & ceiling panels for moisture-free Sikar homes.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop',
  },
  {
    _id: 'cat-fluted',
    name: 'Fluted Panels',
    slug: 'fluted-panels',
    description: 'Architectural ribbed louvers that add 3D depth and luxury texture to TV walls.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85&auto=format&fit=crop',
  },
  {
    _id: 'cat-uv',
    name: 'UV Marble Sheets',
    slug: 'uv-sheets',
    description: 'High-gloss Italian marble replicate sheets for luxury living, lobbies, and kitchens.',
    image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=85&auto=format&fit=crop',
  },
  {
    _id: 'cat-wall',
    name: 'Decorative Wall Panels',
    slug: 'wall-panels',
    description: '3D geometric, acoustic felt, and wood-finish feature wall claddings.',
    image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=85&auto=format&fit=crop',
  },
  {
    _id: 'cat-ceiling',
    name: 'Ceiling Panels',
    slug: 'ceiling-panels',
    description: 'Lightweight PVC rafter beams and moisture-resistant false ceiling solutions.',
    image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=85&auto=format&fit=crop',
  },
];

const slugMap = {
  pvc: 'pvc-panels',
  'pvc-panels': 'pvc-panels',
  fluted: 'fluted-panels',
  'fluted-panels': 'fluted-panels',
  uv: 'uv-sheets',
  'uv-sheets': 'uv-sheets',
  rafter: 'ceiling-panels',
  'ceiling-panels': 'ceiling-panels',
  tiles: 'wall-panels',
  'wall-panels': 'wall-panels',
};

export default function MaterialStory({ onProductClick }) {
  const { categories } = useSite();

  const activeCategories = categories && categories.length > 0 ? categories : fallbackCategories;
  const icons = { pvc: '◆', fluted: '║', rafter: '⟐', uv: '◈', tiles: '▣' };

  return (
    <section className="material-story" id="materials">
      <div className="container">
        <ScrollReveal>
          <p className="section-eyebrow">Our Materials in Sikar</p>
          <h2 className="section-heading">
            {activeCategories.length} Signature Materials, Endless Possibilities
          </h2>
        </ScrollReveal>

        <div className="material-grid">
          {activeCategories.map((cat, i) => {
            const canonicalSlug = slugMap[cat.slug] || 'pvc-panels';
            const catImage =
              cat.image && typeof cat.image === 'string'
                ? cat.image.startsWith('http') || cat.image.startsWith('data:')
                  ? cat.image
                  : UPLOAD_URL + cat.image
                : fallbackCategories[i % fallbackCategories.length].image;

            return (
              <ScrollReveal key={cat._id || i} delay={i * 80}>
                <div
                  className="material-card"
                  onClick={() => {
                    if (onProductClick) onProductClick(cat.slug);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (onProductClick) onProductClick(cat.slug);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="material-card-image">
                    <img
                      src={catImage}
                      alt={`${cat.name} in Sikar - Star Home Design`}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="300"
                    />
                  </div>

                  <h3 className="material-title">{cat.name}</h3>
                  <p className="material-desc">
                    {cat.description || 'Premium quality interior material for modern Rajasthan homes.'}
                  </p>

                  <div style={{ position: 'absolute', bottom: '16px', left: '20px', zIndex: 2, display: 'flex', gap: '12px' }}>
                    <Link
                      to={`/products/${canonicalSlug}`}
                      className="material-link"
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: 'none' }}
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
