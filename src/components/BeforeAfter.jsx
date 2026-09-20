import { useState, useRef, useCallback } from 'react';
import ScrollReveal from './ScrollReveal';

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percent = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleClick = (e) => {
    handleMove(e.clientX);
  };

  return (
    <section className="before-after-section" id="visualizer">
      <div className="container">
        <ScrollReveal>
          <div className="section-header-centered">
            <span className="eyebrow">Real Transformations</span>
            <h2 className="section-heading">Witness The Difference</h2>
            <p className="section-description">
              साधारण सेलन वाली दीवारों को लग्जरी मॉडर्न इंटीरियर में बदलें। स्लाइडर को ड्रैग करके देखें ट्रांसफॉर्मेशन।
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div
            ref={containerRef}
            className="ba-container"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* After Image (Full width background) */}
            <div className="ba-image-layer after-layer">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=85&auto=format&fit=crop"
                alt="Luxury Fluted PVC Wall Panels After Transformation"
                loading="lazy"
              />
              <span className="ba-badge after-badge">✨ AFTER: Star Home Design</span>
            </div>

            {/* Before Image (Clipped with CSS clip-path) */}
            <div
              className="ba-image-layer before-layer"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&q=85&auto=format&fit=crop"
                alt="Bare Rough Cement Wall Before Transformation"
                loading="lazy"
              />
              <span className="ba-badge before-badge">⚠️ BEFORE: Damp Wall</span>
            </div>

            {/* Slider Handle Divider */}
            <div
              className="ba-handle"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="ba-handle-line"></div>
              <div className="ba-handle-button" aria-label="Drag comparison slider">
                <span>◀</span>
                <span>▶</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature Comparison Highlights */}
        <div className="ba-highlights-grid">
          <div className="ba-highlight-item">
            <div className="ba-highlight-icon">💧</div>
            <h4>Seepage & Seelan Proof</h4>
            <p>100% moisture-resistant panels permanently hide peeling paint & fungus.</p>
          </div>
          <div className="ba-highlight-item">
            <div className="ba-highlight-icon">⏱️</div>
            <h4>1-Day Clean Install</h4>
            <p>Dry tongue-and-groove fitting. No cement, sand, dust or room vacancy needed.</p>
          </div>
          <div className="ba-highlight-item">
            <div className="ba-highlight-icon">✨</div>
            <h4>Zero Maintenance</h4>
            <p>Simply wipe with damp cloth. No whitewash, repainting or polishing for 10+ years.</p>
          </div>
          <div className="ba-highlight-item">
            <div className="ba-highlight-icon">💰</div>
            <h4>Cost-Effective Luxury</h4>
            <p>Half the cost of natural wood panelling or marble cladding with double the lifespan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
