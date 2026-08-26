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
    try { await api.put(`/orders/${orderId}`, { status }); fetchOrders(); } catch { alert('Failed'); }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Delete this order?')) return;
    try { await api.delete(`/orders/${orderId}`); fetchOrders(); } catch { alert('Failed'); }
  };

  // Convert pending order to sale
  const completeToSale = async (order) => {
    if (!confirm(`Convert order ${order.orderNumber} to sale?`)) return;
    try {
      const saleItems = (order.items || []).map(it => ({
        product: it.product || undefined,
        productName: it.productName || it.name || '',
        quantity: Number(it.quantity) || 1,
        sellingPrice: Number(it.price) || 0,
        costPrice: 0,
        unit: it.unit || 'sqft',
        total: Number(it.total) || Number(it.quantity) * Number(it.price) || 0,
      }));

      const totalAmount = saleItems.reduce((s, it) => s + it.total, 0);

      await api.post('/sales', {
        customerName: order.customerName || order.name || '',
        customerPhone: order.phone || order.customerPhone || '',
        items: saleItems,
        totalAmount,
        discount: 0,
        finalAmount: totalAmount,
        paymentMethod: 'cash',
        saleType: 'online',
        source: order.source || 'whatsapp',
        note: `Converted from order ${order.orderNumber}`,
        saleDate: new Date(),
      });

      await api.put(`/orders/${order._id}`, { status: 'completed' });
      alert('Order converted to sale!');
      fetchOrders();
    } catch { alert('Failed to convert'); }
  };

  const openWhatsApp = (order) => {
    const phone = (order.phone || '').replace(/\D/g, '');
    const items = (order.items || []).map(it => `📦 ${it.productName || it.name} x ${it.quantity} = ₹${it.total}`).join('\n');
    const msg = `*Order ${order.orderNumber}*\n\n${items}\n\n*Total: ₹${order.total}*\nStatus: ${order.status}`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
              <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Source</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={order.status === 'pending' ? { background: 'rgba(245,158,11,0.04)' } : {}}>
                  <td className="adm-td-bold">{order.orderNumber}</td>
                  <td>{order.customerName || order.name}</td>
                  <td>{order.phone || order.customerPhone || '-'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td style={{ fontWeight: 700, color: '#b8956a' }}>₹{(order.total || order.totalAmount || 0).toLocaleString()}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                      background: order.source === 'whatsapp' ? 'rgba(37,211,102,0.15)' : 'rgba(99,102,241,0.15)',
                      color: order.source === 'whatsapp' ? '#25d366' : '#6366f1',
                    }}>{order.source || 'website'}</span>
                  </td>
                  <td>
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="adm-status-select">
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td>
                    <div className="adm-actions-cell" style={{ flexWrap: 'wrap', gap: 4 }}>
                      <button className="adm-btn adm-btn-sm" onClick={() => setSelectedOrder(order)}>View</button>
                      {order.status === 'pending' && (
                        <button className="adm-btn adm-btn-sm" onClick={() => completeToSale(order)}
                          style={{ background: '#25d366', color: '#fff', fontWeight: 700 }}>
                          ✅ Complete → Sale
                        </button>
                      )}
                      {(order.phone || order.customerPhone) && (
                        <button className="adm-btn adm-btn-sm" onClick={() => openWhatsApp(order)}
                          style={{ background: '#25d366', color: '#fff' }}>
                          📲 WA
                        </button>
                      )}
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteOrder(order._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="9" className="adm-empty-row">No orders found</td></tr>}
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
                <div><strong>Customer: </strong>{selectedOrder.customerName || selectedOrder.name}</div>
                <div><strong>Phone: </strong>{selectedOrder.phone || selectedOrder.customerPhone}</div>
                <div><strong>Email: </strong>{selectedOrder.email || 'N/A'}</div>
                <div><strong>Payment: </strong>{selectedOrder.paymentMethod}</div>
                <div><strong>Source: </strong>{selectedOrder.source || 'website'}</div>
                <div><strong>Date: </strong>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div><strong>Status: </strong><span className={`adm-status-badge adm-status-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
              </div>
              <h3 style={{ color: '#e5e5e5', fontSize: 14, margin: '12px 0' }}>Items</h3>
              <table className="adm-data-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, i) => (
                    <tr key={i}><td>{item.productName || item.name}</td><td>{item.quantity}</td><td>₹{item.price}</td><td>₹{item.total}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="adm-order-total"><strong>Total: ₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString()}</strong></div>
              {selectedOrder.notes && <div className="adm-order-notes"><strong>Notes: </strong>{selectedOrder.notes}</div>}
              {selectedOrder.status === 'pending' && (
                <div style={{ marginTop: 16 }}>
                  <button className="adm-btn" onClick={() => { completeToSale(selectedOrder); setSelectedOrder(null); }}
                    style={{ background: '#25d366', color: '#fff', fontWeight: 700, padding: '12px 24px', fontSize: 14 }}>
                    ✅ Complete → Convert to Online Sale
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
