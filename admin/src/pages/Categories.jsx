import { useState, useEffect } from 'react';
import api from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', displayOrder: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories').then(res => setCategories(res.data.categories)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', displayOrder: '', active: true }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', displayOrder: c.displayOrder || '', active: c.active }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id}>
                  <td className="td-bold">{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.displayOrder}</td>
                  <td>{c.active ? '✅' : '❌'}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan="5" className="empty-row">No categories found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} />
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
