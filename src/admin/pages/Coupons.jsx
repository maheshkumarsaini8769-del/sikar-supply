import { useState, useEffect } from 'react';
import api from '../api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxDiscount: '', usageLimit: '', expiryDate: '', active: true,
  });

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons').then(r => setCoupons(r.data.coupons)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiryDate: '', active: true });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || '', description: c.description || '', discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || '', minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '', expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      active: c.active !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      };
      if (editing) {
        await api.put(`/coupons/${editing._id}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); fetchCoupons(); } catch { alert('Failed'); }
  };

  const toggleActive = async (c) => {
    try { await api.put(`/coupons/${c._id}`, { active: !c.active }); fetchCoupons(); } catch { alert('Failed'); }
  };

  const isExpired = (d) => new Date(d) < new Date();
  const isLimitReached = (c) => c.usageLimit > 0 && c.usedCount >= c.usageLimit;

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Coupons</h1>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>+ New Coupon</button>
      </div>

      <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
        <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
          <span className="adm-stat-label">Active</span>
          <span className="adm-stat-value">{coupons.filter(c => c.active && !isExpired(c.expiryDate)).length}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
          <span className="adm-stat-label">Expired</span>
          <span className="adm-stat-value">{coupons.filter(c => isExpired(c.expiryDate)).length}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#6366f1' }}>
          <span className="adm-stat-label">Total Coupons</span>
          <span className="adm-stat-value">{coupons.length}</span>
        </div>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Max Discount</th><th>Used</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700, color: '#b8956a', fontFamily: 'monospace', fontSize: 14 }}>{c.code}</td>
                  <td>{c.discountType === 'percentage' ? '%' : '₹'}</td>
                  <td style={{ fontWeight: 700 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td>{c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : '-'}</td>
                  <td>{c.maxDiscount > 0 ? `₹${c.maxDiscount}` : '-'}</td>
                  <td>{c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ''}</td>
                  <td style={{ color: isExpired(c.expiryDate) ? '#ef4444' : '#888' }}>{new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`adm-stock-badge ${c.active && !isExpired(c.expiryDate) ? 'adm-stock-in_stock' : 'adm-stock-out_of_stock'}`}>
                      {isExpired(c.expiryDate) ? 'Expired' : c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="adm-btn adm-btn-sm" onClick={() => toggleActive(c)} style={{ background: c.active ? '#5c2d2d' : '#2d5016', color: c.active ? '#ef5350' : '#4caf50', border: 'none' }}>{c.active ? 'Off' : 'On'}</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan="9" className="adm-empty-row">No coupons yet. Create your first coupon!</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Coupon Code *</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required placeholder="e.g. SUMMER20" style={{ fontFamily: 'monospace', fontWeight: 700 }} /></div>
                  <div className="adm-form-group"><label>Discount Type *</label><select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div>
                  <div className="adm-form-group"><label>Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}</label><input type="number" min="1" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required /></div>
                  <div className="adm-form-group"><label>Min Order Amount (₹)</label><input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="0 = no minimum" /></div>
                  <div className="adm-form-group"><label>Max Discount (₹)</label><input type="number" min="0" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} placeholder="0 = no limit" /></div>
                  <div className="adm-form-group"><label>Usage Limit</label><input type="number" min="0" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="0 = unlimited" /></div>
                  <div className="adm-form-group"><label>Expiry Date *</label><input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} required /></div>
                  <div className="adm-form-group"><label className="adm-checkbox-label" style={{ marginTop: 24 }}><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} /> Active</label></div>
                </div>
                <div className="adm-form-group" style={{ marginTop: 8 }}>
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Summer sale discount" />
                </div>
                {form.discountType === 'percentage' && form.discountValue > 0 && (
                  <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(184,149,106,0.1)', border: '1px solid rgba(184,149,106,0.3)', fontSize: 13 }}>
                    <strong style={{ color: '#b8956a' }}>Preview:</strong> Customer gets <strong>{form.discountValue}% off</strong>{form.maxDiscount > 0 ? ` (max ₹${form.maxDiscount})` : ''}{form.minOrderAmount > 0 ? ` on orders above ₹${form.minOrderAmount}` : ''}
                  </div>
                )}
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">{editing ? 'Update Coupon' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
