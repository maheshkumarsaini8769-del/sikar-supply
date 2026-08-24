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
    try {
      await api.put(`/orders/${orderId}`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-input" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="td-bold">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.phone}</td>
                  <td>{order.items.length}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td>
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className={`status-select status-${order.status}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setSelectedOrder(order)}>View</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(order._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="8" className="empty-row">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.orderNumber}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                <div><strong>Email:</strong> {selectedOrder.email || 'N/A'}</div>
                <div><strong>Payment:</strong> {selectedOrder.paymentMethod}</div>
                <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
              </div>
              <h3>Items</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="order-total">
                <strong>Total: ₹{selectedOrder.total.toLocaleString()}</strong>
              </div>
              {selectedOrder.notes && <div className="order-notes"><strong>Notes:</strong> {selectedOrder.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
