import { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';
import { SCO_DIRECT_ANSWERS } from '../data/seoData';

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq-header text-center">
          <ScrollReveal>
            <p className="section-eyebrow">COMMON QUESTIONS</p>
            <h2 className="section-heading" id="faq-heading">
              Frequently Asked Questions &amp; Direct Answers
            </h2>
            <p className="faq-subtitle">
              Clear, practical advice on selecting PVC panels, fluted textures, and UV marble sheets for Sikar homes.
            </p>
          </ScrollReveal>
        </div>

        <div className="faq-list">
          {SCO_DIRECT_ANSWERS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal key={item.id} delay={index * 60}>
                <div className={`faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-btn-${item.id}`}
                  >
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-icon" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <div
                    className="faq-answer"
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    style={{ display: isOpen ? 'block' : 'none' }}
                  >
                    <p className="faq-direct-answer">
                      <strong>Direct Answer: </strong>
                      {item.shortAnswer}
                    </p>
                    <p className="faq-details">{item.details}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="faq-guides-callout">
          <ScrollReveal delay={200}>
            <p>
              Looking for installation tips, comparison guides, and design inspiration?{' '}
              <Link to="/guides" className="faq-link">
                Read our Sikar Home Interior Guides &rarr;
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
