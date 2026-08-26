import { useState, useEffect } from 'react';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/customers', { params: { search } })
      .then(r => setCustomers(r.data.customers))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', city: c.city || '', notes: c.notes || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/customers/${editing._id}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowForm(false);
      fetchCustomers();
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete customer?')) return;
    try { await api.delete(`/customers/${id}`); fetchCustomers(); } catch { alert('Failed'); }
  };

  const viewOrders = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      const [ordersRes, salesRes] = await Promise.all([
        api.get('/orders', { params: { search: customer.phone || customer.name, limit: 50 } }),
        api.get('/sales', { params: { limit: 100 } }),
      ]);
      const allOrders = [
        ...(ordersRes.data.orders || []).map(o => ({
          type: 'order', number: o.orderNumber, date: o.createdAt,
          items: o.items?.map(i => `${i.productName} × ${i.quantity}`).join(', ') || '-',
          total: o.total, status: o.status, source: o.source || 'website',
        })),
        ...(salesRes.data.sales || []).filter(s => s.customerName === customer.name || s.customerPhone === customer.phone).map(s => ({
          type: 'sale', number: s.saleNumber, date: s.saleDate || s.createdAt,
          items: s.items?.map(i => `${i.productName} × ${i.quantity}`).join(', ') || '-',
          total: s.finalAmount, status: s.paymentMethod, source: s.source || s.saleType,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setCustomerOrders(allOrders);
    } catch (e) { console.error(e); }
    setOrdersLoading(false);
  };

  // Group customers by name
  const groupedByName = {};
  customers.forEach(c => {
    const key = c.name?.toLowerCase().trim();
    if (!groupedByName[key]) groupedByName[key] = [];
    groupedByName[key].push(c);
  });

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Customers</h1>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>
      <div className="adm-filters">
        <input type="text" placeholder="Search name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} className="adm-filter-input" />
      </div>
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Orders</th><th>Total Spent</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const nameCount = groupedByName[c.name?.toLowerCase().trim()]?.length || 1;
                return (
                  <tr key={c._id}>
                    <td>
                      <button onClick={() => viewOrders(c)} style={{ background: 'none', border: 'none', color: '#b8956a', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0, textAlign: 'left' }}>
                        {c.name}
                        {nameCount > 1 && <span style={{ fontSize: 10, color: '#f59e0b', marginLeft: 4 }}>({nameCount})</span>}
                      </button>
                    </td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.city || '-'}</td>
                    <td>{c.totalOrders}</td>
                    <td style={{ fontWeight: 600, color: '#b8956a' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="adm-actions-cell">
                        <button className="adm-btn adm-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && <tr><td colSpan="7" className="adm-empty-row">No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <div className="adm-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="adm-modal-header">
              <h2>{selectedCustomer.name} — Orders</h2>
              <button className="adm-modal-close" onClick={() => setSelectedCustomer(null)}>&times;</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Phone: </span><span style={{ color: '#e5e5e5' }}>{selectedCustomer.phone || 'N/A'}</span>
                </div>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Total Orders: </span><span style={{ color: '#b8956a', fontWeight: 700 }}>{selectedCustomer.totalOrders}</span>
                </div>
                <div style={{ padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Total Spent: </span><span style={{ color: '#25d366', fontWeight: 700 }}>₹{selectedCustomer.totalSpent?.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {ordersLoading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
                customerOrders.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: '#888' }}>No orders found</div>
                ) : (
                  <div style={{ background: '#0d0d0d', borderRadius: 8, border: '1px solid #222', overflow: 'hidden' }}>
                    {customerOrders.map((o, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderBottom: i < customerOrders.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: o.type === 'order' ? '#f59e0b' : '#25d366', textTransform: 'uppercase', background: o.type === 'order' ? 'rgba(245,158,11,0.1)' : 'rgba(37,211,102,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                              {o.type}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5' }}>{o.number}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{o.items}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#b8956a' }}>₹{o.total?.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: 10, color: '#888' }}>{new Date(o.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group"><label>Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="adm-form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="adm-form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  <div className="adm-form-group"><label>City</label><input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                </div>
                <div className="adm-form-group"><label>Address</label><textarea rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div className="adm-form-group"><label>Notes</label><textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
