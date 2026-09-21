import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import Logo from './Logo';
import { BUSINESS_NAP } from '../data/seoData';

export default function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Social */}
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              {settings?.footerDescription ||
                'Star Home Design is Sikar’s premier showroom for waterproof PVC panels, luxury fluted louvers, and high-gloss UV marble sheets for modern home and commercial interiors.'}
            </p>
            <div className="footer-social">
              {settings?.socialLinks?.instagram ? (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  Instagram
                </a>
              ) : (
                <a href={BUSINESS_NAP.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  Instagram
                </a>
              )}
              {settings?.socialLinks?.facebook ? (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  Facebook
                </a>
              ) : (
                <a href={BUSINESS_NAP.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  Facebook
                </a>
              )}
              {settings?.socialLinks?.youtube ? (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  YouTube
                </a>
              ) : (
                <a href={BUSINESS_NAP.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Product Category SEO Links */}
          <div className="footer-links">
            <h4>Products in Sikar</h4>
            <Link to="/products/pvc-panels">PVC Wall Panels</Link>
            <Link to="/products/fluted-panels">Fluted Panels</Link>
            <Link to="/products/uv-sheets">UV Marble Sheets</Link>
            <Link to="/products/wall-panels">Decorative Wall Panels</Link>
            <Link to="/products/ceiling-panels">Ceiling Panels</Link>
          </div>

          {/* Guides & Resources Links */}
          <div className="footer-links">
            <h4>Guides &amp; Advice</h4>
            <Link to="/guides/pvc-wall-panels-guide">PVC Panels Guide</Link>
            <Link to="/guides/fluted-panel-design-ideas">Fluted Design Ideas</Link>
            <Link to="/guides/uv-marble-sheet-guide">UV Marble Guide</Link>
            <Link to="/guides/pvc-vs-traditional-wall-finishes">PVC vs Paint Comparison</Link>
            <Link to="/guides">All Interior Guides</Link>
            <a href="/#faq">Common FAQs</a>
          </div>

          {/* Consistent Local NAP Contact */}
          <div className="footer-contact">
            <h4>Showroom Location</h4>
            <p><strong>{BUSINESS_NAP.name}</strong></p>
            <p>{BUSINESS_NAP.streetAddress}, Sikar, Rajasthan {BUSINESS_NAP.postalCode}</p>
            <p>
              Phone: <a href={`tel:${BUSINESS_NAP.rawPhone}`} style={{ color: 'inherit' }}>{BUSINESS_NAP.phone}</a>
            </p>
            <p>
              WhatsApp: <a href={`https://wa.me/${BUSINESS_NAP.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>+91 {BUSINESS_NAP.whatsapp}</a>
            </p>
            <p>Hours: {BUSINESS_NAP.openingHours}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{settings?.copyrightText || `© ${year} Star Home Design. All rights reserved. Premium Interior Products in Sikar, Rajasthan.`}</p>
        </div>
      </div>
    </footer>
  );
}
