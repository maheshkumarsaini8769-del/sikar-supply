import { useState, useEffect } from 'react';
import api from '../api';

export default function Sales({ saleTypeFilter }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null);
  const [filter, setFilter] = useState({ saleType: saleTypeFilter || '', source: '' });

  const [quickForm, setQuickForm] = useState({
    product: '', customerName: '', customerPhone: '', quantity: '', note: '',
  });

  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }],
    totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setFilter(f => ({ ...f, saleType: saleTypeFilter || '' }));
  }, [saleTypeFilter]);

  const fetchSales = () => {
    setLoading(true);
    api.get('/sales', { params: filter })
      .then(r => setSales(r.data.sales))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {};

  useEffect(() => {
    api.get('/products', { params: { limit: 200, active: 'true' } }).then(r => setProducts(r.data.products)).catch(() => {});
  }, []);

  useEffect(() => { fetchSales(); }, [filter]);

  const getSelectedProduct = () => products.find(p => p._id === quickForm.product);

  const handleQuickSale = async (e, type) => {
    e.preventDefault();
    const prod = getSelectedProduct();
    if (!quickForm.product) return alert('Product select karo');
    if (!quickForm.quantity || Number(quickForm.quantity) <= 0) return alert('Quantity daalo');

    const qty = Number(quickForm.quantity);
    const price = prod?.salePrice || prod?.price || 0;
    const total = qty * price;

    try {
      await api.post('/sales', {
        customerName: quickForm.customerName || (type === 'cash' ? 'Cash Customer' : 'Online Customer'),
        customerPhone: quickForm.customerPhone,
        items: [{
          product: prod._id,
          productName: prod.name,
          quantity: qty,
          sellingPrice: price,
          costPrice: prod.costPrice || 0,
          unit: prod.unit || 'sqft',
          total,
        }],
        totalAmount: total,
        discount: 0,
        finalAmount: total,
        paymentMethod: type === 'cash' ? 'cash' : 'online',
        saleType: type,
        source: type === 'cash' ? 'walk_in' : 'website',
        note: quickForm.note,
        saleDate: new Date(),
      });
      setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '' });
      setShowForm(null);
      fetchSales();
    } catch { alert('Failed'); }
  };

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
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete sale?')) return;
    try { await api.delete(`/sales/${id}`); fetchSales(); } catch { alert('Failed'); }
  };

  const todaySales = sales.filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString());
  const todayTotal = todaySales.reduce((sum, s) => sum + s.finalAmount, 0);
  const todayCash = todaySales.filter(s => s.saleType === 'cash').reduce((sum, s) => sum + s.finalAmount, 0);
  const todayOnline = todaySales.filter(s => s.saleType === 'online').reduce((sum, s) => sum + s.finalAmount, 0);
  const allTimeTotal = sales.reduce((sum, s) => sum + s.finalAmount, 0);

  const quickType = saleTypeFilter === 'online' ? 'online' : 'cash';
  const quickColor = quickType === 'cash' ? '#25d366' : '#6366f1';
  const quickLabel = quickType === 'cash' ? '💵 Cash Sale' : '🌐 Online Sale';

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">{saleTypeFilter === 'online' ? 'Online Sales' : saleTypeFilter === 'cash' ? 'Cash Sales' : 'All Sales'}</h1>
      </div>

      {/* Stats */}
      <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
        <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
          <span className="adm-stat-label">Today</span>
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
          <span className="adm-stat-label">All Time</span>
          <span className="adm-stat-value">₹{allTimeTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Quick Add */}
      <div style={{ marginBottom: 16 }}>
        <button className="adm-btn" onClick={() => { setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '' }); setShowForm('quick'); }}
          style={{ padding: '14px 28px', background: quickColor, color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
          + {quickLabel}
        </button>
        {!saleTypeFilter && (
          <>
            <button className="adm-btn" onClick={() => { setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '' }); setShowForm('quick-online'); }}
              style={{ marginLeft: 8, padding: '14px 28px', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
              + 🌐 Online Sale
            </button>
            <button className="adm-btn" onClick={() => {
              setForm({ customerName: '', customerPhone: '', items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }], totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0] });
              setShowForm('detailed');
            }}
              style={{ marginLeft: 8, padding: '14px 28px', background: '#b8956a', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
              + 📋 Multi-Item Sale
            </button>
          </>
        )}
      </div>

      {/* Filters */}
      {!saleTypeFilter && (
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
      )}

      {/* Table */}
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Date</th><th>Sale #</th><th>Customer</th><th>Product</th><th>Qty</th><th>Type</th><th>Amount</th><th>Payment</th><th>Note</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {new Date(s.saleDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="adm-td-bold" style={{ fontSize: 12 }}>{s.saleNumber}</td>
                  <td>{s.customerName || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{s.items?.[0]?.productName || '-'}</td>
                  <td>{s.items?.[0]?.quantity || '-'}</td>
                  <td>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      background: s.saleType === 'cash' ? 'rgba(37,211,102,0.15)' : s.saleType === 'online' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s.saleType === 'cash' ? '#25d366' : s.saleType === 'online' ? '#6366f1' : '#f59e0b',
                    }}>{s.saleType}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#25d366', fontSize: 15 }}>₹{s.finalAmount.toLocaleString('en-IN')}</td>
                  <td>{s.paymentMethod}</td>
                  <td style={{ color: '#888', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note || '-'}</td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(s._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan="10" className="adm-empty-row">No sales yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Sale Modal — Cash */}
      {showForm === 'quick' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="adm-modal-header" style={{ background: `linear-gradient(135deg, ${quickColor}22, transparent)` }}>
              <h2 style={{ color: quickColor }}>{quickLabel}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
            </div>
            <form onSubmit={e => handleQuickSale(e, quickType)}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label>Product *</label>
                  <select value={quickForm.product} onChange={e => setQuickForm({...quickForm, product: e.target.value})} required style={{ fontSize: 15, padding: '10px 14px' }}>
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ₹{p.salePrice || p.price || 'N/A'} | Stock: {p.stockQuantity} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedProduct() && (
                  <div style={{ background: 'rgba(184,149,106,0.08)', border: '1px solid rgba(184,149,106,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#b8956a' }}>{getSelectedProduct().name}</div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 6, fontSize: 13, color: '#aaa' }}>
                      <span>Price: <b style={{ color: '#fff' }}>₹{getSelectedProduct().salePrice || getSelectedProduct().price}</b></span>
                      <span>Stock: <b style={{ color: getSelectedProduct().stockQuantity > 0 ? '#25d366' : '#ff6b6b' }}>{getSelectedProduct().stockQuantity} {getSelectedProduct().unit}</b></span>
                      <span>SKU: <b style={{ color: '#fff' }}>{getSelectedProduct().sku || '-'}</b></span>
                    </div>
                  </div>
                )}

                <div className="adm-form-group">
                  <label>Quantity *</label>
                  <input type="number" min="1" placeholder="Kitna?" value={quickForm.quantity} onChange={e => setQuickForm({...quickForm, quantity: e.target.value})} required
                    style={{ fontSize: 22, fontWeight: 700, padding: '12px 16px' }} />
                </div>

                {getSelectedProduct() && quickForm.quantity > 0 && (
                  <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>TOTAL</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#25d366' }}>
                      ₹{(Number(quickForm.quantity) * (getSelectedProduct().salePrice || getSelectedProduct().price || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" placeholder="Optional" value={quickForm.customerName} onChange={e => setQuickForm({...quickForm, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Phone</label><input type="tel" placeholder="Optional" value={quickForm.customerPhone} onChange={e => setQuickForm({...quickForm, customerPhone: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" placeholder="Optional" value={quickForm.note} onChange={e => setQuickForm({...quickForm, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ background: quickColor, color: '#fff', fontWeight: 700, padding: '12px 32px', fontSize: 15 }}>
                  Save {quickType === 'cash' ? 'Cash' : 'Online'} Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Sale Modal — Online (when no filter) */}
      {showForm === 'quick-online' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' }}>
              <h2 style={{ color: '#6366f1' }}>🌐 Online Sale</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
            </div>
            <form onSubmit={e => handleQuickSale(e, 'online')}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label>Product *</label>
                  <select value={quickForm.product} onChange={e => setQuickForm({...quickForm, product: e.target.value})} required style={{ fontSize: 15, padding: '10px 14px' }}>
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ₹{p.salePrice || p.price || 'N/A'} | Stock: {p.stockQuantity} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedProduct() && (
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>{getSelectedProduct().name}</div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 6, fontSize: 13, color: '#aaa' }}>
                      <span>Price: <b style={{ color: '#fff' }}>₹{getSelectedProduct().salePrice || getSelectedProduct().price}</b></span>
                      <span>Stock: <b style={{ color: getSelectedProduct().stockQuantity > 0 ? '#25d366' : '#ff6b6b' }}>{getSelectedProduct().stockQuantity} {getSelectedProduct().unit}</b></span>
                    </div>
                  </div>
                )}

                <div className="adm-form-group">
                  <label>Quantity *</label>
                  <input type="number" min="1" placeholder="Kitna?" value={quickForm.quantity} onChange={e => setQuickForm({...quickForm, quantity: e.target.value})} required
                    style={{ fontSize: 22, fontWeight: 700, padding: '12px 16px' }} />
                </div>

                {getSelectedProduct() && quickForm.quantity > 0 && (
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>TOTAL</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1' }}>
                      ₹{(Number(quickForm.quantity) * (getSelectedProduct().salePrice || getSelectedProduct().price || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}

                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" placeholder="Optional" value={quickForm.customerName} onChange={e => setQuickForm({...quickForm, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Phone</label><input type="tel" placeholder="Optional" value={quickForm.customerPhone} onChange={e => setQuickForm({...quickForm, customerPhone: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" placeholder="Optional" value={quickForm.note} onChange={e => setQuickForm({...quickForm, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ background: '#6366f1', color: '#fff', fontWeight: 700, padding: '12px 32px', fontSize: 15 }}>Save Online Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Multi-Item Sale */}
      {showForm === 'detailed' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>📋 Multi-Item Sale</h2>
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
                          {products.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.salePrice || p.price} | Stock: {p.stockQuantity})</option>)}
                        </select>
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Qty</label>}
                        <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Price</label>}
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
                <button type="submit" className="adm-btn" style={{ background: '#b8956a', color: '#fff', fontWeight: 700 }}>Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
