import { useEffect, useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

const features = [
  { num: '01', title: 'Premium Materials', desc: 'We source only the finest materials, ensuring every panel and tile meets the highest standards of quality and visual excellence.' },
  { num: '02', title: 'Expert Guidance', desc: 'Our experienced team helps you select the right materials for your space, providing design consultation from concept to completion.' },
  { num: '03', title: 'Durable Quality', desc: 'Built to last, our products resist wear, moisture, and fading — maintaining their premium appearance for years.' },
  { num: '04', title: 'Modern Aesthetic', desc: 'Contemporary designs that align with current architectural trends, creating interiors that feel refined and current.' },
  { num: '05', title: 'Fast Ordering', desc: 'Streamlined ordering process with quick turnaround times, so your project stays on schedule without compromise.' },
  { num: '06', title: 'Trusted Installation', desc: 'Professional installation support ensuring every panel and tile is fitted with precision for a flawless finish.' },
];

export default function WhyStarHomeDesign() {
  const { settings } = useSite();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = featureRefs.current.indexOf(entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    featureRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="why" id="why-us">
      <div className="container">
        <div className="why-grid">
          <div className="why-left">
            <ScrollReveal>
              <h2 className="section-heading">
                <span>{settings?.whyUsHeading || 'Why Star Home Design'}</span>
              </h2>
              <p>
                We don't just supply materials — we craft experiences.
                Every product is curated for excellence, every interaction built on trust.
              </p>
            </ScrollReveal>
          </div>
          <div className="why-right" ref={containerRef}>
            {features.map((feat, i) => (
              <div
                key={feat.num}
                ref={(el) => (featureRefs.current[i] = el)}
                className={`why-feature ${i === activeIndex ? 'active' : ''}`}
              >
                <div className="why-feature-number">{feat.num}</div>
                <h3 className="why-feature-title">{feat.title}</h3>
                <p className="why-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
