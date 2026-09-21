import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { INTERIOR_GUIDES, PRODUCT_CATEGORIES, BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function GuideDetailPage() {
  const { guideSlug } = useParams();
  const guide = INTERIOR_GUIDES[guideSlug];

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${CANONICAL_DOMAIN}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.h1, item: `${CANONICAL_DOMAIN}/guides/${guide.slug}` },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.metaDescription,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&auto=format&fit=crop&q=85',
    datePublished: guide.publishDate,
    dateModified: '2026-09-21',
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
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${CANONICAL_DOMAIN}/guides/${guide.slug}`,
    },
  };

  return (
    <>
      <SEOHead
        title={guide.title}
        description={guide.metaDescription}
        canonicalUrl={`${CANONICAL_DOMAIN}/guides/${guide.slug}`}
        keywords={`${guide.h1}, ${guide.category}, Star Home Design Sikar`}
        ogType="article"
        schemas={[breadcrumbSchema, articleSchema]}
      />

      <Navbar />

      <main className="seo-page">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-separator" aria-hidden="true">/</li>
              <li className="breadcrumb-item"><Link to="/guides">Guides</Link></li>
              <li className="breadcrumb-separator" aria-hidden="true">/</li>
              <li className="breadcrumb-item breadcrumb-current" aria-current="page">
                {guide.category}
              </li>
            </ol>
          </nav>

          <article className="article-container">
            <header className="article-header">
              <ScrollReveal>
                <div className="article-meta">
                  <span>{guide.category}</span> • <span>{guide.readTime}</span> • <span>Published on {guide.publishDate}</span>
                </div>
                <h1 className="article-title">{guide.h1}</h1>
                <p className="article-excerpt">{guide.excerpt}</p>
              </ScrollReveal>
            </header>

            <div className="article-body">
              {guide.sections.map((section, idx) => (
                <ScrollReveal key={idx} delay={idx * 60}>
                  <section className="article-section">
                    <h2>{section.heading}</h2>
                    <p>{section.content}</p>
                  </section>
                </ScrollReveal>
              ))}

              {/* Related Products CTA Box */}
              {guide.relatedProducts && guide.relatedProducts.length > 0 && (
                <ScrollReveal>
                  <div className="article-cta-box">
                    <h3>Explore Relevant Materials in Sikar</h3>
                    <p>
                      Star Home Design stocks ready inventories of these materials. View designs and specifications:
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {guide.relatedProducts.map((prodSlug) => {
                        const prod = PRODUCT_CATEGORIES[prodSlug];
                        if (!prod) return null;
                        return (
                          <Link
                            key={prodSlug}
                            to={`/products/${prod.slug}`}
                            className="btn-primary"
                            style={{ textDecoration: 'none' }}
                          >
                            Explore {prod.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Showroom Contact Box */}
              <ScrollReveal>
                <div className="showroom-banner" style={{ marginTop: '40px' }}>
                  <div className="showroom-banner-text">
                    <h2>Need Expert Advice for Your Home?</h2>
                    <p>
                      Visit the Star Home Design showroom on <strong>{BUSINESS_NAP.streetAddress}</strong> or speak with our team directly.
                    </p>
                  </div>
                  <div className="category-hero-actions">
                    <a
                      href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                        `Hi Star Home Design, I read your guide "${guide.h1}" and want more information for my home in Sikar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      WhatsApp Consultation
                    </a>
                    <Link to="/guides" className="btn-outline">
                      &larr; Back to All Guides
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
