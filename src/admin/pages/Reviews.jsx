import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/reviews/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setReviews(data.reviews);
  };

  useEffect(() => { fetchReviews(); }, []);

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchReviews();
  };

  const toggleActive = async (id, active) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ active: !active }),
    });
    fetchReviews();
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < count ? '#b8956a' : '#333' }}>★</span>
    ));
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Reviews</h1>
        <span style={{color:'#888',fontSize:'13px'}}>{reviews.length} reviews</span>
      </div>

      <div className="adm-table-wrapper">
        <table className="adm-data-table">
          <thead>
            <tr><th>Name</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} style={{opacity: review.active === false ? 0.5 : 1}}>
                <td className="adm-td-bold">{review.name}</td>
                <td>{renderStars(review.rating)}</td>
                <td style={{maxWidth:'300px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{review.text}</td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{background: review.active ? '#2d5016' : '#5c2d2d', color: review.active ? '#4caf50' : '#ef5350', border:'none'}}
                    onClick={() => toggleActive(review._id, review.active)}
                  >
                    {review.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteReview(review._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan="6" className="adm-empty-row">No reviews yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
