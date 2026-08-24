import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '' });

  const fetchGallery = () => {
    setLoading(true);
    api.get('/gallery/all').then(res => setGallery(res.data.gallery)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('title', form.title);
        fd.append('category', form.category);
        await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setForm({ title: '', category: '' });
      fetchGallery();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/gallery/${item._id}`, { active: !item.active });
      fetchGallery();
    } catch (err) {
      alert('Failed to update');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Inspiration Gallery</h1>
      </div>

      <div className="gallery-upload-form">
        <div className="form-row">
          <input type="text" placeholder="Title (optional)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="filter-input" />
          <input type="text" placeholder="Category (optional)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="filter-input" />
          <label className="btn btn-primary">
            {uploading ? 'Uploading...' : '+ Upload Images'}
            <input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
          </label>
        </div>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="media-grid">
          {gallery.map(item => (
            <div key={item._id} className={`media-item ${!item.active ? 'inactive' : ''}`}>
              <img src={item.image?.startsWith('http') ? item.image : UPLOAD_URL + item.image} alt={item.title} />
              <div className="media-info">
                <span className="media-name">{item.title || 'Untitled'}</span>
                {item.category && <span className="media-section">{item.category}</span>}
              </div>
              <div className="media-actions">
                <button className="btn btn-sm" onClick={() => toggleActive(item)}>{item.active ? 'Disable' : 'Enable'}</button>
                <button className="media-delete" onClick={() => handleDelete(item._id)}>×</button>
              </div>
            </div>
          ))}
          {gallery.length === 0 && <div className="empty-state">No gallery images yet</div>}
        </div>
      )}
    </div>
  );
}
