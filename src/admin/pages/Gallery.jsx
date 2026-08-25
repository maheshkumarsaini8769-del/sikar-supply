import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '' });

  const fetchData = () => { setLoading(true); api.get('/gallery/all').then(r => setGallery(r.data.gallery)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files); setUploading(true);
    try { for (const f of files) { const fd = new FormData(); fd.append('image', f); fd.append('title', form.title); fd.append('category', form.category); await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); } setForm({ title: '', category: '' }); fetchData(); } catch { alert('Failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/gallery/${id}`); fetchData(); } catch { alert('Failed'); } };

  const toggleActive = async (item) => { try { await api.put(`/gallery/${item._id}`, { active: !item.active }); fetchData(); } catch { alert('Failed'); } };

  return (
    <div>
      <div className="adm-page-header"><h1 className="adm-page-title">Inspiration Gallery</h1></div>
      <div className="adm-gallery-upload-form">
        <div className="adm-form-row">
          <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="adm-filter-input" />
          <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="adm-filter-input" />
          <label className="adm-btn adm-btn-primary">{uploading ? 'Uploading...' : '+ Upload'}<input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} /></label>
        </div>
      </div>
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-media-grid">
          {gallery.map(item => (
            <div key={item._id} className={`adm-media-item ${!item.active ? 'inactive' : ''}`}>
              <img src={(item.image?.startsWith('http') || item.image?.startsWith('data:')) ? item.image : UPLOAD_URL + item.image} alt={item.title} />
              <div className="adm-media-info"><span className="adm-media-name">{item.title || 'Untitled'}</span>{item.category && <span className="adm-media-section">{item.category}</span>}</div>
              <div className="adm-media-actions">
                <button className="adm-btn adm-btn-sm" onClick={() => toggleActive(item)}>{item.active ? 'Disable' : 'Enable'}</button>
                <button className="adm-media-delete" onClick={() => handleDelete(item._id)}>×</button>
              </div>
            </div>
          ))}
          {gallery.length === 0 && <div className="adm-empty-state">No images</div>}
        </div>
      )}
    </div>
  );
}
