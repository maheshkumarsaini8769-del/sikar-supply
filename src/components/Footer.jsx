import { useSite } from '../context/SiteContext';
import Logo from './Logo';

export default function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              {settings?.footerDescription || 'Your trusted partner for premium interior materials in Sikar, Rajasthan.'}
            </p>
            <div className="footer-social">
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              )}
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#showroom">Showroom</a>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>{settings?.address || 'Sikar, Rajasthan'}</p>
            {settings?.phone && <p>{settings.phone}</p>}
            {settings?.email && <p>{settings.email}</p>}
            {settings?.openingHours && <p>{settings.openingHours}</p>}
          </div>
        </div>

        <div className="footer-bottom">
          <p>{settings?.copyrightText || `© ${year} Star Home Design. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}
