import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { BLOG_CATEGORIES, BLOG_ARTICLES } from '../data/blogData';
import { CANONICAL_DOMAIN } from '../data/seoData';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredArticles = BLOG_ARTICLES.filter((art) => {
    if (activeCategory === 'all') return true;
    return art.category === activeCategory;
  });

  const featuredArticle = BLOG_ARTICLES[0];
  const gridArticles = activeCategory === 'all' ? filteredArticles.slice(1) : filteredArticles;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${CANONICAL_DOMAIN}/blog` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Interior Design Ideas, Guides & Trends in Sikar | Star Home Design Blog"
        description="Expert advice on PVC wall panels, fluted louvers, UV marble sheets, dampness remedies, and modern home decor for Sikar and Rajasthan homes."
        canonicalUrl={`${CANONICAL_DOMAIN}/blog`}
        keywords="Interior Design Blog Sikar, Wall Panels Ideas, TV Unit Design Trends, Home Decoration Tips Rajasthan"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">DESIGN MAGAZINE &amp; TIPS</span>
            <h1 className="page-title">Interior Design Ideas, Guides &amp; Inspiration</h1>
            <p className="page-subtitle">
              Expert advice, material comparisons, and modern design trends specifically crafted for homeowners in Sikar, Jhunjhunu, and Rajasthan.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Blog</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="blog-section">
          <div className="container">
            {/* Category Filter Bar */}
            <div className="filter-bar">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Featured Article Card (only on 'all' tab) */}
            {activeCategory === 'all' && featuredArticle && (
              <div className="featured-article-card">
                <div className="featured-img-wrap">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    loading="eager"
                    decoding="async"
                    width="800"
                    height="500"
                  />
                  <span className="featured-pill">FEATURED GUIDE</span>
                </div>
                <div className="featured-content">
                  <div className="article-meta">
                    <span className="cat-badge">{featuredArticle.categoryName}</span>
                    <span className="meta-sep">•</span>
                    <span>{featuredArticle.date}</span>
                    <span className="meta-sep">•</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <h2>
                    <Link to={`/blog/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
                  </h2>
                  <p>{featuredArticle.excerpt}</p>
                  <Link to={`/blog/${featuredArticle.slug}`} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Read Full Article &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Regular Grid */}
            <div className="blog-grid">
              {gridArticles.map((art, idx) => (
                <ScrollReveal key={art.slug} delay={idx % 3 * 60}>
                  <div className="blog-card">
                    <div className="blog-card-img-wrap">
                      <img
                        src={art.image}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="400"
                      />
                      <span className="blog-card-cat">{art.categoryName}</span>
                    </div>

                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span>{art.date}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h3>
                        <Link to={`/blog/${art.slug}`}>{art.title}</Link>
                      </h3>
                      <p className="blog-card-excerpt">{art.excerpt.slice(0, 115)}...</p>
                      <Link to={`/blog/${art.slug}`} className="blog-card-link">
                        Read Story &rarr;
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="page-cta-section">
          <div className="container">
            <div className="cta-banner">
              <h2>Inspired by One of Our Design Ideas?</h2>
              <p>
                Bring these concepts to life in your living room, bedroom, or office with Sikar’s trusted interior craftsmen.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Request Free Site Visit
                </Link>
                <Link to="/products" className="btn-outline">
                  Explore Panel Catalog
                </Link>
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
