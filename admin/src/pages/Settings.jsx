import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('general');

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data.settings)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const fd = new FormData();
      Object.keys(settings).forEach(key => {
        if (key === 'socialLinks' || key === 'homeSections' || key === 'heroSlides') {
          fd.append(key, JSON.stringify(settings[key]));
        } else if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          if (settings[key] !== null && settings[key] !== undefined) {
            fd.append(key, settings[key]);
          }
        }
      });
      const res = await api.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(res.data.settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field, value) => {
    setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: value } }));
  };

  const toggleSection = (index) => {
    const sections = [...settings.homeSections];
    sections[index].active = !sections[index].active;
    setSettings(prev => ({ ...prev, homeSections: sections }));
  };

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!settings) return <div className="empty-state">Failed to load settings</div>;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'sections', label: 'Sections' },
    { id: 'seo', label: 'SEO' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Website Settings</h1>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-content">
          {tab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Site Name</label>
                  <input type="text" value={settings.siteName || ''} onChange={e => updateField('siteName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Tagline</label>
                  <input type="text" value={settings.siteTagline || ''} onChange={e => updateField('siteTagline', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Logo</label>
                  <input type="file" accept="image/*" onChange={e => updateField('logo', e.target.files[0])} />
                  {settings.logo && <img src={settings.logo.startsWith('http') ? settings.logo : UPLOAD_URL + settings.logo} alt="Logo" className="settings-img" />}
                </div>
                <div className="form-group">
                  <label>Copyright Text</label>
                  <input type="text" value={settings.copyrightText || ''} onChange={e => updateField('copyrightText', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Footer Description</label>
                  <textarea rows="2" value={settings.footerDescription || ''} onChange={e => updateField('footerDescription', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="settings-section">
              <h3>Contact Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={settings.phone || ''} onChange={e => updateField('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input type="text" value={settings.whatsapp || ''} onChange={e => updateField('whatsapp', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={settings.email || ''} onChange={e => updateField('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Opening Hours</label>
                  <input type="text" value={settings.openingHours || ''} onChange={e => updateField('openingHours', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea rows="2" value={settings.address || ''} onChange={e => updateField('address', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Google Maps URL</label>
                  <input type="url" value={settings.googleMapsUrl || ''} onChange={e => updateField('googleMapsUrl', e.target.value)} />
                </div>
              </div>
              <h3>Social Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Instagram</label>
                  <input type="url" value={settings.socialLinks?.instagram || ''} onChange={e => updateSocial('instagram', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Facebook</label>
                  <input type="url" value={settings.socialLinks?.facebook || ''} onChange={e => updateSocial('facebook', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>YouTube</label>
                  <input type="url" value={settings.socialLinks?.youtube || ''} onChange={e => updateSocial('youtube', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'hero' && (
            <div className="settings-section">
              <h3>Hero Content</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Eyebrow Text</label>
                  <input type="text" value={settings.heroEyebrow || ''} onChange={e => updateField('heroEyebrow', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Heading</label>
                  <input type="text" value={settings.heroHeading || ''} onChange={e => updateField('heroHeading', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows="2" value={settings.heroDescription || ''} onChange={e => updateField('heroDescription', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input type="text" value={settings.heroBtnText || ''} onChange={e => updateField('heroBtnText', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Slide Duration (ms)</label>
                  <input type="number" value={settings.slideDuration || 3000} onChange={e => updateField('slideDuration', Number(e.target.value))} />
                </div>
              </div>
              <h3>Hero Slides</h3>
              <p className="text-muted">Manage hero slides from the <a href="/hero-slides">Hero Slides</a> page.</p>
            </div>
          )}

          {tab === 'about' && (
            <div className="settings-section">
              <h3>About Section</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Heading</label>
                  <input type="text" value={settings.aboutHeading || ''} onChange={e => updateField('aboutHeading', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>About Image</label>
                  <input type="file" accept="image/*" onChange={e => updateField('aboutImage', e.target.files[0])} />
                  {settings.aboutImage && <img src={settings.aboutImage.startsWith('http') ? settings.aboutImage : UPLOAD_URL + settings.aboutImage} alt="" className="settings-img" />}
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows="4" value={settings.aboutDescription || ''} onChange={e => updateField('aboutDescription', e.target.value)} />
                </div>
              </div>
              <h3>Stats</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input type="text" value={settings.statsYears || ''} onChange={e => updateField('statsYears', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Projects Completed</label>
                  <input type="text" value={settings.statsProjects || ''} onChange={e => updateField('statsProjects', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <input type="text" value={settings.statsRating || ''} onChange={e => updateField('statsRating', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="settings-section">
              <h3>Home Page Sections</h3>
              <p className="text-muted">Toggle sections on/off for the home page.</p>
              {settings.homeSections?.map((section, i) => (
                <div key={section.id} className="section-toggle">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={section.active} onChange={() => toggleSection(i)} />
                    {section.label}
                  </label>
                </div>
              ))}
              <h3>Other Sections</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Why Us Heading</label>
                  <input type="text" value={settings.whyUsHeading || ''} onChange={e => updateField('whyUsHeading', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Showroom Heading</label>
                  <input type="text" value={settings.showroomHeading || ''} onChange={e => updateField('showroomHeading', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Showroom Image</label>
                  <input type="file" accept="image/*" onChange={e => updateField('showroomImage', e.target.files[0])} />
                  {settings.showroomImage && <img src={settings.showroomImage.startsWith('http') ? settings.showroomImage : UPLOAD_URL + settings.showroomImage} alt="" className="settings-img" />}
                </div>
                <div className="form-group">
                  <label>Texture Image</label>
                  <input type="file" accept="image/*" onChange={e => updateField('textureImage', e.target.files[0])} />
                  {settings.textureImage && <img src={settings.textureImage.startsWith('http') ? settings.textureImage : UPLOAD_URL + settings.textureImage} alt="" className="settings-img" />}
                </div>
              </div>
            </div>
          )}

          {tab === 'seo' && (
            <div className="settings-section">
              <h3>SEO Settings</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Meta Title</label>
                  <input type="text" value={settings.seoTitle || ''} onChange={e => updateField('seoTitle', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Meta Description</label>
                  <textarea rows="3" value={settings.seoDescription || ''} onChange={e => updateField('seoDescription', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Keywords</label>
                  <input type="text" value={settings.seoKeywords || ''} onChange={e => updateField('seoKeywords', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'whatsapp' && (
            <div className="settings-section">
              <h3>WhatsApp Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input type="text" value={settings.whatsapp || ''} onChange={e => updateField('whatsapp', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Default Greeting</label>
                  <input type="text" value={settings.whatsappGreeting || ''} onChange={e => updateField('whatsappGreeting', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Product Inquiry Message Template</label>
                  <textarea rows="3" value={settings.whatsappProductMessage || ''} onChange={e => updateField('whatsappProductMessage', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save All Settings'}</button>
        </div>
      </form>
    </div>
  );
}
