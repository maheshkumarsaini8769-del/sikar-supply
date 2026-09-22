import { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { UPLOAD_URL } from '../api';

const fallbackSlides = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1080&q=75&auto=format&fit=crop',
];

export default function Hero() {
  const { settings } = useSite();
  const [current, setCurrent] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState([0]);

  const rawSlides = settings?.heroSlides?.filter(s => s.active).length > 0
    ? settings.heroSlides.filter(s => s.active).sort((a, b) => a.displayOrder - b.displayOrder).map(s => (s.image?.startsWith('http') || s.image?.startsWith('data:')) ? s.image : UPLOAD_URL + s.image)
    : fallbackSlides;

  const slides = rawSlides.map(url => {
    if (typeof url === 'string' && url.includes('images.unsplash.com')) {
      return url.replace(/w=\d+/, 'w=1080').replace(/q=\d+/, 'q=75');
    }
    return url;
  });

  const duration = settings?.slideDuration || 3500;

  // Defer downloading secondary slides until after initial paint
  useEffect(() => {
    const deferTimer = setTimeout(() => {
      setLoadedIndices(slides.map((_, idx) => idx));
    }, 1200);
    return () => clearTimeout(deferTimer);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;
        setLoadedIndices((currentLoaded) => currentLoaded.includes(next) ? currentLoaded : [...currentLoaded, next]);
        return next;
      });
    }, duration);
    return () => clearInterval(timer);
  }, [slides.length, duration]);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide ${i === current ? 'active' : ''}`}
            style={{
              backgroundImage: loadedIndices.includes(i) || i === 0 ? `url(${slide})` : 'none'
            }}
            role="img"
            aria-label={`Star Home Design showroom slide ${i + 1} - Premium interior materials in Sikar Rajasthan`}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content">
        <p className="hero-eyebrow">{settings?.heroEyebrow || 'STAR HOME DESIGN'}</p>
        <h1 className="hero-heading">{settings?.heroHeading || 'Transform Your Space'}</h1>
        <p className="hero-description">
          {settings?.heroDescription || 'Premium interior materials for modern living'}
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={scrollToProducts}>
            {settings?.heroBtnText || 'Explore Collection'}
          </button>
          <a href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=${encodeURIComponent(settings?.whatsappGreeting || "Hi, I'm interested in your products")}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
            WhatsApp Us
          </a>
        </div>
      </div>

      <div className="hero-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-indicator ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
