import { useState, useEffect } from 'react';

export default function Loader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('star-loaded')) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('star-loaded', '1');
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`loader ${fading ? 'loader-fade' : ''}`}>
      <div className="loader-content">
        <div className="loader-icon">
          <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="32" height="32" stroke="#b8956a" strokeWidth="1.5" fill="none" rx="2"/>
            <path d="M18 6L6 18L18 30L30 18L18 6Z" stroke="#b8956a" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M18 10L10 18L18 26L26 18L18 10Z" stroke="#f5f0eb" strokeWidth="1.2" fill="none"/>
            <line x1="18" y1="10" x2="18" y2="26" stroke="#b8956a" strokeWidth="0.8" opacity="0.4"/>
            <line x1="10" y1="18" x2="26" y2="18" stroke="#b8956a" strokeWidth="0.8" opacity="0.4"/>
          </svg>
        </div>
        <div className="loader-logo">
          STAR HOME DESIGN
          <span>Premium Interior Materials</span>
        </div>
        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
