import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';
import { UPLOAD_URL } from '../api';

export default function MaterialStory({ onProductClick }) {
  const { categories } = useSite();

  const icons = { pvc: '◆', fluted: '║', rafter: '⟐', uv: '◈', tiles: '▣' };

  return (
    <section className="material-story" id="materials">
      <div className="container">
        <ScrollReveal>
          <p className="section-eyebrow">Our Materials</p>
          <h2 className="section-heading">{categories.length || 5} Materials, Endless Possibilities</h2>
        </ScrollReveal>

        <div className="material-grid">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat._id || i} delay={i * 100}>
              <div
                className="material-card"
                onClick={() => onProductClick(cat.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onProductClick(cat.slug); }}
                style={{ cursor: 'pointer' }}
              >
                {cat.image && typeof cat.image === 'string' ? (
                  <div className="material-card-image">
                    <img
                      src={(cat.image.startsWith('http') || cat.image.startsWith('data:')) ? cat.image : UPLOAD_URL + cat.image}
                      alt={`${cat.name} - premium interior material in Sikar`}
                      loading="lazy"
                      width="400"
                      height="300"
                    />
                  </div>
                ) : (
                  <div className="material-icon">{icons[cat.slug] || '◆'}</div>
                )}
                <h3 className="material-title">{cat.name}</h3>
                <p className="material-desc">{cat.description || 'Premium quality material for modern interiors.'}</p>
                <span className="material-link">View Products →</span>
              </div>
            </ScrollReveal>
          ))}
          {categories.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              Loading materials...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
