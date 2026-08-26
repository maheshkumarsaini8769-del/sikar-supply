import { useState, useEffect } from 'react';
import api from '../api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null); // 'quick-cash', 'quick-online', 'detailed'
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ saleType: '', source: '' });

  // Quick sale form
  const [quickForm, setQuickForm] = useState({ customerName: '', customerPhone: '', amount: '', note: '' });

  // Detailed form
  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }],
    totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0],
  });

  const fetchSales = () => {
    setLoading(true);
    api.get('/sales', { params: filter })
      .then(r => setSales(r.data.sales))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    api.get('/sales/stats').then(r => setStats(r.data.stats)).catch(() => {});
  };

  useEffect(() => {
    api.get('/products', { params: { limit: 200 } }).then(r => setProducts(r.data.products)).catch(() => {});
    fetchSales();
    fetchStats();
  }, [filter]);

  // Quick Cash Sale
  const handleQuickCash = async (e) => {
    e.preventDefault();
    if (!quickForm.amount || Number(quickForm.amount) <= 0) return alert('Amount daalo');
    try {
      await api.post('/sales', {
        customerName: quickForm.customerName || 'Cash Customer',
        customerPhone: quickForm.customerPhone,
        items: [{ productName: 'Cash Sale', quantity: 1, sellingPrice: Number(quickForm.amount), costPrice: 0, unit: '', total: Number(quickForm.amount) }],
        totalAmount: Number(quickForm.amount),
        discount: 0,
        finalAmount: Number(quickForm.amount),
        paymentMethod: 'cash',
        saleType: 'cash',
        source: 'walk_in',
        note: quickForm.note,
        saleDate: new Date(),
      });
      setQuickForm({ customerName: '', customerPhone: '', amount: '', note: '' });
      setShowForm(null);
      fetchSales();
      fetchStats();
    } catch { alert('Failed'); }
  };

  // Quick Online Sale
  const handleQuickOnline = async (e) => {
    e.preventDefault();
    if (!quickForm.amount || Number(quickForm.amount) <= 0) return alert('Amount daalo');
    try {
      await api.post('/sales', {
        customerName: quickForm.customerName || 'Online Customer',
        customerPhone: quickForm.customerPhone,
        items: [{ productName: 'Online Sale', quantity: 1, sellingPrice: Number(quickForm.amount), costPrice: 0, unit: '', total: Number(quickForm.amount) }],
        totalAmount: Number(quickForm.amount),
        discount: 0,
        finalAmount: Number(quickForm.amount),
        paymentMethod: 'online',
        saleType: 'online',
        source: 'website',
        note: quickForm.note,
        saleDate: new Date(),
      });
      setQuickForm({ customerName: '', customerPhone: '', amount: '', note: '' });
      setShowForm(null);
      fetchSales();
      fetchStats();
    } catch { alert('Failed'); }
  };

  // Detailed sale
  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }] });
  };

  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i][key] = val;
    if (key === 'product' && val) {
      const p = products.find(x => x._id === val);
      if (p) { items[i].productName = p.name; items[i].sellingPrice = p.salePrice || p.price || ''; items[i].costPrice = p.costPrice || ''; items[i].unit = p.unit || 'sqft'; }
    }
    const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.sellingPrice) || 0), 0);
    const disc = Number(form.discount) || 0;
    setForm({ ...form, items, totalAmount: total, finalAmount: total - disc });
  };

  const removeItem = (i) => {
    const items = form.items.filter((_, idx) => idx !== i);
    const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.sellingPrice) || 0), 0);
    const disc = Number(form.discount) || 0;
    setForm({ ...form, items, totalAmount: total, finalAmount: total - disc });
  };

  const handleDiscount = (val) => {
    const total = Number(form.totalAmount) || 0;
    const disc = Number(val) || 0;
    setForm({ ...form, discount: val, finalAmount: total - disc });
  };

  const handleDetailedSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', {
        ...form,
        items: form.items.map(it => ({
          product: it.product || undefined,
          productName: it.productName,
          quantity: Number(it.quantity),
          sellingPrice: Number(it.sellingPrice),
          costPrice: Number(it.costPrice),
          unit: it.unit,
          total: Number(it.quantity) * Number(it.sellingPrice),
        })),
        totalAmount: Number(form.totalAmount),
        discount: Number(form.discount) || 0,
        finalAmount: Number(form.finalAmount) || Number(form.totalAmount),
        saleDate: form.saleDate || new Date(),
      });
      setShowForm(null);
      fetchSales();
      fetchStats();
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete sale?')) return;
    try { await api.delete(`/sales/${id}`); fetchSales(); fetchStats(); } catch { alert('Failed'); }
  };

  const todaySales = sales.filter(s => {
    const d = new Date(s.saleDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const todayCash = todaySales.filter(s => s.saleType === 'cash').reduce((sum, s) => sum + s.finalAmount, 0);
  const todayOnline = todaySales.filter(s => s.saleType === 'online').reduce((sum, s) => sum + s.finalAmount, 0);
  const todayTotal = todayCash + todayOnline;

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Sales</h1>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="adm-btn" onClick={() => { setQuickForm({ customerName: '', customerPhone: '', amount: '', note: '' }); setShowForm('quick-cash'); }} style={{ flex: '1 1 200px', padding: '16px 20px', background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'center' }}>
          💵 Cash Sale
        </button>
        <button className="adm-btn" onClick={() => { setQuickForm({ customerName: '', customerPhone: '', amount: '', note: '' }); setShowForm('quick-online'); }} style={{ flex: '1 1 200px', padding: '16px 20px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'center' }}>
          🌐 Online Sale
        </button>
        <button className="adm-btn" onClick={() => {
          setForm({ customerName: '', customerPhone: '', items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }], totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0] });
          setShowForm('detailed');
        }} style={{ flex: '1 1 200px', padding: '16px 20px', background: 'linear-gradient(135deg, #b8956a, #9a7b5a)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'center' }}>
          📋 Detailed Sale (With Items)
        </button>
      </div>

      {/* Today's Summary */}
      <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
        <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
          <span className="adm-stat-label">Today's Total</span>
          <span className="adm-stat-value">₹{todayTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
          <span className="adm-stat-label">Today Cash</span>
          <span className="adm-stat-value">₹{todayCash.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#6366f1' }}>
          <span className="adm-stat-label">Today Online</span>
          <span className="adm-stat-value">₹{todayOnline.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#f59e0b' }}>
          <span className="adm-stat-label">Today Sales</span>
          <span className="adm-stat-value">{todaySales.length}</span>
        </div>
      </div>

      {/* All-time Stats */}
      {stats && (
        <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
          <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
            <span className="adm-stat-label">Total Sales</span>
            <span className="adm-stat-value">{stats.totalSales || 0}</span>
          </div>
          <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
            <span className="adm-stat-label">Total Revenue</span>
            <span className="adm-stat-value">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="adm-stat-card" style={{ borderTopColor: '#6366f1' }}>
            <span className="adm-stat-label">Avg Sale</span>
            <span className="adm-stat-value">₹{(stats.avgSale || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="adm-filters">
        <select value={filter.saleType} onChange={e => setFilter({...filter, saleType: e.target.value})} className="adm-filter-select">
          <option value="">All Types</option>
          <option value="online">Online</option>
          <option value="cash">Cash</option>
          <option value="walk_in">Walk-in</option>
        </select>
        <select value={filter.source} onChange={e => setFilter({...filter, source: e.target.value})} className="adm-filter-select">
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="phone">Phone</option>
          <option value="walk_in">Walk-in</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      {/* Sales Table */}
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Date</th><th>Sale #</th><th>Customer</th><th>Type</th><th>Final</th><th>Payment</th><th>Note</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s._id}>
                  <td>{new Date(s.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="adm-td-bold">{s.saleNumber}</td>
                  <td>{s.customerName || '-'}</td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      background: s.saleType === 'cash' ? 'rgba(37,211,102,0.15)' : s.saleType === 'online' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s.saleType === 'cash' ? '#25d366' : s.saleType === 'online' ? '#6366f1' : '#f59e0b',
                    }}>{s.saleType}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#25d366', fontSize: 15 }}>₹{s.finalAmount.toLocaleString('en-IN')}</td>
                  <td>{s.paymentMethod}</td>
                  <td style={{ color: '#888', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note || '-'}</td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(s._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan="8" className="adm-empty-row">No sales yet. Click buttons above to add.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Cash Modal */}
      {showForm === 'quick-cash' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.1), transparent)' }}>
              <h2 style={{ color: '#25d366' }}>💵 Cash Sale</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
            </div>
            <form onSubmit={handleQuickCash}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" min="1" placeholder="Kitne ka sale?" value={quickForm.amount} onChange={e => setQuickForm({...quickForm, amount: e.target.value})} required autoFocus style={{ fontSize: 22, fontWeight: 700, padding: '12px 16px' }} />
                </div>
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" placeholder="Naam (optional)" value={quickForm.customerName} onChange={e => setQuickForm({...quickForm, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Phone</label><input type="tel" placeholder="Phone (optional)" value={quickForm.customerPhone} onChange={e => setQuickForm({...quickForm, customerPhone: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" placeholder="Koi note?" value={quickForm.note} onChange={e => setQuickForm({...quickForm, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ background: '#25d366', color: '#fff', fontWeight: 700, padding: '12px 32px', fontSize: 15 }}>Save Cash Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Online Modal */}
      {showForm === 'quick-online' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' }}>
              <h2 style={{ color: '#6366f1' }}>🌐 Online Sale</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
            </div>
            <form onSubmit={handleQuickOnline}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" min="1" placeholder="Kitne ka sale?" value={quickForm.amount} onChange={e => setQuickForm({...quickForm, amount: e.target.value})} required autoFocus style={{ fontSize: 22, fontWeight: 700, padding: '12px 16px' }} />
                </div>
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" placeholder="Naam (optional)" value={quickForm.customerName} onChange={e => setQuickForm({...quickForm, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Phone</label><input type="tel" placeholder="Phone (optional)" value={quickForm.customerPhone} onChange={e => setQuickForm({...quickForm, customerPhone: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" placeholder="Koi note?" value={quickForm.note} onChange={e => setQuickForm({...quickForm, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ background: '#6366f1', color: '#fff', fontWeight: 700, padding: '12px 32px', fontSize: 15 }}>Save Online Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Sale Modal */}
      {showForm === 'detailed' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, rgba(184,149,106,0.1), transparent)' }}>
              <h2 style={{ color: '#b8956a' }}>📋 Detailed Sale</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
            </div>
            <form onSubmit={handleDetailedSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Customer Phone</label><input type="tel" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Sale Type</label><select value={form.saleType} onChange={e => setForm({...form, saleType: e.target.value})}><option value="cash">Cash</option><option value="online">Online</option><option value="walk_in">Walk-in</option></select></div>
                  <div className="adm-form-group"><label>Source</label><select value={form.source} onChange={e => setForm({...form, source: e.target.value})}><option value="walk_in">Walk-in</option><option value="website">Website</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option></select></div>
                  <div className="adm-form-group"><label>Payment</label><select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="online">Online</option><option value="credit">Credit</option></select></div>
                  <div className="adm-form-group"><label>Date</label><input type="date" value={form.saleDate} onChange={e => setForm({...form, saleDate: e.target.value})} /></div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontWeight: 600, fontSize: 14, color: '#b8956a' }}>Items</label>
                    <button type="button" className="adm-btn adm-btn-sm" onClick={addItem}>+ Add Item</button>
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Product</label>}
                        <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)}>
                          <option value="">Custom</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                        </select>
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Qty</label>}
                        <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Price/Unit</label>}
                        <input type="number" placeholder="Price" value={item.sellingPrice} onChange={e => updateItem(i, 'sellingPrice', e.target.value)} />
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Total</label>}
                        <div style={{ padding: '8px 0', fontWeight: 600 }}>₹{(Number(item.quantity) * Number(item.sellingPrice) || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeItem(i)} style={{ marginBottom: 2 }}>×</button>
                    </div>
                  ))}
                </div>

                <div className="adm-form-grid" style={{ marginTop: 16 }}>
                  <div className="adm-form-group"><label>Total</label><input type="number" value={form.totalAmount} readOnly style={{ fontWeight: 700 }} /></div>
                  <div className="adm-form-group"><label>Discount</label><input type="number" value={form.discount} onChange={e => handleDiscount(e.target.value)} /></div>
                  <div className="adm-form-group"><label>Final Amount</label><input type="number" value={form.finalAmount} readOnly style={{ fontWeight: 700, color: '#25d366' }} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ background: '#b8956a', color: '#fff', fontWeight: 700, padding: '12px 32px', fontSize: 15 }}>Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
