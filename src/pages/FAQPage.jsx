import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../data/faqData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Frequently Asked Questions', item: `${CANONICAL_DOMAIN}/faq` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: filteredFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Frequently Asked Questions (FAQs) | Star Home Design Sikar"
        description="Comprehensive answers about PVC wall panels, fluted louvers, UV marble sheets, pricing, dampness solutions, and 10-year warranty in Sikar, Rajasthan."
        canonicalUrl={`${CANONICAL_DOMAIN}/faq`}
        keywords="Wall Panels FAQ Sikar, PVC Panels Cost Sikar, Waterproof Panels Questions, Star Home Design FAQ"
        ogType="website"
        schemas={[breadcrumbSchema, faqSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">HELP &amp; ADVICE</span>
            <h1 className="page-title">Frequently Asked Questions</h1>
            <p className="page-subtitle">
              Find clear, straightforward answers about our materials, seepage remedies, installation timelines, transparent pricing, and 10-year warranties in Sikar.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">FAQs</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="faq-page-section">
          <div className="container">
            {/* Search Input */}
            <div className="faq-search-box">
              <input
                type="text"
                placeholder="Search questions by keyword (e.g. seepage, cost, warranty, timeline)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="faq-search-input"
                aria-label="Search FAQs"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                  ×
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="filter-bar">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenIndex(0);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* FAQ Accordion List */}
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <p>No questions matched your search query "{searchQuery}".</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="faq-accordion-list">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <ScrollReveal key={faq.id || idx} delay={idx % 5 * 40}>
                      <div className={`faq-accordion-item ${isOpen ? 'active' : ''}`}>
                        <button
                          className="faq-accordion-btn"
                          onClick={() => toggleFaq(idx)}
                          aria-expanded={isOpen}
                        >
                          <span className="faq-question-text">{faq.q}</span>
                          <span className="faq-icon-indicator">{isOpen ? '−' : '+'}</span>
                        </button>
                        <div
                          className="faq-accordion-content"
                          style={{ display: isOpen ? 'block' : 'none' }}
                        >
                          <p>{faq.a}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            {/* Direct Help Callout */}
            <div className="faq-support-callout">
              <div className="support-icon">💬</div>
              <div className="support-text">
                <h3>Didn't Find What You Were Looking For?</h3>
                <p>
                  Our interior team is available daily from 10:00 AM to 8:00 PM to answer any technical or pricing questions.
                </p>
              </div>
              <div className="support-actions">
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    'Hi Star Home Design, I have a specific question regarding wall panel materials for my house in Sikar.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Ask on WhatsApp
                </a>
                <a href={`tel:${BUSINESS_NAP.rawPhone}`} className="btn-outline">
                  Call {BUSINESS_NAP.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
