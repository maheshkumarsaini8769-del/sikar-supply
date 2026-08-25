import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';
import { UPLOAD_URL } from '../api';

export default function Intro() {
  const { settings } = useSite();

  return (
    <section className="intro" id="about">
      <div className="container">
        <div className="intro-grid">
          <ScrollReveal>
            <div className="intro-image">
              <img
                src={settings?.aboutImage && typeof settings.aboutImage === 'string' ? (settings.aboutImage.startsWith('http') ? settings.aboutImage : UPLOAD_URL + settings.aboutImage) : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop'}
                alt="About Star Home Design"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="intro-content">
              <p className="section-eyebrow">About Us</p>
              <h2 className="section-heading">{settings?.aboutHeading || 'Crafting Interiors That Inspire'}</h2>
              <p className="intro-text">
                {settings?.aboutDescription || 'At Star Home Design, we believe every space tells a story. Based in the heart of Sikar, Rajasthan, we bring you an curated collection of premium interior materials — from sleek PVC panels and architectural fluted designs to luxurious UV sticker sheets and decorative tiles that transform ordinary rooms into extraordinary experiences.'}
              </p>
              <p className="intro-text">
                Our mission is simple: make world-class interior design accessible, affordable, and effortlessly beautiful for every home and business.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
