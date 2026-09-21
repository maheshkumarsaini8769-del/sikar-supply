import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CANONICAL_DOMAIN, BUSINESS_NAP, HOMEPAGE_SEO } from '../data/seoData';

export default function SEOHead({
  title = HOMEPAGE_SEO.title,
  description = HOMEPAGE_SEO.metaDescription,
  keywords = HOMEPAGE_SEO.keywords.join(', '),
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&auto=format&fit=crop&q=85',
  ogType = 'website',
  schemas = [],
  noindex = false,
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // Helper to safely set or create a <meta> tag
    const setMeta = (attr, key, value) => {
      if (!value) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        el.setAttribute('content', value);
      } else {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', value);
        document.head.appendChild(el);
      }
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'author', BUSINESS_NAP.name);
    setMeta(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 3. Canonical URL
    const targetCanonical = canonicalUrl || `${CANONICAL_DOMAIN}${location.pathname}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', targetCanonical);
    } else {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      canonicalTag.setAttribute('href', targetCanonical);
      document.head.appendChild(canonicalTag);
    }

    // 4. Open Graph Tags
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', BUSINESS_NAP.name);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', targetCanonical);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:locale', 'en_IN');

    // 5. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 6. Inject Clean Dynamic JSON-LD Structured Data
    // Remove previous dynamic JSON-LD scripts
    document.querySelectorAll('script[data-dynamic-seo="true"]').forEach((el) => el.remove());

    if (schemas && schemas.length > 0) {
      schemas.forEach((schemaData) => {
        if (!schemaData) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic-seo', 'true');
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
      });
    }

    // Scroll to top smoothly on route change if not a hash anchor
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, schemas, noindex, location.pathname]);

  return null;
}
