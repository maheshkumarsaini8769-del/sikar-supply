import { useState, useEffect } from 'react';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });

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
              {customers.map(c => (
                <tr key={c._id}>
                  <td className="adm-td-bold">{c.name}</td>
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
              ))}
              {customers.length === 0 && <tr><td colSpan="7" className="adm-empty-row">No customers yet</td></tr>}
            </tbody>
          </table>
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
