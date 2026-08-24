import { useState, useEffect } from 'react';
import api from '../api';

const STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders', { params: { search, status: statusFilter, page } }).then(res => {
      setOrders(res.data.orders);
      setTotalPages(res.data.pages);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [search, statusFilter, page]);

  const updateStatus = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}`, { status }); fetchOrders(); } catch { alert('Failed to update'); }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Delete this order?')) return;
    try { await api.delete(`/orders/${orderId}`); fetchOrders(); } catch { alert('Failed to delete'); }
  };

  return (
    <div>
      <div className="adm-page-header"><h1 className="adm-page-title">Orders</h1></div>
      <div className="adm-filters">
        <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="adm-filter-input" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="adm-filter-select">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {loading ? <div className="adm-loading"><div className="adm-spinner"/></div> : (
        <div className="adm-table-wrapper">
          <table className="adm-data-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="adm-td-bold">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.phone}</td>
                  <td>{order.items.length}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td>
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="adm-status-select">
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="adm-actions-cell">
                      <button className="adm-btn adm-btn-sm" onClick={() => setSelectedOrder(order)}>View</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteOrder(order._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="8" className="adm-empty-row">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="adm-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
      {selectedOrder && (
        <div className="adm-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Order {selectedOrder.orderNumber}</h2>
              <button className="adm-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-detail-grid">
                <div><strong>Customer: </strong>{selectedOrder.customerName}</div>
                <div><strong>Phone: </strong>{selectedOrder.phone}</div>
                <div><strong>Email: </strong>{selectedOrder.email || 'N/A'}</div>
                <div><strong>Payment: </strong>{selectedOrder.paymentMethod}</div>
                <div><strong>Date: </strong>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div><strong>Status: </strong><span className={`adm-status-badge adm-status-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
              </div>
              <h3 style={{color:'#e5e5e5',fontSize:'14px',marginBottom:'12px'}}>Items</h3>
              <table className="adm-data-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i}><td>{item.productName}</td><td>{item.quantity}</td><td>₹{item.price}</td><td>₹{item.total}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="adm-order-total"><strong>Total: ₹{selectedOrder.total.toLocaleString()}</strong></div>
              {selectedOrder.notes && <div className="adm-order-notes"><strong>Notes: </strong>{selectedOrder.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
