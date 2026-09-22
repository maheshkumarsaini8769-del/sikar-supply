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
          <div className="footer-col">
            <h4>Products in Sikar</h4>
            <ul>
              <li><Link to="/products/pvc-panels">PVC Wall Panels</Link></li>
              <li><Link to="/products/fluted-panels">Fluted Panels</Link></li>
              <li><Link to="/products/uv-sheets">UV Marble Sheets</Link></li>
              <li><Link to="/products/wall-panels">Decorative Wall Panels</Link></li>
              <li><Link to="/products/ceiling-panels">Ceiling Panels</Link></li>
            </ul>
          </div>

          {/* Guides & Resources Links */}
          <div className="footer-col">
            <h4>Guides &amp; Advice</h4>
            <ul>
              <li><Link to="/guides/pvc-wall-panels-guide">PVC Panels Guide</Link></li>
              <li><Link to="/guides/fluted-panel-design-ideas">Fluted Design Ideas</Link></li>
              <li><Link to="/guides/uv-marble-sheet-guide">UV Marble Guide</Link></li>
              <li><Link to="/guides/pvc-vs-traditional-wall-finishes">PVC vs Paint Comparison</Link></li>
              <li><Link to="/guides">All Interior Guides</Link></li>
              <li><a href="/#faq">Common FAQs</a></li>
            </ul>
          </div>

          {/* Consistent Local NAP Contact */}
          <div className="footer-col footer-contact-col">
            <h4>Showroom Location</h4>
            <div className="footer-contact-info">
              <p className="footer-contact-name"><strong>{BUSINESS_NAP.name}</strong></p>
              <p className="footer-contact-addr">{BUSINESS_NAP.streetAddress}, Sikar, Rajasthan {BUSINESS_NAP.postalCode}</p>
              <p className="footer-contact-item">
                <span>Phone:</span> <a href={`tel:${BUSINESS_NAP.rawPhone}`}>{BUSINESS_NAP.phone}</a>
              </p>
              <p className="footer-contact-item">
                <span>WhatsApp:</span> <a href={`https://wa.me/${BUSINESS_NAP.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-wa-link">+91 {BUSINESS_NAP.whatsapp}</a>
              </p>
              <p className="footer-contact-hours">Hours: {BUSINESS_NAP.openingHours}</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{settings?.copyrightText || `© ${year} Star Home Design. All rights reserved. Premium Interior Products in Sikar, Rajasthan.`}</p>
        </div>
      </div>
    </footer>
  );
}
