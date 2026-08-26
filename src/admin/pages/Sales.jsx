import { useState, useEffect } from 'react';
import api from '../api';
import ProductSearch from '../components/ProductSearch';

const WA_NUMBER = '918239409535';

export default function Sales({ saleTypeFilter }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null);
  const [filter, setFilter] = useState({ saleType: saleTypeFilter || '', source: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);

  const [quickForm, setQuickForm] = useState({
    product: '', customerName: '', customerPhone: '', quantity: '', note: '', saleDate: new Date().toISOString().split('T')[0],
  });

  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }],
    totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { setFilter(f => ({ ...f, saleType: saleTypeFilter || '' })); }, [saleTypeFilter]);

  const fetchSales = () => {
    setLoading(true);
    api.get('/sales', { params: filter }).then(r => setSales(r.data.sales)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/products', { params: { limit: 200, active: 'true' } }).then(r => setProducts(r.data.products)).catch(() => {});
  }, []);

  useEffect(() => { fetchSales(); }, [filter]);

  const getSelectedProduct = () => products.find(p => p._id === quickForm.product);

  // WhatsApp share
  const shareWhatsApp = () => {
    const prod = getSelectedProduct();
    if (!prod) return alert('Pehle product select karo');
    const qty = Number(quickForm.quantity) || 1;
    const price = prod.salePrice || prod.price || 0;
    const total = qty * price;
    const msg = `*🛒 STAR HOME DESIGN — Order Request*\n\n` +
      `📦 *Product:* ${prod.name}\n` +
      `💰 *Price:* ₹${price}/${prod.unit || 'sqft'}\n` +
      `📊 *Quantity:* ${qty} ${prod.unit || 'sqft'}\n` +
      `💵 *Total:* ₹${total}\n` +
      (quickForm.customerName ? `👤 *Customer:* ${quickForm.customerName}\n` : '') +
      (quickForm.customerPhone ? `📞 *Phone:* ${quickForm.customerPhone}\n` : '') +
      `\n_Please confirm this order. Thank you!_`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

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
        items: [{ product: prod._id, productName: prod.name, quantity: qty, sellingPrice: price, costPrice: prod.costPrice || 0, unit: prod.unit || 'sqft', total }],
        totalAmount: total, discount: 0, finalAmount: total,
        paymentMethod: type === 'cash' ? 'cash' : 'online',
        saleType: type,
        source: type === 'cash' ? 'walk_in' : 'whatsapp',
        note: quickForm.note,
        saleDate: quickForm.saleDate || new Date(),
      });
      setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '', saleDate: new Date().toISOString().split('T')[0] });
      setShowForm(null);
      fetchSales();
    } catch { alert('Failed'); }
  };

  // Save as pending WhatsApp order
  const saveAsPending = async () => {
    const prod = getSelectedProduct();
    if (!quickForm.product) return alert('Product select karo');
    if (!quickForm.quantity || Number(quickForm.quantity) <= 0) return alert('Quantity daalo');

    const qty = Number(quickForm.quantity);
    const price = prod?.salePrice || prod?.price || 0;
    const total = qty * price;

    try {
      await api.post('/orders', {
        customerName: quickForm.customerName || 'WhatsApp Customer',
        customerPhone: quickForm.customerPhone || '',
        items: [{ product: prod._id, productName: prod.name, quantity: qty, unit: prod.unit || 'sqft', price }],
        totalAmount: total,
        note: `[WhatsApp] ${quickForm.note || ''}`,
        status: 'pending',
        source: 'whatsapp',
      });
      setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '', saleDate: new Date().toISOString().split('T')[0] });
      setShowForm(null);
      alert('Order saved as pending! Go to Orders to complete it.');
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
    setForm({ ...form, discount: val, finalAmount: total - (Number(val) || 0) });
  };

  const handleDetailedSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', {
        ...form,
        items: form.items.map(it => ({
          product: it.product || undefined, productName: it.productName,
          quantity: Number(it.quantity), sellingPrice: Number(it.sellingPrice),
          costPrice: Number(it.costPrice), unit: it.unit,
          total: Number(it.quantity) * Number(it.sellingPrice),
        })),
        totalAmount: Number(form.totalAmount), discount: Number(form.discount) || 0,
        finalAmount: Number(form.finalAmount) || Number(form.totalAmount),
        saleDate: form.saleDate || new Date(),
      });
      setShowForm(null); fetchSales();
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
  const todayProfit = todaySales.reduce((sum, s) => {
    const item = s.items?.[0] || {};
    const cost = item.costPrice || 0;
    const qty = item.quantity || 1;
    return sum + (s.finalAmount - cost * qty);
  }, 0);

  const quickType = saleTypeFilter === 'online' ? 'online' : 'cash';
  const quickColor = quickType === 'cash' ? '#25d366' : '#6366f1';
  const quickLabel = quickType === 'cash' ? '💵 Cash Sale' : '🌐 Online Sale';
  const waColor = '#25d366';

  const viewCustomerSales = (sale) => {
    const name = sale.customerName;
    const phone = sale.customerPhone;
    const filtered = sales.filter(s => {
      const nameMatch = s.customerName?.toLowerCase().trim() === name?.toLowerCase().trim();
      if (phone) return nameMatch && s.customerPhone === phone;
      return nameMatch;
    });
    const totalSpent = filtered.reduce((sum, s) => sum + (s.finalAmount || 0), 0);
    const totalProfit = filtered.reduce((sum, s) => {
      const item = s.items?.[0] || {};
      const cost = item.costPrice || 0;
      const qty = item.quantity || 1;
      return sum + ((s.finalAmount || 0) - cost * qty);
    }, 0);
    setSelectedCustomer({ name, phone, totalSales: filtered.length, totalSpent, totalProfit });
    setCustomerSales(filtered);
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">{saleTypeFilter === 'online' ? 'Online Sales' : saleTypeFilter === 'cash' ? 'Cash Sales' : 'All Sales'}</h1>
      </div>

      {/* Stats */}
      <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
        <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
          <span className="adm-stat-label">Today Revenue</span>
          <span className="adm-stat-value">₹{todayTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
          <span className="adm-stat-label">Cash Today</span>
          <span className="adm-stat-value">₹{todayCash.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#6366f1' }}>
          <span className="adm-stat-label">Online Today</span>
          <span className="adm-stat-value">₹{todayOnline.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: todayProfit > 0 ? '#51cf66' : '#ff6b6b' }}>
          <span className="adm-stat-label">Today Profit</span>
          <span className="adm-stat-value" style={{ color: todayProfit > 0 ? '#51cf66' : '#ff6b6b' }}>₹{todayProfit.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Quick Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="adm-btn" onClick={() => { setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '', saleDate: new Date().toISOString().split('T')[0] }); setShowForm('quick'); }}
          style={{ padding: '14px 24px', background: quickColor, color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
          + {quickLabel}
        </button>
        {!saleTypeFilter && (
          <>
            <button className="adm-btn" onClick={() => { setQuickForm({ product: '', customerName: '', customerPhone: '', quantity: '', note: '', saleDate: new Date().toISOString().split('T')[0] }); setShowForm('quick-online'); }}
              style={{ padding: '14px 24px', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
              + 🌐 Online Sale
            </button>
            <button className="adm-btn" onClick={() => {
              setForm({ customerName: '', customerPhone: '', items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }], totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0] });
              setShowForm('detailed');
            }}
              style={{ padding: '14px 24px', background: '#b8956a', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
              + 📋 Multi-Item Sale
            </button>
          </>
        )}
      </div>

      {/* Filters */}
      {!saleTypeFilter && (
        <div className="adm-filters">
          <select value={filter.saleType} onChange={e => setFilter({...filter, saleType: e.target.value})} className="adm-filter-select">
            <option value="">All Types</option><option value="online">Online</option><option value="cash">Cash</option><option value="walk_in">Walk-in</option>
          </select>
          <select value={filter.source} onChange={e => setFilter({...filter, source: e.target.value})} className="adm-filter-select">
            <option value="">All Sources</option><option value="website">Website</option><option value="phone">Phone</option><option value="walk_in">Walk-in</option><option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead><tr><th>Date</th><th>Sale #</th><th>Customer</th><th>Product</th><th>Qty</th><th>Cost ₹</th><th>Sell ₹</th><th>Profit ₹</th><th>Type</th><th>Payment</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>
              {sales.map(s => {
                const item = s.items?.[0] || {};
                const cost = item.costPrice || 0;
                const sell = item.sellingPrice || item.price || s.finalAmount || 0;
                const profit = sell - (cost * (item.quantity || 1));
                return (
                <tr key={s._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(s.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {new Date(s.saleDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="adm-td-bold" style={{ fontSize: 12 }}>{s.saleNumber}</td>
                  <td><button onClick={() => viewCustomerSales(s)} style={{ background: 'none', border: 'none', color: '#b8956a', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>{s.customerName || '-'}</button></td>
                  <td style={{ fontWeight: 600 }}>{item.productName || '-'}</td>
                  <td>{item.quantity || '-'}</td>
                  <td style={{ color: '#ff8a80' }}>{cost ? `₹${cost}` : '-'}</td>
                  <td style={{ color: '#b8956a', fontWeight: 700 }}>₹{sell.toLocaleString('en-IN')}</td>
                  <td style={{ color: profit > 0 ? '#51cf66' : profit < 0 ? '#ff6b6b' : '#888', fontWeight: 700 }}>
                    {cost ? `₹${profit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td><span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: s.saleType === 'cash' ? 'rgba(37,211,102,0.15)' : s.saleType === 'online' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                    color: s.saleType === 'cash' ? '#25d366' : s.saleType === 'online' ? '#6366f1' : '#f59e0b',
                  }}>{s.saleType}</span></td>
                  <td>{s.paymentMethod}</td>
                  <td style={{ color: '#888', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note || '-'}</td>
                  <td><button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(s._id)}>Del</button></td>
                </tr>
              )})}
              {sales.length === 0 && <tr><td colSpan="13" className="adm-empty-row">No sales yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ QUICK SALE MODAL ============ */}
      {(showForm === 'quick' || showForm === 'quick-online') && (() => {
        const type = showForm === 'quick' ? 'cash' : 'online';
        const color = type === 'cash' ? '#25d366' : '#6366f1';
        const prod = getSelectedProduct();
        return (
          <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
            <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="adm-modal-header" style={{ background: `linear-gradient(135deg, ${color}22, transparent)` }}>
                <h2 style={{ color }}>{type === 'cash' ? '💵 Cash Sale' : '🌐 Online Sale'}</h2>
                <button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button>
              </div>
              <form onSubmit={e => handleQuickSale(e, type)}>
                <div className="adm-modal-body">
                  {/* Product Search */}
                  <div className="adm-form-group">
                    <label>Product *</label>
                    <ProductSearch products={products} value={quickForm.product} onChange={v => setQuickForm({...quickForm, product: v})} placeholder="Type to search product..." />
                  </div>

                  {/* Product Info Card */}
                  {prod && (
                    <div style={{ background: 'rgba(184,149,106,0.06)', border: '1px solid rgba(184,149,106,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 17, color: '#b8956a' }}>{prod.name}</div>
                      <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13, color: '#aaa', flexWrap: 'wrap' }}>
                        <span>Price: <b style={{ color: '#fff' }}>₹{prod.salePrice || prod.price}/{prod.unit || 'sqft'}</b></span>
                        <span>Stock: <b style={{ color: prod.stockQuantity > 0 ? '#25d366' : '#ff6b6b' }}>{prod.stockQuantity} {prod.unit}</b></span>
                        {prod.sku && <span>SKU: <b style={{ color: '#fff' }}>{prod.sku}</b></span>}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="adm-form-group">
                    <label>Quantity *</label>
                    <input type="number" min="1" placeholder="Kitna?" value={quickForm.quantity} onChange={e => setQuickForm({...quickForm, quantity: e.target.value})} required
                      style={{ fontSize: 22, fontWeight: 700, padding: '12px 16px' }} />
                  </div>

                  {/* Total */}
                  {prod && quickForm.quantity > 0 && (
                    <div style={{ background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>TOTAL</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color }}>
                        ₹{(Number(quickForm.quantity) * (prod.salePrice || prod.price || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {/* Customer */}
                  <div className="adm-form-grid">
                    <div className="adm-form-group"><label>Customer Name</label><input type="text" placeholder="Optional" value={quickForm.customerName} onChange={e => setQuickForm({...quickForm, customerName: e.target.value})} /></div>
                    <div className="adm-form-group"><label>Phone</label><input type="tel" placeholder="Optional" value={quickForm.customerPhone} onChange={e => setQuickForm({...quickForm, customerPhone: e.target.value})} /></div>
                  </div>

                  {/* Date */}
                  <div className="adm-form-group">
                    <label>Date</label>
                    <input type="date" value={quickForm.saleDate} onChange={e => setQuickForm({...quickForm, saleDate: e.target.value})} />
                  </div>

                  <div className="adm-form-group"><label>Note</label><input type="text" placeholder="Optional" value={quickForm.note} onChange={e => setQuickForm({...quickForm, note: e.target.value})} /></div>
                </div>
                <div className="adm-modal-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <button type="button" className="adm-btn" onClick={() => setShowForm(null)}>Cancel</button>
                  <button type="button" className="adm-btn" onClick={shareWhatsApp} style={{ background: '#25d366', color: '#fff', fontWeight: 700 }}>
                    📲 WhatsApp
                  </button>
                  <button type="button" className="adm-btn" onClick={saveAsPending} style={{ background: '#f59e0b', color: '#fff', fontWeight: 700 }}>
                    ⏳ Save Pending
                  </button>
                  <button type="submit" className="adm-btn" style={{ background: color, color: '#fff', fontWeight: 700, padding: '12px 28px' }}>
                    ✅ Complete Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ============ DETAILED SALE MODAL ============ */}
      {showForm === 'detailed' && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(null)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header"><h2>📋 Multi-Item Sale</h2><button className="adm-modal-close" onClick={() => setShowForm(null)}>&times;</button></div>
            <form onSubmit={handleDetailedSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Customer Name</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Customer Phone</label><input type="tel" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Sale Type</label><select value={form.saleType} onChange={e => setForm({...form, saleType: e.target.value})}><option value="cash">Cash</option><option value="online">Online</option></select></div>
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
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                        <div style={{ margin: 0 }}>
                          {i === 0 && <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>Product</label>}
                          <ProductSearch products={products} value={item.product} onChange={v => updateItem(i, 'product', v)} placeholder="Search..." />
                        </div>
                        <div className="adm-form-group" style={{ margin: 0 }}>
                          {i === 0 && <label>Qty</label>}
                          <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                        </div>
                        <div className="adm-form-group" style={{ margin: 0 }}>
                          {i === 0 && <label>Price</label>}
                          <input type="number" placeholder="₹" value={item.sellingPrice} onChange={e => updateItem(i, 'sellingPrice', e.target.value)} />
                        </div>
                        <div className="adm-form-group" style={{ margin: 0 }}>
                          {i === 0 && <label>Total</label>}
                          <div style={{ padding: '8px 0', fontWeight: 600 }}>₹{(Number(item.quantity) * Number(item.sellingPrice) || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeItem(i)} style={{ marginBottom: 2 }}>×</button>
                      </div>
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

      {/* Customer Sales Modal */}
      {selectedCustomer && (
        <div className="adm-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="adm-modal-header">
              <h2>{selectedCustomer.name} — Sales History</h2>
              <button className="adm-modal-close" onClick={() => setSelectedCustomer(null)}>&times;</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Phone: </span><span style={{ color: '#e5e5e5' }}>{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Total Sales: </span><span style={{ color: '#b8956a', fontWeight: 700 }}>{selectedCustomer.totalSales}</span>
                </div>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Total Spent: </span><span style={{ color: '#25d366', fontWeight: 700 }}>₹{selectedCustomer.totalSpent?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Profit: </span><span style={{ color: selectedCustomer.totalProfit > 0 ? '#51cf66' : '#ff6b6b', fontWeight: 700 }}>₹{selectedCustomer.totalProfit?.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {customerSales.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#888' }}>No sales found</div>
              ) : (
                <div style={{ background: '#0d0d0d', borderRadius: 8, border: '1px solid #222', overflow: 'hidden' }}>
                  {customerSales.map((s, i) => {
                    const item = s.items?.[0] || {};
                    const cost = item.costPrice || 0;
                    const qty = item.quantity || 1;
                    const profit = (s.finalAmount || 0) - (cost * qty);
                    return (
                      <div key={s._id} style={{ padding: '10px 14px', borderBottom: i < customerSales.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: s.saleType === 'cash' ? '#25d366' : '#6366f1', textTransform: 'uppercase', background: s.saleType === 'cash' ? 'rgba(37,211,102,0.1)' : 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4 }}>{s.saleType}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5' }}>{s.saleNumber}</span>
                            <span style={{ fontSize: 11, color: '#888' }}>{s.paymentMethod}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.productName || '-'}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#b8956a' }}>₹{s.finalAmount?.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: 10, color: '#888' }}>{new Date(s.saleDate || s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
