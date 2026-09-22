import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { PROJECTS_LIST, PROJECT_FILTERS } from '../data/projectsData';
import { BUSINESS_NAP, CANONICAL_DOMAIN } from '../data/seoData';

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProjects = PROJECTS_LIST.filter((proj) => {
    if (activeFilter === 'all') return true;
    return proj.allCategories ? proj.allCategories.includes(activeFilter) : proj.category === activeFilter;
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_DOMAIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${CANONICAL_DOMAIN}/projects` },
    ],
  };

  return (
    <div className="site-page">
      <SEOHead
        title="Interior & Wall Panel Projects in Sikar | Portfolio | Star Home Design"
        description="Explore completed interior transformations across Sikar, Piprali Road, Radhakishanpura, and Bajor. PVC wall panels, fluted TV units, UV marble sheets, and false ceilings."
        canonicalUrl={`${CANONICAL_DOMAIN}/projects`}
        keywords="Interior Design Projects Sikar, Wall Panels Portfolio Sikar, TV Unit Designs Sikar, Star Home Design Portfolio"
        ogType="website"
        schemas={[breadcrumbSchema]}
      />

      <Navbar />

      <header className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-eyebrow">PORTFOLIO &amp; TRANSFORMATIONS</span>
            <h1 className="page-title">Real Homes Transformed Across Sikar &amp; Shekhawati</h1>
            <p className="page-subtitle">
              Take a walk through our completed residential and commercial projects. See how our waterproof PVC panels, fluted louvers, and UV marble sheets turn problematic walls into stunning interior showcases.
            </p>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Projects</span>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="about-section">
          <div className="container">
            {/* Filter Buttons */}
            <div className="filter-bar">
              {PROJECT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
              {filteredProjects.map((project, idx) => (
                <ScrollReveal key={project.slug} delay={idx % 3 * 70}>
                  <div className="project-card">
                    <div className="project-card-image">
                      <img
                        src={project.heroImage}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        width="700"
                        height="460"
                      />
                      <span className="project-cat-tag">{project.categoryLabel}</span>
                      <span className="project-loc-tag">📍 {project.location}</span>
                    </div>

                    <div className="project-card-body">
                      <h3 className="project-title">
                        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                      </h3>
                      <p className="project-desc">{project.description.slice(0, 130)}...</p>

                      <div className="project-materials-tags">
                        {project.materialsUsed.slice(0, 2).map((mat, mIdx) => (
                          <span key={mIdx} className="mat-tag">
                            {mat}
                          </span>
                        ))}
                      </div>

                      <div className="project-card-actions">
                        <Link to={`/projects/${project.slug}`} className="btn-detail-link">
                          View Project Story &rarr;
                        </Link>
                        <a
                          href={`https://wa.me/${BUSINESS_NAP.whatsapp}?text=${encodeURIComponent(
                            `Hi Star Home Design, I loved your project "${project.title}" in ${project.location}. Can you provide a quotation for a similar design in my home?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-wa-icon"
                          title="Ask on WhatsApp"
                          aria-label="Ask on WhatsApp"
                        >
                          WA
                        </a>
                      </div>
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
              <h2>Love One of These Designs for Your Home?</h2>
              <p>
                We can adapt any layout, color theme, and material combination to fit your exact room measurements and budget in Sikar.
              </p>
              <div className="cta-buttons">
                <Link to="/get-quote" className="btn-primary">
                  Get a Free Measurement Visit
                </Link>
                <Link to="/gallery" className="btn-outline">
                  Browse Visual Gallery
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
