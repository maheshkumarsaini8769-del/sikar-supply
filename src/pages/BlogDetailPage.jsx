import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { BLOG_ARTICLES } from '../data/blogData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const relatedArticles = BLOG_ARTICLES
    .filter((a) => article.relatedSlugs?.includes(a.slug) || (a.category === article.category && a.slug !== article.slug))
    .slice(0, 2);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${CANONICAL_DOMAIN}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${CANONICAL_DOMAIN}/blog/${article.slug}` },
    ],
  };

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: '2026-03-01T08:00:00+05:30',
    dateModified: '2026-03-15T08:00:00+05:30',
    author: {
      '@type': 'Organization',
      name: 'Star Home Design',
      url: CANONICAL_DOMAIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Star Home Design',
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_DOMAIN}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${CANONICAL_DOMAIN}/blog/${article.slug}`,
    },
  };

  return (
    <div className="site-page">
      <SEOHead
        title={`${article.title} | Star Home Design Sikar`}
        description={article.excerpt}
        canonicalUrl={`${CANONICAL_DOMAIN}/blog/${article.slug}`}
        keywords={`${article.categoryName} Sikar, Interior Design Blog Sikar, Wall Panels Sikar, Star Home Design`}
        ogImage={article.image}
        ogType="article"
        schemas={[breadcrumbSchema, blogPostingSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">{article.categoryName}</span>
            <h1 className="page-title">{article.title}</h1>
            <div className="article-author-strip">
              <span>By {article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <Link to="/blog">Blog</Link>
              <span className="separator">/</span>
              <span className="current">{article.title}</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <article className="blog-detail-article">
          <div className="container">
            <div className="blog-detail-wrapper">
              {/* Main Visual */}
              <div className="blog-main-image-wrap">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="eager"
                  decoding="async"
                  width="1200"
                  height="650"
                />
              </div>

              {/* Lead Excerpt */}
              <div className="blog-lead-box">
                <p>{article.excerpt}</p>
              </div>

              {/* Body Content Sections */}
              <div className="blog-article-body">
                {article.content && article.content.map((sec, idx) => (
                  <ScrollReveal key={idx} delay={idx * 50}>
                    <div className="blog-section-block">
                      <h2>{sec.heading}</h2>
                      <p>{sec.text}</p>
                    </div>
                  </ScrollReveal>
                ))}

                {/* Sikar Local Pro Tip Box */}
                <div className="blog-protip-box">
                  <div className="protip-header">
                    <span className="protip-icon">💡</span>
                    <h3>Star Home Design Interior Advice</h3>
                  </div>
                  <p>
                    Living in Sikar or Shekhawati? Due to intense summer heat and groundwater mineral salts, standard wallpaper and gypsum plaster degrade rapidly. High-density interlocking PVC panels and Stone Polymer Composite (SPC) UV sheets are the most durable materials engineered specifically for our regional climate.
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    <Link to="/get-quote" className="btn-primary btn-sm">
                      Get Free Wall Inspection in Sikar
                    </Link>
                  </div>
                </div>
              </div>

              {/* Author Bio Box */}
              <div className="author-bio-card">
                <div className="author-avatar">★</div>
                <div className="author-info">
                  <h4>Star Home Design Editorial Team</h4>
                  <p>
                    Written by our team of interior designers and wall finishing specialists with over 8 years of hands-on installation experience in Sikar, Rajasthan.
                  </p>
                </div>
              </div>

              {/* WhatsApp Share / Inquire */}
              <div className="blog-share-bar">
                <span>Interested in creating this look?</span>
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                    `Hi Star Home Design, I read your article "${article.title}" and would like to consult with you about doing something similar in my home.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Discuss with Designer on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="about-section quality-section">
            <div className="container">
              <div className="section-header">
                <span className="section-badge">KEEP READING</span>
                <h2>Related Design Guides</h2>
              </div>

              <div className="grid-2">
                {relatedArticles.map((rel) => (
                  <div key={rel.slug} className="blog-card">
                    <div className="blog-card-img-wrap">
                      <img src={rel.image} alt={rel.title} loading="lazy" width="600" height="380" />
                    </div>
                    <div className="blog-card-body">
                      <h3>
                        <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h3>
                      <p>{rel.excerpt.slice(0, 110)}...</p>
                      <Link to={`/blog/${rel.slug}`} className="blog-card-link">
                        Read Story &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
