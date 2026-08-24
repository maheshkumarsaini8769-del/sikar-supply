import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState('general');

  const fetchData = () => { setLoading(true); api.get('/media', { params: { section } }).then(r => setMedia(r.data.media)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, [section]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files); setUploading(true);
    try { for (const f of files) { const fd = new FormData(); fd.append('file', f); fd.append('section', section); await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); } fetchData(); } catch { alert('Failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/media/${id}`); fetchData(); } catch { alert('Failed'); } };

  return (
    <div>
      <div className="adm-page-header"><h1 className="adm-page-title">Media Library</h1></div>
      <div className="adm-filters">
        <select value={section} onChange={e => setSection(e.target.value)} className="adm-filter-select">
          {['general', 'hero', 'about', 'products', 'showroom', 'gallery'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="adm-btn adm-btn-primary">{uploading ? 'Uploading...' : '+ Upload'}<input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} /></label>
      </div>
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-media-grid">
          {media.map(m => (
            <div key={m._id} className="adm-media-item">
              <img src={m.url.startsWith('http') ? m.url : UPLOAD_URL + m.url} alt={m.alt} />
              <div className="adm-media-info"><span className="adm-media-name">{m.originalName}</span><span className="adm-media-section">{m.section}</span></div>
              <button className="adm-media-delete" onClick={() => handleDelete(m._id)}>×</button>
            </div>
          ))}
          {media.length === 0 && <div className="adm-empty-state">No media</div>}
        </div>
      )}
    </div>
  );
}
