import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider } from '../context/SiteContext';
import { lazyWithRetry } from '../utils/lazyWithRetry';

// Direct synchronous import for Login - guarantees no dynamic chunk loading errors on login page
import AdminLogin from './pages/Login';

const AdminLayout = lazyWithRetry(() => import('./components/Layout'));
const AdminDashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const AdminOrders = lazyWithRetry(() => import('./pages/Orders'));
const AdminProducts = lazyWithRetry(() => import('./pages/Products'));
const AdminCategories = lazyWithRetry(() => import('./pages/Categories'));
const AdminSettings = lazyWithRetry(() => import('./pages/Settings'));
const AdminMedia = lazyWithRetry(() => import('./pages/Media'));
const AdminHeroSlides = lazyWithRetry(() => import('./pages/HeroSlides'));
const AdminGallery = lazyWithRetry(() => import('./pages/Gallery'));
const AdminReviews = lazyWithRetry(() => import('./pages/Reviews'));
const AdminStock = lazyWithRetry(() => import('./pages/Stock'));
const AdminSales = lazyWithRetry(() => import('./pages/Sales'));
const AdminPurchases = lazyWithRetry(() => import('./pages/Purchases'));
const AdminCustomers = lazyWithRetry(() => import('./pages/Customers'));
const AdminProfitLoss = lazyWithRetry(() => import('./pages/ProfitLoss'));
const AdminCoupons = lazyWithRetry(() => import('./pages/Coupons'));
const AdminGST = lazyWithRetry(() => import('./pages/GST'));
const AdminPassword = lazyWithRetry(() => import('./pages/Password'));

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
            <Route path="activity" element={<Navigate to="/admin" replace />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="gst" element={<AdminGST />} />
            <Route path="password" element={<AdminPassword />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
