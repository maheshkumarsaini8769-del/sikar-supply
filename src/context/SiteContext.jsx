import { createContext, useContext, useState, useEffect } from 'react';

const SiteContext = createContext(null);
const API_URL = '/api';

const defaultSettings = {
  siteName: 'Star Home Design',
  siteTagline: 'Premium Interior Materials',
  phone: '+918239409535',
  whatsapp: '918239409535',
  email: 'info@starhomedesign.com',
  address: 'Sikar, Rajasthan',
  heroEyebrow: 'STAR HOME DESIGN',
  heroHeading: 'Transform Your Space',
  heroDescription: 'Premium interior materials for modern living',
  heroBtnText: 'Explore Collection',
  aboutHeading: 'Crafting Interiors That Inspire',
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [setRes, prodRes, catRes, galRes, revRes] = await Promise.all([
        fetch(`${API_URL}/settings`).then(r => r.json()),
        fetch(`${API_URL}/products?active=true`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json()),
        fetch(`${API_URL}/gallery`).then(r => r.json()),
        fetch(`${API_URL}/reviews`).then(r => r.json()),
      ]);
      if (setRes.success) setSettings(setRes.settings);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories.filter(c => c.active));
      if (galRes.success) setGallery(galRes.gallery);
      if (revRes.success) setReviews(revRes.reviews);
    } catch (e) {
      console.error('Failed to load site data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

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
