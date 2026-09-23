import { createContext, useContext, useState, useEffect } from 'react';

const SiteContext = createContext(null);
const API_URL = '/api';

const defaultSettings = {
  siteName: 'Star Home Design',
  siteTagline: 'Premium Interior Materials',
  phone: '+91 82394 09535',
  whatsapp: '918239409535',
  email: 'skysk9535@gmail.com',
  address: 'Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar, Rajasthan',
  heroEyebrow: 'STAR HOME DESIGN',
  heroHeading: 'Transform Your Space',
  heroDescription: 'Premium interior materials for modern living',
  heroBtnText: 'Explore Collection',
  aboutHeading: 'Crafting Interiors That Inspire',
  aboutDescription: 'At Star Home Design, we believe every space tells a story. Based in the heart of Sikar, Rajasthan, we bring you a curated collection of premium interior materials — from sleek PVC panels and architectural fluted designs to luxurious UV marble sheets and decorative wall tiles that transform ordinary rooms into extraordinary experiences.',
  whyUsHeading: 'Why Star Home Design',
  showroomHeading: 'Visit Our Showroom',
  homeSections: [
    { id: 'hero', name: 'Hero', active: true },
    { id: 'stats', name: 'Stats', active: true },
    { id: 'materials', name: 'Material Story', active: true },
    { id: 'products', name: 'Products Collection', active: true },
    { id: 'about', name: 'About Us', active: true },
    { id: 'gallery', name: 'Gallery', active: true },
    { id: 'whyus', name: 'Why Us', active: true },
    { id: 'texture', name: 'Texture', active: true },
    { id: 'showroom', name: 'Showroom', active: true },
    { id: 'reviews', name: 'Reviews', active: true },
    { id: 'contact', name: 'Contact Form', active: true },
  ],
  heroSlides: [],
};

const CACHE_KEY = 'shd_site_cache_v2';

function getSessionCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < 300000) { // 5 minutes cache
      return parsed.data;
    }
  } catch {}
  return null;
}

function setSessionCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export function SiteProvider({ children }) {
  const cached = getSessionCache();

  const [settings, setSettings] = useState(cached?.settings || defaultSettings);
  const [products, setProducts] = useState(cached?.products || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [gallery, setGallery] = useState(cached?.gallery || []);
  const [reviews, setReviews] = useState(cached?.reviews || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let isMounted = true;

    const fetchCritical = async () => {
      try {
        const [setRes, catRes] = await Promise.all([
          fetch(`${API_URL}/settings`).then(r => r.json()),
          fetch(`${API_URL}/categories`).then(r => r.json())
        ]);
        if (!isMounted) return;
        if (setRes?.success) setSettings(setRes.settings);
        if (catRes?.success) setCategories(catRes.categories.filter(c => c.active));
      } catch (e) {
        console.error('Critical site fetch error:', e);
      }
    };

    const fetchSecondary = async () => {
      try {
        const [prodRes, galRes, revRes] = await Promise.all([
          fetch(`${API_URL}/products?active=true`).then(r => r.json()),
          fetch(`${API_URL}/gallery`).then(r => r.json()),
          fetch(`${API_URL}/reviews`).then(r => r.json()),
        ]);
        if (!isMounted) return;
        if (prodRes?.success) setProducts(prodRes.products);
        if (galRes?.success) setGallery(galRes.gallery);
        if (revRes?.success) setReviews(revRes.reviews);
      } catch (e) {
        console.error('Secondary site fetch error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCritical();
    const timer = setTimeout(fetchSecondary, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
      setSessionCache({ settings, products, categories, gallery, reviews });
    }
  }, [settings, products, categories, gallery, reviews]);

  const refreshProducts = async () => {
    const res = await fetch(`${API_URL}/products?active=true`).then(r => r.json());
    if (res.success) setProducts(res.products);
  };

  const refreshSettings = async () => {
    const res = await fetch(`${API_URL}/settings`).then(r => r.json());
    if (res.success) setSettings(res.settings);
  };

  const refreshGallery = async () => {
    const res = await fetch(`${API_URL}/gallery`).then(r => r.json());
    if (res.success) setGallery(res.gallery);
  };

  const refreshReviews = async () => {
    const res = await fetch(`${API_URL}/reviews`).then(r => r.json());
    if (res.success) setReviews(res.reviews);
  };

  const deleteReview = async (id) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    refreshReviews();
  };

  const addReview = async (fd) => {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      body: fd,
    });
    const data = await res.json();
    if (data.success) refreshReviews();
    return data;
  };

  return (
    <SiteContext.Provider value={{
      settings, products, categories, gallery, reviews, loading,
      refreshProducts, refreshSettings, refreshGallery, refreshReviews, deleteReview, addReview, setReviews
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
