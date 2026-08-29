import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';
import { resizeImages } from '../utils/resize';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState('all');
  const [copied, setCopied] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = section === 'all' ? {} : { section };
    api.get('/media', { params }).then(r => setMedia(r.data.media)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [section]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const resized = await resizeImages(files);
      for (const f of resized) {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('section', section === 'all' ? 'general' : section);
        await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchData();
    } catch { alert('Upload failed'); } finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try { await api.delete(`/media/${id}`); fetchData(); } catch { alert('Delete failed'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const getImageSrc = (m) => {
    if (!m.url) return '';
    if (m.url.startsWith('http') || m.url.startsWith('data:')) return m.url;
    return UPLOAD_URL + m.url;
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Media Library</h1>
        <span style={{color:'#888',fontSize:'13px'}}>{media.length} images</span>
      </div>

      <div className="adm-filters" style={{display:'flex',gap:12,alignItems:'center',marginBottom:20,flexWrap:'wrap'}}>
        <select value={section} onChange={e => setSection(e.target.value)} className="adm-filter-select">
          <option value="all">All Sections</option>
          {['general', 'hero', 'about', 'products', 'showroom', 'gallery'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <label className="adm-btn adm-btn-primary" style={{cursor:'pointer'}}>
          {uploading ? 'Uploading...' : '+ Upload Images'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-media-grid">
          {media.map(m => (
            <div key={m._id} className="adm-media-item" style={{position:'relative'}}>
              <img src={getImageSrc(m)} alt={m.alt || m.originalName} />
              <div className="adm-media-info">
                <span className="adm-media-name">{m.originalName}</span>
                <span className="adm-media-section">{m.section}</span>
              </div>
              <div className="adm-media-actions">
                <button className="adm-btn adm-btn-sm" title="Copy URL" onClick={() => copyUrl(getImageSrc(m))} style={{fontSize:12,padding:'4px 8px'}}>
                  {copied === getImageSrc(m) ? 'Copied!' : 'Copy'}
                </button>
                <button className="adm-media-delete" onClick={() => handleDelete(m._id)} title="Delete">×</button>
              </div>
            </div>
          ))}
          {media.length === 0 && <div className="adm-empty-state" style={{gridColumn:'1/-1',padding:40}}>No images in this section</div>}
        </div>
      )}
    </div>
  );
}
