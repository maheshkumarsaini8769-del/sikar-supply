import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';
import { resizeImages } from '../utils/resize';

const STATUSES = ['in_stock', 'low_stock', 'out_of_stock'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price Low-High' },
  { value: 'price_desc', label: 'Price High-Low' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sort, setSort] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', shortDescription: '', price: '', salePrice: '', costPrice: '', sku: '', unit: 'sqft', stockStatus: 'in_stock', stockQuantity: '', lowStockThreshold: '10', featured: false, active: true, displayOrder: '', specs: [] });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/products', { params: { search, category: catFilter, stock: stockFilter, sort } }),
      api.get('/categories'),
    ]).then(([prods, cats]) => {
      setProducts(prods.data.products);
      setCategories(cats.data.categories);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, catFilter, stockFilter, sort]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', category: categories[0]?._id || '', description: '', shortDescription: '', price: '', salePrice: '', costPrice: '', sku: '', unit: 'sqft', stockStatus: 'in_stock', stockQuantity: '', lowStockThreshold: '10', featured: false, active: true, displayOrder: '', specs: [] });
    setImages([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category?._id || '', description: p.description || '', shortDescription: p.shortDescription || '', price: p.price || '', salePrice: p.salePrice || '', costPrice: p.costPrice || '', sku: p.sku || '', unit: p.unit || 'sqft', stockStatus: p.stockStatus, stockQuantity: p.stockQuantity || '', lowStockThreshold: p.lowStockThreshold || '10', featured: p.featured, active: p.active, displayOrder: p.displayOrder || '', specs: p.specs || [] });
    setImages([]);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'specs') fd.append(k, JSON.stringify(form[k]));
        else fd.append(k, form[k]);
      });
      images.forEach(f => fd.append('images', f));
      if (editing) {
        await api.put(`/products/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setFeedback({ type: 'success', message: `✅ Product "${form.name}" safalta-purvak update ho gaya!` });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setFeedback({ type: 'success', message: `✅ Naya product "${form.name}" safalta-purvak add ho gaya!` });
      }
      setShowForm(false);
      fetchData();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget._id;
    const targetName = deleteTarget.name;
    // Optimistically remove from view immediately so user sees instant result
    setProducts(prev => prev.filter(p => p._id !== targetId));
    setDeleteTarget(null);
    setDeleting(true);
    try {
      await api.delete(`/products/${targetId}`);
      setFeedback({ type: 'success', message: `✅ Product "${targetName}" safalta-purvak delete ho gaya!` });
      fetchData();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      if (err.response?.status === 404) {
        setFeedback({ type: 'success', message: `✅ Product "${targetName}" pehle se hi delete ho chuka tha!` });
        fetchData();
      } else {
        setFeedback({ type: 'error', message: `❌ Delete nahi ho saka: ${err.response?.data?.message || err.message}` });
        fetchData();
      }
    } finally {
      setDeleting(false);
    }
  };

  const removeImage = async (productId, imageIndex) => {
    try {
      await api.delete(`/products/${productId}/images/${imageIndex}`);
      fetchData();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Products</h1>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      <div className="adm-filters">
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="adm-filter-input" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="adm-filter-select">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="adm-filter-select">
          <option value="">All Stock</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="adm-filter-select">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {feedback.message && (
        <div
          className={`adm-alert ${feedback.type === 'error' ? 'adm-alert-error' : 'adm-alert-success'}`}
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 211, 102, 0.15)',
            border: `1px solid ${feedback.type === 'error' ? '#ef4444' : '#25d366'}`,
            color: feedback.type === 'error' ? '#ef4444' : '#25d366',
          }}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}
          >
            &times;
          </button>
        </div>
      )}

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="adm-table-wrapper adm-products-desktop-table">
            <table className="adm-data-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Category</th><th>Purchase ₹</th><th>Sell ₹</th><th>Profit ₹</th><th>Margin</th><th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.images?.[0] ? <img src={(p.images[0].url.startsWith('http') || p.images[0].url.startsWith('data:')) ? p.images[0].url : UPLOAD_URL + p.images[0].url} alt="" className="adm-table-img" /> : <div className="adm-table-img-placeholder">No</div>}</td>
                    <td className="adm-td-bold">{p.name}</td>
                    <td>{p.category?.name || 'N/A'}</td>
                    <td style={{color:'#ff8a80'}}>{p.costPrice ? `₹${p.costPrice}` : '-'}</td>
                    <td style={{color:'#b8956a', fontWeight:700}}>{p.price ? `₹${p.price}` : '-'}</td>
                    <td style={{color: (p.price && p.costPrice && p.price > p.costPrice) ? '#51cf66' : '#ff6b6b', fontWeight:700}}>
                      {p.price && p.costPrice ? `₹${p.price - p.costPrice}` : '-'}
                    </td>
                    <td style={{color: (p.price && p.costPrice && p.price > p.costPrice) ? '#51cf66' : '#ff6b6b', fontWeight:700}}>
                      {p.price && p.costPrice && p.costPrice > 0 ? `${Math.round(((p.price - p.costPrice) / p.costPrice) * 100)}%` : '-'}
                    </td>
                    <td style={{fontWeight:600, color: p.stockQuantity <= (p.lowStockThreshold || 10) ? '#ff6b6b' : '#51cf66'}}>{p.stockQuantity} {p.unit || 'sqft'}</td>
                    <td><span className={`adm-stock-badge adm-stock-${p.stockStatus}`}>{p.stockStatus.replace(/_/g, ' ')}</span></td>
                    <td>{p.featured ? '⭐' : '-'}</td>
                    <td>
                      <div className="adm-actions-cell">
                        <button className="adm-btn adm-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDeleteClick(p)} style={{ fontSize: 11, background: '#ef4444', color: '#fff' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan="11" className="adm-empty-row">No products found</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="adm-products-mobile-cards">
            {products.map(p => (
              <div key={p._id} className="adm-mobile-card">
                <div className="adm-mobile-card-header">
                  {p.images?.[0] ? (
                    <img
                      src={(p.images[0].url.startsWith('http') || p.images[0].url.startsWith('data:')) ? p.images[0].url : UPLOAD_URL + p.images[0].url}
                      alt=""
                      className="adm-mobile-card-img"
                    />
                  ) : (
                    <div className="adm-table-img-placeholder adm-mobile-card-img">No Img</div>
                  )}
                  <div className="adm-mobile-card-info">
                    <div className="adm-mobile-card-title">{p.name}</div>
                    <div className="adm-mobile-card-cat">{p.category?.name || 'Uncategorized'}</div>
                  </div>
                  {p.featured && <span style={{ fontSize: 18 }} title="Featured">⭐</span>}
                </div>

                <div className="adm-mobile-card-stats">
                  <div className="adm-mobile-stat-box">
                    <span>Sell Price</span>
                    <strong style={{ color: '#b8956a' }}>₹{p.price || 0}</strong>
                  </div>
                  <div className="adm-mobile-stat-box">
                    <span>Purchase</span>
                    <strong style={{ color: '#ff8a80' }}>₹{p.costPrice || 0}</strong>
                  </div>
                  <div className="adm-mobile-stat-box">
                    <span>Stock</span>
                    <strong style={{ color: p.stockQuantity <= (p.lowStockThreshold || 10) ? '#ff6b6b' : '#51cf66' }}>
                      {p.stockQuantity || 0} {p.unit || 'sqft'}
                    </strong>
                  </div>
                </div>

                <div className="adm-mobile-card-actions">
                  <button
                    type="button"
                    className="adm-btn"
                    onClick={() => openEdit(p)}
                    style={{ background: '#262626', border: '1px solid #3a3a3a', color: '#fff' }}
                  >
                    ✏️ Edit Product
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger"
                    onClick={() => handleDeleteClick(p)}
                    style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 12px', color: '#888' }}>
                No products found
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit / Add Product Modal */}
      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="adm-form-group"><label>Category *</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required><option value="">Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                  <div className="adm-form-group"><label>Purchase Price (₹) *</label><input type="number" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} required placeholder="Kitne me kharida" /></div>
                  <div className="adm-form-group"><label>Selling Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="Kitne me bechoge" /></div>
                  <div className="adm-form-group"><label>Offer Price (₹)</label><input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} placeholder="Discount price (optional)" /></div>
                  {form.costPrice > 0 && form.price > 0 && (
                    <div className="adm-form-group" style={{ gridColumn: '1 / -1' }}>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: form.price > form.costPrice ? 'rgba(81,207,102,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${form.price > form.costPrice ? 'rgba(81,207,102,0.3)' : 'rgba(255,107,107,0.3)'}`, fontSize: 13 }}>
                        <strong style={{ color: form.price > form.costPrice ? '#51cf66' : '#ff6b6b' }}>
                          Profit: ₹{form.price - form.costPrice} per unit ({Math.round(((form.price - form.costPrice) / form.costPrice) * 100)}% margin)
                        </strong>
                      </div>
                    </div>
                  )}
                  <div className="adm-form-group"><label>SKU</label><input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Unit</label><select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}><option value="sqft">Sq Ft</option><option value="box">Box</option><option value="piece">Piece</option><option value="meter">Meter</option><option value="kg">Kg</option></select></div>
                  <div className="adm-form-group"><label>Low Stock Alert</label><input type="number" value={form.lowStockThreshold} onChange={e => setForm({...form, lowStockThreshold: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Description</label><textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="adm-form-group"><label>Short Description</label><input type="text" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} placeholder="Brief one-liner for product cards" /></div>
                <div className="adm-form-group adm-full-width">
                  <label>Specifications (Key-Value)</label>
                  {form.specs.map((spec, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input type="text" placeholder="Label (e.g. Material)" value={spec.label} onChange={e => { const s = [...form.specs]; s[i] = { ...s[i], label: e.target.value }; setForm({...form, specs: s}); }} style={{ flex: 1, padding: '6px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 12 }} />
                      <input type="text" placeholder="Value (e.g. Marble)" value={spec.value} onChange={e => { const s = [...form.specs]; s[i] = { ...s[i], value: e.target.value }; setForm({...form, specs: s}); }} style={{ flex: 1, padding: '6px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 12 }} />
                      <button type="button" onClick={() => setForm({...form, specs: form.specs.filter((_, j) => j !== i)})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm({...form, specs: [...form.specs, { label: '', value: '' }]})} className="adm-btn adm-btn-sm" style={{ marginTop: 4 }}>+ Add Spec</button>
                </div>
                <div className="adm-form-row">
                  <label className="adm-checkbox-label"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Featured</label>
                  <label className="adm-checkbox-label"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} /> Active</label>
                </div>
                <div className="adm-form-group">
                  <label>Images</label>
                  <input type="file" multiple accept="image/*" onChange={async e => { const resized = await resizeImages(e.target.files); setImages(resized); }} />
                  {editing?.images?.length > 0 && (
                    <div className="adm-image-preview-grid">
                      {editing.images.map((img, i) => (
                        <div key={i} className="adm-image-preview-item">
                           <img src={(img.url.startsWith('http') || img.url.startsWith('data:')) ? img.url : UPLOAD_URL + img.url} alt="" />
                          <button type="button" className="adm-remove-img" onClick={() => removeImage(editing._id, i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                {editing ? (
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger"
                    onClick={() => {
                      const target = editing;
                      setShowForm(false);
                      handleDeleteClick(target);
                    }}
                    style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    🗑️ Delete Product
                  </button>
                ) : <div />}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="adm-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)} style={{ zIndex: 11000 }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '92%', borderRadius: 12, overflow: 'hidden', background: '#171717', border: '1px solid #2d2d2d' }}>
            <div style={{ padding: '26px 22px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>
                🗑️
              </div>
              <h3 style={{ fontSize: 18, color: '#f3f4f6', marginBottom: 8, fontWeight: 700 }}>Delete Product?</h3>
              <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>
                Kya aap sach me <strong style={{ color: '#fff' }}>"{deleteTarget.name}"</strong> ko permanently delete karna chahte hain? Yeh product website aur database se turant hata diya jayega.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="adm-btn"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, padding: '10px 16px', background: '#262626', color: '#e5e5e5', border: '1px solid #3a3a3a' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger"
                  disabled={deleting}
                  onClick={confirmDeleteProduct}
                  style={{ flex: 1, padding: '10px 16px', background: '#dc2626', color: '#fff', fontWeight: 700, border: 'none' }}
                >
                  {deleting ? 'Deleting...' : 'Haan, Delete Karein'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
