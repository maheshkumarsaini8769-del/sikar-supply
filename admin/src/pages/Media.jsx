import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState('general');

  const fetchMedia = () => {
    setLoading(true);
    api.get('/media', { params: { section } }).then(res => setMedia(res.data.media)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, [section]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('section', section);
        await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchMedia();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media?')) return;
    try {
      await api.delete(`/media/${id}`);
      fetchMedia();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const sections = ['general', 'hero', 'about', 'products', 'showroom', 'gallery'];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Media Library</h1>
      </div>

      <div className="filters">
        <select value={section} onChange={e => setSection(e.target.value)} className="filter-select">
          {sections.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <label className="btn btn-primary">
          {uploading ? 'Uploading...' : '+ Upload Images'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="media-grid">
          {media.map(m => (
            <div key={m._id} className="media-item">
              <img src={m.url.startsWith('http') ? m.url : UPLOAD_URL + m.url} alt={m.alt} />
              <div className="media-info">
                <span className="media-name">{m.originalName}</span>
                <span className="media-section">{m.section}</span>
              </div>
              <button className="media-delete" onClick={() => handleDelete(m._id)}>×</button>
            </div>
          ))}
          {media.length === 0 && <div className="empty-state">No media files in this section</div>}
        </div>
      )}
    </div>
  );
}
