import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider } from '../context/SiteContext';

const AdminLayout = lazy(() => import('./components/Layout'));
const AdminLogin = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const AdminOrders = lazy(() => import('./pages/Orders'));
const AdminProducts = lazy(() => import('./pages/Products'));
const AdminCategories = lazy(() => import('./pages/Categories'));
const AdminSettings = lazy(() => import('./pages/Settings'));
const AdminMedia = lazy(() => import('./pages/Media'));
const AdminHeroSlides = lazy(() => import('./pages/HeroSlides'));
const AdminGallery = lazy(() => import('./pages/Gallery'));
const AdminReviews = lazy(() => import('./pages/Reviews'));
const AdminStock = lazy(() => import('./pages/Stock'));
const AdminSales = lazy(() => import('./pages/Sales'));
const AdminPurchases = lazy(() => import('./pages/Purchases'));
const AdminCustomers = lazy(() => import('./pages/Customers'));
const AdminProfitLoss = lazy(() => import('./pages/ProfitLoss'));
const AdminActivity = lazy(() => import('./pages/Activity'));
const AdminCoupons = lazy(() => import('./pages/Coupons'));

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div className="adm-spinner"/></div>;
  return user ? children : <Navigate to="/admin/login" />;
}

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="page-route-loader"><div className="route-spinner" /></div>}>
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route path="" element={<SiteProvider><ProtectedAdmin><AdminLayout /></ProtectedAdmin></SiteProvider>}>
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
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
