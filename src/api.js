const API_URL = 'http://localhost:5000/api';
const UPLOAD_URL = 'http://localhost:5000/uploads';

export { API_URL, UPLOAD_URL };

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    const data = await res.json();
    return data.success ? data.settings : null;
  } catch {
    return null;
  }
}

export async function fetchProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${query}`);
    const data = await res.json();
    return data.success ? data : { products: [], total: 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    return data.success ? data.categories : [];
  } catch {
    return [];
  }
}

export async function fetchGallery() {
  try {
    const res = await fetch(`${API_URL}/gallery`);
    const data = await res.json();
    return data.success ? data.gallery : [];
  } catch {
    return [];
  }
}

export async function createOrder(orderData) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, message: 'Network error' };
  }
}
