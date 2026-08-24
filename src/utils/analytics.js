const API_URL = '/api';

export async function trackEvent(type, data = {}) {
  try {
    await fetch(`${API_URL}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    // silent fail
  }
}

export function trackClick(product) {
  trackEvent('click', { product: product.name || product, productId: product._id });
}

export function trackSearch(query) {
  trackEvent('search', { query });
}

export function trackPageview(page) {
  trackEvent('pageview', { page });
}

export function trackOrder(orderData) {
  trackEvent('order', { orderId: orderData._id, total: orderData.total });
}
