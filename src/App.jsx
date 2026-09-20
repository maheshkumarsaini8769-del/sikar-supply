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
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Loader from './components/Loader';

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

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div className="adm-spinner"/></div>;
  return user ? children : <Navigate to="/admin/login" />;
}

function SEO() {
  const { settings } = useSite();
  useEffect(() => {
    if (!settings) return;

    // Title
    if (settings.seoTitle) document.title = settings.seoTitle;

    // Helper to set meta
    const setMeta = (attr, name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) { el.setAttribute('content', content); }
      else { el = document.createElement('meta'); el.setAttribute(attr, name); el.content = content; document.head.appendChild(el); }
    };

    // Basic SEO
    setMeta('name', 'description', settings.seoDescription);
    setMeta('name', 'keywords', settings.seoKeywords);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('name', 'author', settings.siteName || 'Star Home Design');
    setMeta('name', 'viewport', 'width=device-width, initial-scale=1');
    setMeta('name', 'theme-color', '#b8956a');

    // Open Graph
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', settings.siteName || 'Star Home Design');
    setMeta('property', 'og:title', settings.seoTitle || settings.siteName);
    setMeta('property', 'og:description', settings.seoDescription);
    setMeta('property', 'og:url', window.location.href);
    if (settings.logo) setMeta('property', 'og:image', settings.logo);
    setMeta('property', 'og:locale', 'en_IN');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', settings.seoTitle || settings.siteName);
    setMeta('name', 'twitter:description', settings.seoDescription);
    if (settings.logo) setMeta('name', 'twitter:image', settings.logo);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href.split('?')[0];

    // Preconnect
    const preconnects = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
    preconnects.forEach(url => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement('link'); link.rel = 'preconnect'; link.href = url; link.crossOrigin = 'anonymous'; document.head.appendChild(link);
      }
    });

    // JSON-LD Structured Data — LocalBusiness
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: settings.siteName || 'Star Home Design',
      description: settings.seoDescription,
      url: window.location.origin,
      telephone: settings.phone || '',
      email: settings.email || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address || 'Sikar',
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '27.6094',
        longitude: '75.1399',
      },
      openingHoursSpecification: settings.openingHours ? {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      } : undefined,
      sameAs: [
        settings.socialLinks?.instagram,
        settings.socialLinks?.facebook,
        settings.socialLinks?.youtube,
      ].filter(Boolean),
      priceRange: '₹₹',
      image: settings.logo || '',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '50',
        bestRating: '5',
      },
    };

    // JSON-LD Organization
    const orgLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings.siteName || 'Star Home Design',
      url: window.location.origin,
      logo: settings.logo || '',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings.phone || '',
        contactType: 'customer service',
        availableLanguage: ['Hindi', 'English'],
      },
    };

    // JSON-LD Website
    const webLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings.siteName || 'Star Home Design',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: window.location.origin + '/?search={search_term_string}',
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
        item: window.location.origin,
      }],
    };

    // Remove old JSON-LD
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add all JSON-LD
    [jsonLd, orgLd, webLd, breadcrumbLd].forEach(data => {
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
      {isSectionActive('about') && <Intro />}
      {isSectionActive('materials') && <MaterialStory onProductClick={onMaterialClick} />}
      {isSectionActive('products') && <ProductCollection activeCategory={activeCategory} />}
      {isSectionActive('whyus') && <WhyStarHomeDesign />}
      {isSectionActive('texture') && <TextureSection />}
      {isSectionActive('showroom') && <Showroom />}
      {isSectionActive('gallery') && <GallerySection />}
      {isSectionActive('reviews') && <ReviewSection />}
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
          <Route path="/:slug" element={<CustomerSite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
