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
        {/* Top Quote Callout Bar */}
        <div className="footer-cta-strip">
          <div className="footer-cta-text">
            <h3>Planning a Wall or Interior Renovation in Sikar?</h3>
            <p>Schedule a free on-site laser measurement visit and receive an itemized quotation.</p>
          </div>
          <div className="footer-cta-action">
            <Link to="/get-quote" className="btn-primary">
              Get Free Site Visit
            </Link>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand & Social */}
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              {settings?.footerDescription ||
                'Star Home Design is Sikar’s premier showroom for waterproof PVC panels, architectural fluted louvers, and high-gloss UV marble sheets for modern homes and commercial interiors.'}
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

          {/* Explore Links */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">All Services</Link></li>
              <li><Link to="/products">Product Catalog</Link></li>
              <li><Link to="/projects">Project Portfolio</Link></li>
              <li><Link to="/gallery">Photo Gallery</Link></li>
              <li><Link to="/process">Our 9-Step Process</Link></li>
              <li><Link to="/pricing">Pricing &amp; Calculator</Link></li>
              <li><Link to="/blog">Design Blog</Link></li>
            </ul>
          </div>

          {/* Product Category SEO Links */}
          <div className="footer-col">
            <h4>Products in Sikar</h4>
            <ul>
              <li><Link to="/products/pvc-panels">PVC Wall Panels</Link></li>
              <li><Link to="/products/fluted-panels">Fluted Louvers</Link></li>
              <li><Link to="/products/uv-sheets">UV Marble Sheets</Link></li>
              <li><Link to="/products/wall-panels">Decorative Panels</Link></li>
              <li><Link to="/products/ceiling-panels">Ceiling Panels</Link></li>
              <li><Link to="/services/tv-unit">TV Media Units</Link></li>
              <li><Link to="/services/false-ceiling">False Ceilings</Link></li>
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div className="footer-col">
            <h4>Customer &amp; Legal</h4>
            <ul>
              <li><Link to="/get-quote">Get Free Quote</Link></li>
              <li><Link to="/contact">Contact Showroom</Link></li>
              <li><Link to="/faq">FAQs &amp; Help</Link></li>
              <li><Link to="/guides">Interior Guides</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions">Terms &amp; Conditions</Link></li>
              <li><Link to="/cancellation-refund-policy">Cancellation &amp; Refund</Link></li>
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
          <p>{settings?.copyrightText || `© ${year} Star Home Design. All rights reserved. Premium Interior Products & Installation in Sikar, Rajasthan.`}</p>
        </div>
      </div>
    </footer>
  );
}
