import { useState, useEffect } from 'react';
import api from '../api';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    invoiceNumber: '', supplier: '', supplierPhone: '',
    items: [{ product: '', productName: '', quantity: '', costPrice: '', unit: 'sqft' }],
    totalAmount: '', paidAmount: '', paymentMethod: 'cash', paymentStatus: 'paid', note: '', purchaseDate: new Date().toISOString().split('T')[0], addToInventory: true,
  });
  const [filter, setFilter] = useState({ supplier: '', status: '' });

  const fetchPurchases = () => {
    setLoading(true);
    api.get('/purchases', { params: filter })
      .then(r => setPurchases(r.data.purchases))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/products', { params: { limit: 200 } }).then(r => setProducts(r.data.products)).catch(() => {});
    fetchPurchases();
  }, [filter]);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product: '', productName: '', quantity: '', costPrice: '', unit: 'sqft' }] });
  };

  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i][key] = val;
    if (key === 'product' && val) {
      const p = products.find(x => x._id === val);
      if (p) { items[i].productName = p.name; items[i].costPrice = p.costPrice || ''; items[i].unit = p.unit || 'sqft'; }
    }
    const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.costPrice) || 0), 0);
    setForm({ ...form, items, totalAmount: total });
  };

  const removeItem = (i) => {
    const items = form.items.filter((_, idx) => idx !== i);
    const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.costPrice) || 0), 0);
    setForm({ ...form, items, totalAmount: total });
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
          costPrice: Number(it.costPrice),
          unit: it.unit,
          total: Number(it.quantity) * Number(it.costPrice),
        })),
        totalAmount: Number(form.totalAmount),
        paidAmount: Number(form.paidAmount) || Number(form.totalAmount),
        paymentStatus: Number(form.paidAmount) >= Number(form.totalAmount) ? 'paid' : Number(form.paidAmount) > 0 ? 'partial' : 'pending',
      };
      if (editing) {
        await api.put(`/purchases/${editing._id}`, payload);
      } else {
        await api.post('/purchases', payload);
      }
      setShowForm(false);
      fetchPurchases();
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete purchase?')) return;
    try { await api.delete(`/purchases/${id}`); fetchPurchases(); } catch { alert('Failed'); }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      invoiceNumber: p.invoiceNumber || '',
      supplier: p.supplier || '',
      supplierPhone: p.supplierPhone || '',
      items: p.items?.map(it => ({
        product: it.product?._id || it.product || '',
        productName: it.productName || '',
        quantity: it.quantity || '',
        costPrice: it.costPrice || '',
        unit: it.unit || 'sqft',
      })) || [{ product: '', productName: '', quantity: '', costPrice: '', unit: 'sqft' }],
      totalAmount: p.totalAmount || '',
      paidAmount: p.paidAmount || '',
      paymentMethod: p.paymentMethod || 'cash',
      paymentStatus: p.paymentStatus || 'paid',
      note: p.note || '',
      purchaseDate: p.purchaseDate ? new Date(p.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      addToInventory: p.addToInventory !== false,
    });
    setShowForm(true);
  };

  const paidTotal = purchases.filter(p => p.paymentStatus === 'paid').reduce((s, p) => s + p.totalAmount, 0);
  const pendingTotal = purchases.filter(p => p.paymentStatus !== 'paid').reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Purchase History</h1>
        <button className="adm-btn adm-btn-primary" onClick={() => {
          setEditing(null);
          setForm({ invoiceNumber: '', supplier: '', supplierPhone: '', items: [{ product: '', productName: '', quantity: '', costPrice: '', unit: 'sqft' }], totalAmount: '', paidAmount: '', paymentMethod: 'cash', paymentStatus: 'paid', note: '', purchaseDate: new Date().toISOString().split('T')[0], addToInventory: true });
          setShowForm(true);
        }}>+ New Purchase</button>
      </div>

      <div className="adm-stat-cards" style={{ marginBottom: 16 }}>
        <div className="adm-stat-card" style={{ borderTopColor: '#25d366' }}>
          <span className="adm-stat-label">Total Purchases</span>
          <span className="adm-stat-value">{purchases.length}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#b8956a' }}>
          <span className="adm-stat-label">Total Spent</span>
          <span className="adm-stat-value">₹{paidTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-stat-card" style={{ borderTopColor: '#ff6b6b' }}>
          <span className="adm-stat-label">Pending Payment</span>
          <span className="adm-stat-value">₹{pendingTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="adm-filters">
        <input type="text" placeholder="Supplier name..." value={filter.supplier} onChange={e => setFilter({...filter, supplier: e.target.value})} className="adm-filter-input" />
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="adm-filter-select">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Date</th><th>Invoice</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Rate ₹</th><th>Total ₹</th><th>Paid ₹</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p._id}>
                  <td>{new Date(p.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="adm-td-bold">{p.invoiceNumber || '-'}</td>
                  <td>{p.supplier || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{p.items?.[0]?.productName || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#b8956a' }}>{p.items?.[0]?.quantity || 0} {p.items?.[0]?.unit || ''}</td>
                  <td>₹{p.items?.[0]?.costPrice?.toLocaleString('en-IN') || 0}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.totalAmount.toLocaleString('en-IN')}</td>
                  <td>₹{p.paidAmount.toLocaleString('en-IN')}</td>
                  <td><span className={`adm-stock-badge adm-stock-${p.paymentStatus === 'paid' ? 'in_stock' : p.paymentStatus === 'pending' ? 'out_of_stock' : 'low_stock'}`}>{p.paymentStatus}</span></td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm" onClick={() => handleEdit(p)} style={{ marginRight: 4 }}>Edit</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(p._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan="8" className="adm-empty-row">No purchases recorded yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editing ? 'Edit Purchase' : 'New Purchase'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Invoice #</label><input type="text" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Supplier</label><input type="text" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Supplier Phone</label><input type="tel" value={form.supplierPhone} onChange={e => setForm({...form, supplierPhone: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Date</label><input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Payment Method</label><select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option></select></div>
                  <div className="adm-form-group"><label className="adm-checkbox-label" style={{marginTop:24}}><input type="checkbox" checked={form.addToInventory} onChange={e => setForm({...form, addToInventory: e.target.checked})} /> Auto-add to inventory</label></div>
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
                          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Qty</label>}
                        <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Cost/Unit</label>}
                        <input type="number" placeholder="Cost" value={item.costPrice} onChange={e => updateItem(i, 'costPrice', e.target.value)} />
                      </div>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        {i === 0 && <label>Total</label>}
                        <div style={{ padding: '8px 0', fontWeight: 600 }}>₹{(Number(item.quantity) * Number(item.costPrice) || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeItem(i)} style={{ marginBottom: 2 }}>×</button>
                    </div>
                  ))}
                </div>

                <div className="adm-form-grid" style={{ marginTop: 16 }}>
                  <div className="adm-form-group"><label>Total Amount</label><input type="number" value={form.totalAmount} readOnly style={{ fontWeight: 700, color: '#b8956a' }} /></div>
                  <div className="adm-form-group"><label>Paid Amount</label><input type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Note</label><input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">{editing ? 'Update Purchase' : 'Save Purchase'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
