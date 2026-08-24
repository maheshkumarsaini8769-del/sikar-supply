import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function HeroSlides() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    api.get('/settings').then(res => setSettings(res.data.settings)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('slides', f));
      await api.put('/settings/hero-slides', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchSettings();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      await api.delete(`/settings/hero-slides/${index}`);
      fetchSettings();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const toggleSlide = async (index) => {
    const slides = [...settings.heroSlides];
    slides[index].active = !slides[index].active;
    try {
      await api.put('/settings', { heroSlides: JSON.stringify(slides) });
      fetchSettings();
    } catch (err) {
      alert('Failed to update');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!settings) return <div className="empty-state">Failed to load</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Hero Slides</h1>
        <label className="btn btn-primary">
          {uploading ? 'Uploading...' : '+ Add Slide'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>

      <div className="hero-slides-grid">
        {settings.heroSlides?.map((slide, i) => (
          <div key={i} className={`hero-slide-card ${!slide.active ? 'inactive' : ''}`}>
            <img src={slide.image?.startsWith('http') ? slide.image : UPLOAD_URL + slide.image} alt={`Slide ${i + 1}`} />
            <div className="hero-slide-info">
              <span>Slide {i + 1}</span>
              <span className={`slide-status ${slide.active ? 'active' : 'inactive'}`}>{slide.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="hero-slide-actions">
              <button className="btn btn-sm" onClick={() => toggleSlide(i)}>{slide.active ? 'Disable' : 'Enable'}</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i)}>Delete</button>
            </div>
          </div>
        ))}
        {(!settings.heroSlides || settings.heroSlides.length === 0) && <div className="empty-state">No hero slides. Upload images to get started.</div>}
      </div>
    </div>
  );
}
