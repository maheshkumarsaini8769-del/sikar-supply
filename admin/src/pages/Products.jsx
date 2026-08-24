import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

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
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '', salePrice: '', sku: '', stockStatus: 'in_stock', stockQuantity: '', featured: false, active: true, displayOrder: '' });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

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
    setForm({ name: '', category: categories[0]?._id || '', description: '', price: '', salePrice: '', sku: '', stockStatus: 'in_stock', stockQuantity: '', featured: false, active: true, displayOrder: '' });
    setImages([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category?._id || '', description: p.description || '', price: p.price || '', salePrice: p.salePrice || '', sku: p.sku || '', stockStatus: p.stockStatus, stockQuantity: p.stockQuantity || '', featured: p.featured, active: p.active, displayOrder: p.displayOrder || '' });
    setImages([]);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      images.forEach(f => fd.append('images', f));

      if (editing) {
        await api.put(`/products/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      fetchData();
    } catch (err) {
      alert('Failed to duplicate product');
    }
  };

  const removeImage = async (productId, imageIndex) => {
    if (!confirm('Remove this image?')) return;
    try {
      await api.delete(`/products/${productId}/images/${imageIndex}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove image');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-input" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="filter-select">
          <option value="">All Stock</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={p.images[0].url.startsWith('http') ? p.images[0].url : UPLOAD_URL + p.images[0].url} alt="" className="table-img" />
                    ) : <div className="table-img-placeholder">No img</div>}
                  </td>
                  <td className="td-bold">{p.name}</td>
                  <td>{p.category?.name || 'N/A'}</td>
                  <td>₹{p.price}</td>
                  <td><span className={`stock-badge stock-${p.stockStatus}`}>{p.stockStatus.replace(/_/g, ' ')}</span></td>
                  <td>{p.featured ? '⭐' : '-'}</td>
                  <td>{p.active ? '✅' : '❌'}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm" onClick={() => handleDuplicate(p._id)}>Duplicate</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Deactivate</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="8" className="empty-row">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Sale Price (₹)</label>
                    <input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>SKU</label>
                    <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Stock Status</label>
                    <select value={form.stockStatus} onChange={e => setForm({...form, stockStatus: e.target.value})}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-row">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
                    Featured
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                    Active
                  </label>
                </div>
                <div className="form-group">
                  <label>Images</label>
                  <input type="file" multiple accept="image/*" onChange={e => setImages([...e.target.files])} />
                  {editing?.images?.length > 0 && (
                    <div className="image-preview-grid">
                      {editing.images.map((img, i) => (
                        <div key={i} className="image-preview-item">
                          <img src={img.url.startsWith('http') ? img.url : UPLOAD_URL + img.url} alt="" />
                          <button type="button" className="remove-img" onClick={() => removeImage(editing._id, i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
