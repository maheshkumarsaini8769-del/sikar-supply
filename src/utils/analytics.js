const API_URL = '/api';

export async function trackEvent(type, data = {}) {
  try {
    fetch(`${API_URL}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silent fail
  }
}

export function trackClick(product) {
  const name = typeof product === 'string' ? product : (product?.name || 'Product');
  const id = product?._id || '';
  const category = product?.category || '';
  trackEvent('click', { product: name, productId: id, category });
}

export function trackWhatsAppClick(location = 'general', details = {}) {
  trackEvent('whatsapp', { location, ...details });
}

export function trackCallClick(location = 'general', details = {}) {
  trackEvent('call', { location, ...details });
}

export function trackSearch(query) {
  if (!query || !query.trim()) return;
  trackEvent('search', { query: query.trim() });
}

export function trackPageview(page) {
  trackEvent('pageview', { page });
}

export function trackOrder(orderData) {
  trackEvent('order', { orderId: orderData._id, total: orderData.total });
}

