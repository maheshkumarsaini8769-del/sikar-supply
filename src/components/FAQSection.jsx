import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

const FAQS = [
  {
    q: 'PVC Panels vs Paint/Wallpaper — Which is better for Rajasthan homes?',
    a: 'PVC panels are 100% waterproof, termite-proof, and fire-retardant, making them far superior to conventional paint or wallpaper. While paint starts flaking due to wall seelan (dampness) within 1-2 years, PVC panels last over 10 years without losing their luster or requiring repainting.',
  },
  {
    q: 'How much does a standard 10×10 wall paneling cost in Sikar?',
    a: 'A standard 10ft × 10ft wall (100 sq.ft) typically costs between ₹8,500 to ₹14,500 depending on the selected material (PVC Panels, UV Marble Sheets, or Deep Fluted Louvers), including all cutting, hardware, and installation.',
  },
  {
    q: 'Do you provide professional installation services in Sikar and nearby towns?',
    a: 'Yes! Star Home Design has an in-house team of master installers providing turnkey installation services across Sikar, Jaipur, Jhunjhunu, Churu, Nawalgarh, Laxmangarh, Fatehpur, and surrounding regions in Rajasthan.',
  },
  {
    q: 'Can PVC or Fluted Louvers be installed on walls with active moisture (seelan)?',
    a: 'Yes, absolutely. PVC panels and charcoal louvers are non-porous and do not absorb moisture. When installed with aluminum or PVC battens, they create an air gap that permanently seals and conceals damaged plaster and seepage without any rotting.',
  },
  {
    q: 'How long does the installation take for a bedroom or living room?',
    a: 'Most residential wall projects (such as TV units, bed backdrops, or feature walls) are completed within 1 to 2 days with zero dust, cement, or wet mess. You can start using the room immediately.',
  },
  {
    q: 'Can I visit the showroom to see physical samples and textures before buying?',
    a: 'Yes, we warmly welcome you! Our flagship showroom is located on Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar, Rajasthan. We display full-size ceiling, wall, and louver setups. Open Monday to Saturday from 9:00 AM to 7:00 PM.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-section" id="faqs">
      <div className="container">
        <ScrollReveal>
          <div className="section-header-centered">
            <span className="eyebrow">Got Questions?</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-description">
              Find instant answers regarding pricing, materials, installation, and showroom visits in Sikar.
            </p>
          </div>
        </ScrollReveal>

        <div className="faq-accordion-wrapper">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollReveal key={idx} delay={idx * 50}>
                <div className={`faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{faq.q}</span>
                    <span className="faq-icon-indicator">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Quick Contact Prompt */}
        <div className="faq-help-bar">
          <div>
            <h4>Still have questions about your project?</h4>
            <p>Speak directly with our showroom materials expert in Sikar.</p>
          </div>
          <a
            href="https://wa.me/918239409535?text=Hello%20Star%20Home%20Design,%20I%20have%20a%20question%20about%20interior%20materials"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Chat with Expert on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
