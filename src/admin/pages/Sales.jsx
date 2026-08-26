import { useState, useEffect } from 'react';
import api from '../api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }],
    totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0],
  });
  const [filter, setFilter] = useState({ saleType: '', source: '' });

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
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
      };
      await api.post('/sales', payload);
      setShowForm(false);
      fetchSales();
      fetchStats();
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete sale?')) return;
    try { await api.delete(`/sales/${id}`); fetchSales(); fetchStats(); } catch { alert('Failed'); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Sale History</h1>
        <button className="adm-btn adm-btn-primary" onClick={() => {
          setForm({ customerName: '', customerPhone: '', items: [{ product: '', productName: '', quantity: '', sellingPrice: '', costPrice: '', unit: 'sqft' }], totalAmount: '', discount: '', finalAmount: '', paymentMethod: 'cash', saleType: 'cash', source: 'walk_in', note: '', saleDate: new Date().toISOString().split('T')[0] });
          setShowForm(true);
        }}>+ New Sale</button>
      </div>

      {stats && (
        <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
          <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
            <span className="adm-stat-label">Total Sales</span>
            <span className="adm-stat-value">{stats.totalSales || 0}</span>
          </div>
          <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
            <span className="adm-stat-label">Revenue</span>
            <span className="adm-stat-value">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="adm-stat-card" style={{ borderTopColor: '#6366f1' }}>
            <span className="adm-stat-label">Avg Sale</span>
            <span className="adm-stat-value">₹{(stats.avgSale || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="adm-stat-card" style={{ borderTopColor: '#f59e0b' }}>
            <span className="adm-stat-label">Discounts Given</span>
            <span className="adm-stat-value">₹{(stats.totalDiscount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

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

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Date</th><th>Sale #</th><th>Customer</th><th>Type</th><th>Source</th><th>Items</th><th>Total</th><th>Discount</th><th>Final</th><th>Payment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s._id}>
                  <td>{new Date(s.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="adm-td-bold">{s.saleNumber}</td>
                  <td>{s.customerName || '-'}</td>
                  <td><span className={`adm-stock-badge adm-stock-${s.saleType === 'online' ? 'in_stock' : 'low_stock'}`}>{s.saleType}</span></td>
                  <td>{s.source}</td>
                  <td>{s.items?.length || 0}</td>
                  <td>₹{s.totalAmount.toLocaleString('en-IN')}</td>
                  <td style={{ color: s.discount > 0 ? '#ff6b6b' : '#888' }}>{s.discount > 0 ? `-₹${s.discount}` : '-'}</td>
                  <td style={{ fontWeight: 700, color: '#25d366' }}>₹{s.finalAmount.toLocaleString('en-IN')}</td>
                  <td>{s.paymentMethod}</td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(s._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan="11" className="adm-empty-row">No sales recorded yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>New Sale</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
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
                <button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
