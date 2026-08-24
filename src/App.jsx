import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './admin/context/AuthContext';
import { SiteProvider } from './context/SiteContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Intro from './components/Intro';
import MaterialStory from './components/MaterialStory';
import ProductCollection from './components/ProductCollection';
import WhyStarHomeDesign from './components/WhyStarHomeDesign';
import TextureSection from './components/TextureSection';
import Showroom from './components/Showroom';
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
import './styles/admin.css';

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div className="adm-spinner"/></div>;
  return user ? children : <Navigate to="/admin/login" />;
}

function CustomerSite() {
  const [activeCategory, setActiveCategory] = useState(null);

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
        <ReviewSection />
        <QuoteForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </SiteProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          </Route>
          <Route path="/*" element={<CustomerSite />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
