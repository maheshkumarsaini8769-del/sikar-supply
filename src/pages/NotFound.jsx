import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export default function NotFound() {
  return (
    <div className="site-page">
      <SEOHead
        title="404 - Page Not Found | Star Home Design Sikar"
        description="The page or interior section you are searching for doesn't exist or has moved. Explore waterproof PVC wall panels, fluted louvers, and UV marble sheets at Star Home Design in Sikar."
        noindex={true}
      />

      <Navbar />

      <main className="not-found-main">
        <div className="container">
          <div className="not-found-card">
            <span className="not-found-code">404</span>
            <h1 className="not-found-title">Looks like this space hasn't been designed yet.</h1>
            <p className="not-found-text">
              The page or interior section you are searching for doesn't exist or has moved. Let's guide you back to our luxury wall panels and showroom designs.
            </p>

            <div className="not-found-actions">
              <Link to="/" className="btn-primary">
                Back to Home
              </Link>
              <Link to="/products" className="btn-outline">
                Browse Products
              </Link>
              <Link to="/services" className="btn-outline">
                View Services
              </Link>
              <Link to="/get-quote" className="btn-primary" style={{ background: 'var(--color-accent)', color: '#0a0a0a' }}>
                Request Free Quote
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
