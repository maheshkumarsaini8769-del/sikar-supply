import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';
import { resizeImage } from '../utils/resize';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', displayOrder: '', active: true, image: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => { setLoading(true); api.get('/categories').then(r => setCategories(r.data.categories)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', displayOrder: '', active: true, image: '' }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', displayOrder: c.displayOrder || '', active: c.active, image: c.image || '' }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { editing ? await api.put(`/categories/${editing._id}`, form) : await api.post('/categories', form); setShowForm(false); fetchData(); } catch { alert('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/categories/${id}`); fetchData(); } catch { alert('Failed'); } };

  return (
    <div>
      <div className="adm-page-header"><h1 className="adm-page-title">Categories</h1><button className="adm-btn adm-btn-primary" onClick={openAdd}>+ Add</button></div>
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id}>
                  <td className="adm-td-bold">{c.name}</td><td>{c.slug}</td><td>{c.displayOrder}</td><td>{c.active ? '✅' : '❌'}</td>
                  <td><div className="adm-actions-cell"><button className="adm-btn adm-btn-sm" onClick={() => openEdit(c)}>Edit</button><button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c._id)}>Del</button></div></td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan="5" className="adm-empty-row">No categories</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header"><h2>{editing ? 'Edit' : 'Add'} Category</h2><button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-group"><label>Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="adm-form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="adm-form-group"><label>Image</label><input type="file" accept="image/*" onChange={async e => { if (e.target.files[0]) { const resized = await resizeImage(e.target.files[0], 400, 300); const base64 = await fileToBase64(resized); setForm({...form, image: base64}); } }} />{form.image && typeof form.image === 'string' && <img src={form.image.startsWith('data:') ? form.image : (form.image.startsWith('http') ? form.image : UPLOAD_URL + form.image)} alt="" className="adm-settings-img" />}</div>
                <div className="adm-form-group"><label>Order</label><input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} /></div>
                <label className="adm-checkbox-label"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} /> Active</label>
              </div>
              <div className="adm-modal-footer"><button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
