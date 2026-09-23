import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SiteProvider, useSite } from './context/SiteContext';
import { trackPageview } from './utils/analytics';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Intro from './components/Intro';
import MaterialStory from './components/MaterialStory';
import ProductCollection from './components/ProductCollection';
import WhyStarHomeDesign from './components/WhyStarHomeDesign';
import TextureSection from './components/TextureSection';
import Showroom from './components/Showroom';
import GallerySection from './components/GallerySection';
import QuoteForm from './components/QuoteForm';
import ReviewSection from './components/ReviewSection';
import HomeFAQ from './components/HomeFAQ';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

import { HOMEPAGE_SEO, SCO_DIRECT_ANSWERS, BUSINESS_NAP, CANONICAL_DOMAIN } from './data/seoData';

// Lazy-loaded Customer Pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProcessPage = lazy(() => import('./pages/ProcessPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const GetQuotePage = lazy(() => import('./pages/GetQuotePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const CancellationRefundPolicyPage = lazy(() => import('./pages/CancellationRefundPolicyPage'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Isolated Lazy Admin Module
const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));
const SitePageWrapper = lazy(() => import('./components/SitePageWrapper'));

import './styles/global.css';
import './styles/animations.css';
import './styles/navbar.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/products.css';
import './styles/why.css';
import './styles/showroom.css';
import './styles/form.css';
import './styles/footer.css';
import './styles/reviews.css';
import './styles/gallery.css';

function SEO() {
  const { settings } = useSite();
  useEffect(() => {
    const pageTitle = settings?.seoTitle || HOMEPAGE_SEO.title;
    const pageDesc = settings?.seoDescription || HOMEPAGE_SEO.metaDescription;
    const pageKeywords = settings?.seoKeywords || HOMEPAGE_SEO.keywords.join(', ');

    // Title
    document.title = pageTitle;

    // Helper to set meta
    const setMeta = (attr, name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) { el.setAttribute('content', content); }
      else { el = document.createElement('meta'); el.setAttribute(attr, name); el.content = content; document.head.appendChild(el); }
    };

    // Basic SEO
    setMeta('name', 'description', pageDesc);
    setMeta('name', 'keywords', pageKeywords);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('name', 'author', settings?.siteName || BUSINESS_NAP.name);
    setMeta('name', 'viewport', 'width=device-width, initial-scale=1');
    setMeta('name', 'theme-color', '#b8956a');

    // Geo Targeting
    setMeta('name', 'geo.region', 'IN-RJ');
    setMeta('name', 'geo.placename', 'Sikar');
    setMeta('name', 'geo.position', '27.6094;75.1399');
    setMeta('name', 'ICBM', '27.6094, 75.1399');

    // Open Graph
    const canonicalUrl = `${CANONICAL_DOMAIN}/`;
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', settings?.siteName || BUSINESS_NAP.name);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDesc);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', settings?.logo || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&auto=format&fit=crop&q=85');
    setMeta('property', 'og:locale', 'en_IN');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDesc);
    setMeta('name', 'twitter:image', settings?.logo || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&auto=format&fit=crop&q=85');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;

    // Preconnect
    const preconnects = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://images.unsplash.com'];
    preconnects.forEach(url => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement('link'); link.rel = 'preconnect'; link.href = url; link.crossOrigin = 'anonymous'; document.head.appendChild(link);
      }
    });

    // JSON-LD Structured Data — LocalBusiness (Strictly genuine details, NO fake ratings)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: settings?.siteName || BUSINESS_NAP.name,
      description: pageDesc,
      url: CANONICAL_DOMAIN,
      telephone: settings?.phone || BUSINESS_NAP.phone,
      email: settings?.email || BUSINESS_NAP.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings?.address || BUSINESS_NAP.streetAddress,
        addressLocality: 'Sikar',
        addressRegion: 'Rajasthan',
        postalCode: '332001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '27.6094',
        longitude: '75.1399',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '11:00',
          closes: '17:00',
        }
      ],
      areaServed: [
        { '@type': 'City', name: 'Sikar' },
        { '@type': 'City', name: 'Jaipur' },
        { '@type': 'City', name: 'Jhunjhunu' },
        { '@type': 'City', name: 'Churu' },
        { '@type': 'State', name: 'Rajasthan' },
      ],
      sameAs: [
        settings?.socialLinks?.instagram || BUSINESS_NAP.socialLinks.instagram,
        settings?.socialLinks?.facebook || BUSINESS_NAP.socialLinks.facebook,
        settings?.socialLinks?.youtube || BUSINESS_NAP.socialLinks.youtube,
      ].filter(Boolean),
      image: settings?.logo || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&auto=format&fit=crop&q=85',
    };

    // JSON-LD Organization
    const orgLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings?.siteName || BUSINESS_NAP.name,
      url: CANONICAL_DOMAIN,
      logo: settings?.logo || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings?.phone || BUSINESS_NAP.phone,
        contactType: 'customer service',
        availableLanguage: ['Hindi', 'English'],
      },
    };

    // JSON-LD Website
    const webLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings?.siteName || BUSINESS_NAP.name,
      url: CANONICAL_DOMAIN,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${CANONICAL_DOMAIN}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    // BreadcrumbList
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: CANONICAL_DOMAIN,
      }],
    };

    // FAQPage JSON-LD (strictly matching visible SCO questions)
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SCO_DIRECT_ANSWERS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.shortAnswer + ' ' + faq.details,
        },
      })),
    };

    // Remove old JSON-LD
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add all JSON-LD
    [jsonLd, orgLd, webLd, breadcrumbLd, faqLd].forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [settings]);
  return null;
}

