import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found | Star Home Design Sikar"
        description="The page you are looking for does not exist. Explore PVC wall panels, fluted louvers, and UV sheets at Star Home Design in Sikar."
        noindex={true}
      />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#f5f0eb', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 20 }}>
        <div>
          <h1 style={{ fontSize: 72, fontWeight: 700, color: '#b8956a', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: 24, fontWeight: 400, margin: '16px 0 8px', color: '#f5f0eb' }}>Page Not Found</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            The page you are looking for does not exist or has been moved. Return home to explore our premium interior materials in Sikar.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'inline-block', padding: '12px 32px', background: '#b8956a', color: '#0a0a0a', fontWeight: 600, fontSize: 14, borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
              Back to Home
            </Link>
            <Link to="/guides" style={{ display: 'inline-block', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.2)', color: '#f5f0eb', fontWeight: 500, fontSize: 14, borderRadius: 6, textDecoration: 'none' }}>
              Interior Guides
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
