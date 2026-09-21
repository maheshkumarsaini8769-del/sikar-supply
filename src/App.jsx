import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './admin/context/AuthContext';
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
import Loader from './components/Loader';

import ProductCategoryPage from './pages/ProductCategoryPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import { HOMEPAGE_SEO, SCO_DIRECT_ANSWERS, BUSINESS_NAP, CANONICAL_DOMAIN } from './data/seoData';

import AdminLayout from './admin/components/Layout';
import AdminLogin from './admin/pages/Login';
import AdminDashboard from './admin/pages/Dashboard';
import AdminOrders from './admin/pages/Orders';
import AdminProducts from './admin/pages/Products';
import AdminCategories from './admin/pages/Categories';
import AdminSettings from './admin/pages/Settings';
import AdminMedia from './admin/pages/Media';
import AdminHeroSlides from './admin/pages/HeroSlides';
import AdminGallery from './admin/pages/Gallery';
import AdminReviews from './admin/pages/Reviews';
import AdminStock from './admin/pages/Stock';
import AdminSales from './admin/pages/Sales';
import AdminPurchases from './admin/pages/Purchases';
import AdminCustomers from './admin/pages/Customers';
import AdminProfitLoss from './admin/pages/ProfitLoss';
import AdminActivity from './admin/pages/Activity';
import AdminCoupons from './admin/pages/Coupons';
import NotFound from './pages/NotFound';

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
import './styles/admin.css';
import './styles/seoPages.css';

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div className="adm-spinner"/></div>;
  return user ? children : <Navigate to="/admin/login" />;
}

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
      <Loader />
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageviewTracker />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<SiteProvider><ProtectedAdmin><AdminLayout /></ProtectedAdmin></SiteProvider>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="hero-slides" element={<AdminHeroSlides />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="all-sales" element={<AdminSales />} />
            <Route path="cash-sales" element={<AdminSales saleTypeFilter="cash" />} />
            <Route path="online-sales" element={<AdminSales saleTypeFilter="online" />} />
            <Route path="purchases" element={<AdminPurchases />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="profit-loss" element={<AdminProfitLoss />} />
            <Route path="activity" element={<AdminActivity />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
          <Route path="/" element={<CustomerSite />} />
          <Route path="/products/:categorySlug" element={<SiteProvider><ProductCategoryPage /></SiteProvider>} />
          <Route path="/guides" element={<SiteProvider><GuidesPage /></SiteProvider>} />
          <Route path="/guides/:guideSlug" element={<SiteProvider><GuideDetailPage /></SiteProvider>} />
          <Route path="/:slug" element={<CustomerSite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
