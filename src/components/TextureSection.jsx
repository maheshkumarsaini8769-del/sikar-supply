import { useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { UPLOAD_URL } from '../api';
import ScrollReveal from './ScrollReveal';

export default function TextureSection() {
  const { settings } = useSite();
  const sectionRef = useRef(null);
  const imgRef = useRef(null);

  const textureImg = settings?.textureImage;
  const imgSrc = textureImg
    ? ((textureImg.startsWith('http') || textureImg.startsWith('data:')) ? textureImg : UPLOAD_URL + textureImg)
    : 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85&auto=format&fit=crop';

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !imgRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      if (sectionTop < viewHeight && rect.bottom > 0) {
        const progress = (viewHeight - sectionTop) / (viewHeight + sectionHeight);
        const scale = 1 + progress * 0.35;
        imgRef.current.style.transform = `scale(${scale})`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="texture-section" ref={sectionRef}>
      <div className="texture-image-wrapper" ref={imgRef}>
        <img
          src={imgSrc}
          alt="Premium wall material texture with dramatic lighting"
          loading="lazy"
          width="1920"
          height="1080"
        />
      </div>
      <div className="texture-section-overlay"></div>
      <div className="texture-section-content">
        <ScrollReveal>
          <h2>
            <span>Texture</span>
            <span>Creates</span>
            <span>Depth.</span>
          </h2>
        </ScrollReveal>
      </div>
    </section>
  );
}
