import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#f5f0eb', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 20 }}>
      <div>
        <h1 style={{ fontSize: 72, fontWeight: 700, color: '#b8956a', margin: 0 }}>404</h1>
        <h2 style={{ fontSize: 24, fontWeight: 400, margin: '16px 0 8px', color: '#f5f0eb' }}>Page Not Found</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          The page you are looking for does not exist or has been moved. Go back to explore our premium interior materials.
        </p>
        <Link to="/" style={{ display: 'inline-block', padding: '12px 32px', background: '#b8956a', color: '#0a0a0a', fontWeight: 600, fontSize: 14, borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
