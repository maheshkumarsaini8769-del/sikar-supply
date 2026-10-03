import { useSite } from '../context/SiteContext';
import { UPLOAD_URL } from '../api';

const STATIC_LOGO = '/logo.webp';
const STATIC_LOGO_FALLBACK = '/logo.png';

export default function Logo({ className = '', hideTagline = false }) {
  const { settings } = useSite();
  const rawLogo = settings?.logo && typeof settings.logo === 'string' && settings.logo.trim();

  const getLogoSrc = () => {
    if (!rawLogo) return STATIC_LOGO;
    if (rawLogo.startsWith('http') || rawLogo.startsWith('data:') || rawLogo.startsWith('/')) return rawLogo;
    return UPLOAD_URL + rawLogo;
  };

  const displayName = (settings?.siteName || 'STAR HOME INTERIOR').toUpperCase();
  const displayTagline = settings?.siteTagline || 'Premium Interior Materials';

  return (
    <a
      href="#"
      className={`logo-link ${className}`}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      aria-label={displayName}
    >
      <div className="logo-mark">
        <img
          src={getLogoSrc()}
          alt={displayName}
          className="logo-img"
          width="40"
          height="40"
          loading="eager"
          decoding="async"
          onError={(e) => {
            if (e.target.src !== STATIC_LOGO_FALLBACK) {
              e.target.src = STATIC_LOGO_FALLBACK;
            }
          }}
          style={{ height: 38, width: 'auto', borderRadius: 4, objectFit: 'contain' }}
        />
      </div>
      <div className="logo-text">
        <span className="logo-name">{displayName}</span>
        {!hideTagline && displayTagline && <span className="logo-tagline">{displayTagline}</span>}
      </div>
    </a>
  );
}
