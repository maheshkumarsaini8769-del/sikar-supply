import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';
import { resizeImages } from '../utils/resize';

export default function HeroSlides() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => { setLoading(true); api.get('/settings').then(r => setSettings(r.data.settings)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files); setUploading(true);
    try {
      const resized = await resizeImages(files, 1920, 1080, 0.85);
      const fd = new FormData();
      resized.forEach(f => fd.append('slides', f));
      await api.put('/settings/hero-slides', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchData();
    } catch { alert('Failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (i) => { if (!confirm('Delete?')) return; try { await api.delete(`/settings/hero-slides/${i}`); fetchData(); } catch { alert('Failed'); } };

  const toggleSlide = async (i) => {
    const slides = [...settings.heroSlides]; slides[i].active = !slides[i].active;
    try { await api.put('/settings', { heroSlides: JSON.stringify(slides) }); fetchData(); } catch { alert('Failed'); }
  };

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/></div>;
  if (!settings) return <div className="adm-empty-state">Failed</div>;

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Hero Slides</h1>
        <label className="adm-btn adm-btn-primary">{uploading ? 'Uploading...' : '+ Add Slide'}<input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} /></label>
      </div>
      <div className="adm-hero-slides-grid">
        {settings.heroSlides?.map((slide, i) => (
          <div key={i} className={`adm-hero-slide-card ${!slide.active ? 'inactive' : ''}`}>
            <img src={(slide.image?.startsWith('http') || slide.image?.startsWith('data:')) ? slide.image : UPLOAD_URL + slide.image} alt="" />
            <div className="adm-hero-slide-info"><span>Slide {i + 1}</span><span className={`adm-slide-status ${slide.active ? 'active' : 'inactive'}`}>{slide.active ? 'Active' : 'Off'}</span></div>
            <div className="adm-hero-slide-actions">
              <button className="adm-btn adm-btn-sm" onClick={() => toggleSlide(i)}>{slide.active ? 'Disable' : 'Enable'}</button>
              <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(i)}>Delete</button>
            </div>
          </div>
        ))}
        {(!settings.heroSlides || settings.heroSlides.length === 0) && <div className="adm-empty-state">No slides</div>}
      </div>
    </div>
  );
}
