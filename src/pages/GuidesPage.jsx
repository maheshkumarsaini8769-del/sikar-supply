import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { INTERIOR_GUIDES, CANONICAL_DOMAIN } from '../data/seoData';

export default function GuidesPage() {
  const guideList = Object.values(INTERIOR_GUIDES);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${CANONICAL_DOMAIN}/guides` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Home Interior & Wall Panel Guides for Sikar Homeowners',
    description: 'Practical guides and expert advice on PVC panels, fluted textures, UV marble sheets, and modern home decoration in Sikar, Rajasthan.',
    numberOfItems: guideList.length,
    itemListElement: guideList.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.h1,
      url: `${CANONICAL_DOMAIN}/guides/${g.slug}`,
    })),
  };

  return (
    <>
      <SEOHead
        title="Home Interior & Wall Panel Guides | Star Home Design Sikar"
        description="Expert guides on PVC wall panels, fluted louvers, UV marble sheets, and interior decoration for homes in Sikar and Rajasthan. Read actionable tips."
        canonicalUrl={`${CANONICAL_DOMAIN}/guides`}
        keywords="PVC Wall Panels Guide, Fluted Panel Ideas, UV Marble Sheet Installation, Interior Design Sikar, Star Home Design Guides"
        schemas={[breadcrumbSchema, itemListSchema]}
      />

      <Navbar />

      <main className="seo-page">
        <div className="container">
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-separator" aria-hidden="true">/</li>
              <li className="breadcrumb-item breadcrumb-current" aria-current="page">Interior Guides</li>
            </ol>
          </nav>

          <header className="category-hero text-center">
            <ScrollReveal>
              <span className="category-hero-badge">EXPERT INTERIOR ADVICE</span>
              <h1>Home Interior &amp; Wall Panel Guides</h1>
              <p className="category-hero-intro" style={{ margin: '0 auto 24px' }}>
                Practical advice, material comparisons, and modern design ideas crafted specifically for homeowners, builders, and architects in Sikar and Shekhawati.
              </p>
            </ScrollReveal>
          </header>

          <section className="seo-section" aria-labelledby="all-guides-heading">
            <div className="guides-grid">
              {guideList.map((guide, i) => (
                <ScrollReveal key={guide.slug} delay={i * 80}>
                  <Link to={`/guides/${guide.slug}`} className="guide-card">
                    <div>
                      <div className="guide-card-tag">{guide.category}</div>
                      <h2>{guide.h1}</h2>
                      <p>{guide.excerpt}</p>
                    </div>
                    <div className="guide-card-footer">
                      <span>{guide.readTime}</span>
                      <span className="guide-card-cta">Read Guide &rarr;</span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
