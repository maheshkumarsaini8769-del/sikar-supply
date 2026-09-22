import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PROJECTS_LIST } from '../data/projectsData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = PROJECTS_LIST.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const relatedProjects = PROJECTS_LIST
    .filter((p) => project.relatedSlugs?.includes(p.slug) || (p.category === project.category && p.slug !== project.slug))
    .slice(0, 2);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${CANONICAL_DOMAIN}/projects` },
      { '@type': 'ListItem', position: 3, name: project.title, item: `${CANONICAL_DOMAIN}/projects/${project.slug}` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title={`${project.title} in ${project.location} | Star Home Design Project`}
        description={`Interior transformation in ${project.location}. Installed ${project.materialsUsed.join(', ')}. Completed by Star Home Design Sikar.`}
        canonicalUrl={`${CANONICAL_DOMAIN}/projects/${project.slug}`}
        keywords={`${project.title}, Interior Project ${project.location}, Wall Panels Sikar, Star Home Design`}
        ogImage={project.heroImage}
        ogType="article"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">
              <span style={{ marginRight: '6px' }}>📍</span>
              {project.location} • {project.categoryLabel}
            </span>
            <h1 className="page-title">{project.title}</h1>
            <p className="page-subtitle">{project.designType}</p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <Link to="/projects">Projects</Link>
              <span className="separator">/</span>
              <span className="current">{project.title}</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Project Meta Details Bar */}
        <section className="project-meta-strip">
          <div className="container">
            <div className="meta-strip-grid">
              <div className="meta-strip-item">
                <span className="label">Location</span>
                <span className="val">{project.location}</span>
              </div>
              <div className="meta-strip-item">
                <span className="label">Client Type</span>
                <span className="val">{project.clientType}</span>
              </div>
              <div className="meta-strip-item">
                <span className="label">Completed</span>
                <span className="val">{project.completionYear}</span>
              </div>
              <div className="meta-strip-item">
                <span className="label">Category</span>
                <span className="val">{project.categoryLabel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Showcase Image */}
        <section className="about-section" style={{ paddingTop: '20px' }}>
          <div className="container">
            <div className="project-main-hero-image">
              <img
                src={project.heroImage}
                alt={project.title}
                loading="eager"
                decoding="async"
                width="1200"
                height="700"
                onClick={() => setSelectedImage(project.heroImage)}
                style={{ cursor: 'pointer' }}
              />
              <span className="click-to-expand">🔍 Click to zoom</span>
            </div>
          </div>
        </section>

        {/* Project Narrative & Materials */}
        <section className="about-section">
          <div className="container">
            <div className="project-narrative-grid">
              {/* Left Column: Story & Before/After */}
              <ScrollReveal>
                <div className="narrative-content">
                  <span className="section-badge">PROJECT NARRATIVE</span>
                  <h2>Concept &amp; Execution Highlights</h2>
                  <p className="lead-paragraph">{project.description}</p>

                  {/* Before / After Comparison */}
                  {project.beforeAfter && (
                    <div className="before-after-box">
                      <h3>The Transformation</h3>
                      <div className="before-after-grid">
                        <div className="ba-card before">
                          <span className="ba-tag">Initial State / Problem</span>
                          <p>{project.beforeAfter.beforeDesc}</p>
                        </div>
                        <div className="ba-card after">
                          <span className="ba-tag">Star Home Design Solution</span>
                          <p>{project.beforeAfter.afterDesc}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Right Column: Materials & Fast Actions */}
              <ScrollReveal delay={120}>
                <div className="project-sidebar">
                  <div className="sidebar-card">
                    <span className="section-badge">MATERIALS USED</span>
                    <h3>Architectural Finishes</h3>
                    <ul className="materials-used-list">
                      {project.materialsUsed.map((mat, idx) => (
                        <li key={idx}>
                          <span className="mat-dot" />
                          <span>{mat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="sidebar-cta-box">
                      <h4>Want this finish for your home?</h4>
                      <p>Get a fast, itemized estimate based on your exact wall dimensions.</p>
                      <a
                        href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                          `Hi Star Home Design, I am interested in the materials used in "${project.title}" (${project.location}). Please provide cost details.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ display: 'block', textAlign: 'center', marginBottom: '10px' }}
                      >
                        Inquire on WhatsApp
                      </a>
                      <Link
                        to="/get-quote"
                        className="btn-outline"
                        style={{ display: 'block', textAlign: 'center' }}
                      >
                        Request Free Site Visit
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Project Gallery Grid */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="about-section quality-section">
            <div className="container">
              <div className="section-header">
                <span className="section-badge">PHOTO GALLERY</span>
                <h2>Detailed Installation Views</h2>
              </div>

              <div className="project-gallery-grid">
                {project.gallery.map((img, gIdx) => (
                  <ScrollReveal key={gIdx} delay={gIdx * 60}>
                    <div
                      className="project-gallery-thumb"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`${project.title} photo ${gIdx + 1}`} loading="lazy" width="600" height="400" />
                      <span className="zoom-hint">🔍</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="about-section">
            <div className="container">
              <div className="section-header">
                <span className="section-badge">MORE INSPIRATION</span>
                <h2>Similar Interior Projects</h2>
              </div>

              <div className="grid-2">
                {relatedProjects.map((rel) => (
                  <div key={rel.slug} className="project-card">
                    <div className="project-card-image">
                      <img src={rel.heroImage} alt={rel.title} loading="lazy" width="600" height="380" />
                      <span className="project-loc-tag">📍 {rel.location}</span>
                    </div>
                    <div className="project-card-body">
                      <h3>
                        <Link to={`/projects/${rel.slug}`}>{rel.title}</Link>
                      </h3>
                      <p>{rel.description.slice(0, 110)}...</p>
                      <Link to={`/projects/${rel.slug}`} className="btn-detail-link">
                        View Project &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close">
              ✕
            </button>
            <img src={selectedImage} alt={project.title} />
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
