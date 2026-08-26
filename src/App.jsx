import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './admin/context/AuthContext';
import { SiteProvider } from './context/SiteContext';
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
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Intro />
        <MaterialStory onProductClick={handleMaterialClick} />
        <ProductCollection activeCategory={activeCategory} />
        <WhyStarHomeDesign />
        <TextureSection />
        <Showroom />
        <GallerySection />
        <ReviewSection />
        <QuoteForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </SiteProvider>
  );
}

import NotFound from './pages/NotFound';

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
          <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
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
            <Route path="cash-sales" element={<AdminSales saleTypeFilter="cash" />} />
            <Route path="online-sales" element={<AdminSales saleTypeFilter="online" />} />
            <Route path="purchases" element={<AdminPurchases />} />
            <Route path="customers" element={<AdminCustomers />} />
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
