import { useState, useEffect } from 'react';
import api from '../api';
import { UPLOAD_URL } from '../config';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('general');

  useEffect(() => { api.get('/settings').then(r => setSettings(r.data.settings)).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess('');
    try {
      const fd = new FormData();
      Object.keys(settings).forEach(key => {
        if (['socialLinks', 'homeSections', 'heroSlides'].includes(key)) fd.append(key, JSON.stringify(settings[key]));
        else if (!['_id', 'createdAt', 'updatedAt', '__v'].includes(key) && settings[key] != null) fd.append(key, settings[key]);
      });
      const res = await api.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(res.data.settings); setSuccess('Saved!'); setTimeout(() => setSuccess(''), 3000);
    } catch { alert('Failed'); } finally { setSaving(false); }
  };

  const uf = (f, v) => setSettings(p => ({ ...p, [f]: v }));
  const us = (f, v) => setSettings(p => ({ ...p, socialLinks: { ...p.socialLinks, [f]: v } }));
  const toggleSection = (i) => { const s = [...settings.homeSections]; s[i].active = !s[i].active; setSettings(p => ({ ...p, homeSections: s })); };

  if (loading) return <div className="adm-loading"><div className="adm-spinner"/></div>;
  if (!settings) return <div className="adm-empty-state">Failed to load</div>;

  const tabs = [
    { id: 'general', label: 'General' }, { id: 'contact', label: 'Contact' }, { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' }, { id: 'sections', label: 'Sections' }, { id: 'seo', label: 'SEO' }, { id: 'whatsapp', label: 'WhatsApp' },
  ];

  return (
    <div>
      <div className="adm-page-header"><h1 className="adm-page-title">Website Settings</h1></div>
      {success && <div className="adm-alert adm-alert-success">{success}</div>}
      <div className="adm-tabs">{tabs.map(t => <button key={t.id} className={`adm-tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      <form onSubmit={handleSave}>
        <div className="adm-settings-content">
          {tab === 'general' && (
            <div className="adm-settings-section">
              <h3>General</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Site Name</label><input type="text" value={settings.siteName || ''} onChange={e => uf('siteName', e.target.value)} /></div>
                <div className="adm-form-group"><label>Tagline</label><input type="text" value={settings.siteTagline || ''} onChange={e => uf('siteTagline', e.target.value)} /></div>
                <div className="adm-form-group"><label>Logo</label><input type="file" accept="image/*" onChange={e => uf('logo', e.target.files[0])} />{settings.logo && <img src={settings.logo.startsWith('http') ? settings.logo : UPLOAD_URL + settings.logo} alt="" className="adm-settings-img" />}</div>
                <div className="adm-form-group"><label>Copyright</label><input type="text" value={settings.copyrightText || ''} onChange={e => uf('copyrightText', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Footer Description</label><textarea rows="2" value={settings.footerDescription || ''} onChange={e => uf('footerDescription', e.target.value)} /></div>
              </div>
            </div>
          )}
          {tab === 'contact' && (
            <div className="adm-settings-section">
              <h3>Contact</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Phone</label><input type="text" value={settings.phone || ''} onChange={e => uf('phone', e.target.value)} /></div>
                <div className="adm-form-group"><label>WhatsApp</label><input type="text" value={settings.whatsapp || ''} onChange={e => uf('whatsapp', e.target.value)} /></div>
                <div className="adm-form-group"><label>Email</label><input type="email" value={settings.email || ''} onChange={e => uf('email', e.target.value)} /></div>
                <div className="adm-form-group"><label>Hours</label><input type="text" value={settings.openingHours || ''} onChange={e => uf('openingHours', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Address</label><textarea rows="2" value={settings.address || ''} onChange={e => uf('address', e.target.value)} /></div>
              </div>
              <h3>Social Links</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Instagram</label><input type="url" value={settings.socialLinks?.instagram || ''} onChange={e => us('instagram', e.target.value)} /></div>
                <div className="adm-form-group"><label>Facebook</label><input type="url" value={settings.socialLinks?.facebook || ''} onChange={e => us('facebook', e.target.value)} /></div>
              </div>
            </div>
          )}
          {tab === 'hero' && (
            <div className="adm-settings-section">
              <h3>Hero Content</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Eyebrow</label><input type="text" value={settings.heroEyebrow || ''} onChange={e => uf('heroEyebrow', e.target.value)} /></div>
                <div className="adm-form-group"><label>Heading</label><input type="text" value={settings.heroHeading || ''} onChange={e => uf('heroHeading', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Description</label><textarea rows="2" value={settings.heroDescription || ''} onChange={e => uf('heroDescription', e.target.value)} /></div>
                <div className="adm-form-group"><label>Button Text</label><input type="text" value={settings.heroBtnText || ''} onChange={e => uf('heroBtnText', e.target.value)} /></div>
                <div className="adm-form-group"><label>Slide Duration (ms)</label><input type="number" value={settings.slideDuration || 3000} onChange={e => uf('slideDuration', Number(e.target.value))} /></div>
              </div>
            </div>
          )}
          {tab === 'about' && (
            <div className="adm-settings-section">
              <h3>About</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Heading</label><input type="text" value={settings.aboutHeading || ''} onChange={e => uf('aboutHeading', e.target.value)} /></div>
                <div className="adm-form-group"><label>Image</label><input type="file" accept="image/*" onChange={e => uf('aboutImage', e.target.files[0])} />{settings.aboutImage && <img src={settings.aboutImage.startsWith('http') ? settings.aboutImage : UPLOAD_URL + settings.aboutImage} alt="" className="adm-settings-img" />}</div>
                <div className="adm-form-group adm-full-width"><label>Description</label><textarea rows="4" value={settings.aboutDescription || ''} onChange={e => uf('aboutDescription', e.target.value)} /></div>
              </div>
              <h3>Stats</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Years</label><input type="text" value={settings.statsYears || ''} onChange={e => uf('statsYears', e.target.value)} /></div>
                <div className="adm-form-group"><label>Projects</label><input type="text" value={settings.statsProjects || ''} onChange={e => uf('statsProjects', e.target.value)} /></div>
                <div className="adm-form-group"><label>Rating</label><input type="text" value={settings.statsRating || ''} onChange={e => uf('statsRating', e.target.value)} /></div>
              </div>
            </div>
          )}
          {tab === 'sections' && (
            <div className="adm-settings-section">
              <h3>Home Page Sections</h3>
              {settings.homeSections?.map((s, i) => <div key={s.id} className="adm-section-toggle"><label className="adm-checkbox-label"><input type="checkbox" checked={s.active} onChange={() => toggleSection(i)} /> {s.label}</label></div>)}
              <h3>Other</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Why Us Heading</label><input type="text" value={settings.whyUsHeading || ''} onChange={e => uf('whyUsHeading', e.target.value)} /></div>
                <div className="adm-form-group"><label>Showroom Heading</label><input type="text" value={settings.showroomHeading || ''} onChange={e => uf('showroomHeading', e.target.value)} /></div>
              </div>
            </div>
          )}
          {tab === 'seo' && (
            <div className="adm-settings-section">
              <h3>SEO</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group adm-full-width"><label>Title</label><input type="text" value={settings.seoTitle || ''} onChange={e => uf('seoTitle', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Description</label><textarea rows="3" value={settings.seoDescription || ''} onChange={e => uf('seoDescription', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Keywords</label><input type="text" value={settings.seoKeywords || ''} onChange={e => uf('seoKeywords', e.target.value)} /></div>
              </div>
            </div>
          )}
          {tab === 'whatsapp' && (
            <div className="adm-settings-section">
              <h3>WhatsApp</h3>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label>Number</label><input type="text" value={settings.whatsapp || ''} onChange={e => uf('whatsapp', e.target.value)} /></div>
                <div className="adm-form-group"><label>Greeting</label><input type="text" value={settings.whatsappGreeting || ''} onChange={e => uf('whatsappGreeting', e.target.value)} /></div>
                <div className="adm-form-group adm-full-width"><label>Product Message Template</label><textarea rows="3" value={settings.whatsappProductMessage || ''} onChange={e => uf('whatsappProductMessage', e.target.value)} /></div>
              </div>
            </div>
          )}
        </div>
        <div className="adm-settings-footer"><button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save All'}</button></div>
      </form>
    </div>
  );
}
