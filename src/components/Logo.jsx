import { useSite } from '../context/SiteContext';

export default function Logo({ className = '' }) {
  const { settings } = useSite();
  const logoImg = settings?.logo && typeof settings.logo === 'string' && settings.logo.trim();

  return (
    <a href="#" className={`logo-link ${className}`} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
      {logoImg ? (
        <img src={logoImg} alt={settings?.siteName || 'Star Home Design'} style={{ height: 40, width: 'auto', borderRadius: 4 }} />
      ) : (
        <>
          <div className="logo-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="32" height="32" stroke="#b8956a" strokeWidth="1.5" fill="none" rx="2"/>
              <path d="M18 6L6 18L18 30L30 18L18 6Z" stroke="#b8956a" strokeWidth="1" fill="none" opacity="0.5"/>
              <path d="M18 10L10 18L18 26L26 18L18 10Z" stroke="#f5f0eb" strokeWidth="1.2" fill="none"/>
              <line x1="18" y1="10" x2="18" y2="26" stroke="#b8956a" strokeWidth="0.8" opacity="0.4"/>
              <line x1="10" y1="18" x2="26" y2="18" stroke="#b8956a" strokeWidth="0.8" opacity="0.4"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">STAR HOME DESIGN</span>
            <span className="logo-tagline">Premium Interior Materials</span>
          </div>
        </>
      )}
    </a>
  );
}