function CustomerSite() {
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const handleMaterialClick = (category) => {
    setActiveCategory(category);
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <SiteProvider>
      <SEO />
      <Navbar onSearchProduct={handleMaterialClick} />
      <MainContent activeCategory={activeCategory} onMaterialClick={handleMaterialClick} />
      <Footer />
      <WhatsAppButton />
    </SiteProvider>
  );
}

function MainContent({ activeCategory, onMaterialClick }) {
  const { settings } = useSite();

  const isSectionActive = (id) => {
    const section = settings?.homeSections?.find(s => s.id === id);
    return section ? section.active : true;
  };

  return (
    <main>
      {isSectionActive('hero') && <Hero />}
      {isSectionActive('stats') && <Stats />}
      {isSectionActive('materials') && <MaterialStory onProductClick={onMaterialClick} />}
      {isSectionActive('products') && <ProductCollection activeCategory={activeCategory} />}
      {isSectionActive('about') && <Intro />}
      {isSectionActive('gallery') && <GallerySection />}
      {isSectionActive('whyus') && <WhyStarHomeDesign />}
      {isSectionActive('texture') && <TextureSection />}
      {isSectionActive('showroom') && <Showroom />}
      {isSectionActive('reviews') && <ReviewSection />}
      <HomeFAQ />
      {isSectionActive('contact') && <QuoteForm />}
    </main>
  );
}

function PageviewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname + location.hash);
  }, [location]);
  return null;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageviewTracker />
      <Suspense fallback={<div className="page-route-loader"><div className="route-spinner" /></div>}>
        <Routes>
          {/* Lazy-loaded Isolated Admin Subsystem */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Homepage */}
          <Route path="/" element={<CustomerSite />} />

          {/* Core Multi-Page Routes */}
          <Route path="/about" element={<SiteProvider><SitePageWrapper><AboutPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/services" element={<SiteProvider><SitePageWrapper><ServicesPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/services/:serviceSlug" element={<SiteProvider><SitePageWrapper><ServiceDetailPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/products" element={<SiteProvider><SitePageWrapper><ProductsPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/products/:slug" element={<SiteProvider><SitePageWrapper><ProductDetailPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/projects" element={<SiteProvider><SitePageWrapper><ProjectsPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/projects/:slug" element={<SiteProvider><SitePageWrapper><ProjectDetailPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/gallery" element={<SiteProvider><SitePageWrapper><GalleryPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/process" element={<SiteProvider><SitePageWrapper><ProcessPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/pricing" element={<SiteProvider><SitePageWrapper><PricingPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/get-quote" element={<SiteProvider><SitePageWrapper><GetQuotePage /></SitePageWrapper></SiteProvider>} />
          <Route path="/contact" element={<SiteProvider><SitePageWrapper><ContactPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/faq" element={<SiteProvider><SitePageWrapper><FAQPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/blog" element={<SiteProvider><SitePageWrapper><BlogPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/blog/:slug" element={<SiteProvider><SitePageWrapper><BlogDetailPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/privacy-policy" element={<SiteProvider><SitePageWrapper><PrivacyPolicyPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/terms-and-conditions" element={<SiteProvider><SitePageWrapper><TermsConditionsPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/cancellation-refund-policy" element={<SiteProvider><SitePageWrapper><CancellationRefundPolicyPage /></SitePageWrapper></SiteProvider>} />

          {/* SEO Guides */}
          <Route path="/guides" element={<SiteProvider><SitePageWrapper><GuidesPage /></SitePageWrapper></SiteProvider>} />
          <Route path="/guides/:guideSlug" element={<SiteProvider><SitePageWrapper><GuideDetailPage /></SitePageWrapper></SiteProvider>} />

          {/* Catch-all Not Found */}
          <Route path="*" element={<SiteProvider><SitePageWrapper><NotFound /></SitePageWrapper></SiteProvider>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
