import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [activeReviewForReply, setActiveReviewForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

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

  const openReplyModal = (review) => {
    setActiveReviewForReply(review);
    setReplyText(review.reply || '');
  };

  const closeReplyModal = () => {
    setActiveReviewForReply(null);
    setReplyText('');
    setSavingReply(false);
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!activeReviewForReply) return;
    setSavingReply(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/reviews/${activeReviewForReply._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchReviews();
        closeReplyModal();
      } else {
        alert(data.message || 'Error saving reply');
      }
    } catch (err) {
      console.error('Error updating reply:', err);
      alert('Failed to connect to server');
    } finally {
      setSavingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!confirm('Are you sure you want to remove the reply to this review?')) return;
    setSavingReply(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: '' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchReviews();
        closeReplyModal();
      } else {
        alert(data.message || 'Error removing reply');
      }
    } catch (err) {
      console.error('Error removing reply:', err);
      alert('Failed to connect to server');
    } finally {
      setSavingReply(false);
    }
  };

  const applyTemplate = (tmpl) => {
    setReplyText(tmpl);
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < count ? '#b8956a' : '#444' }}>★</span>
    ));
  };

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Reviews &amp; Ratings</h1>
        <span style={{ color: '#888', fontSize: '13px' }}>{reviews.length} reviews</span>
      </div>

      <div className="adm-table-wrapper">
        <table className="adm-data-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review Text</th>
              <th>Owner Reply</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} style={{ opacity: review.active === false ? 0.6 : 1 }}>
                <td>
                  {review.image ? (
                    <img src={review.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b8956a', fontWeight: 700, fontSize: 16 }}>
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="adm-td-bold">{review.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{renderStars(review.rating)}</td>
                <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {review.text}
                </td>
                <td style={{ maxWidth: '240px' }}>
                  {review.reply ? (
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(184, 149, 106, 0.15)',
                          color: '#b8956a',
                          marginBottom: '4px',
                        }}
                      >
                        ✓ Replied
                      </span>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#aaa',
                          fontStyle: 'italic',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={review.reply}
                      >
                        "{review.reply}"
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#666', fontSize: '12px' }}>No reply yet</span>
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="adm-btn adm-btn-sm"
                    style={{ background: review.active ? '#2d5016' : '#5c2d2d', color: review.active ? '#4caf50' : '#ef5350', border: 'none' }}
                    onClick={() => toggleActive(review._id, review.active)}
                  >
                    {review.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{
                        background: review.reply ? '#242424' : '#b8956a',
                        color: review.reply ? '#b8956a' : '#111',
                        border: review.reply ? '1px solid #b8956a' : 'none',
                        fontWeight: 600,
                      }}
                      onClick={() => openReplyModal(review)}
                      title="Reply to review"
                    >
                      {review.reply ? '✏️ Edit Reply' : '💬 Reply'}
                    </button>
                    <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => deleteReview(review._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="8" className="adm-empty-row">No reviews found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {activeReviewForReply && (
        <div className="adm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReplyModal(); }}>
          <div className="adm-modal" style={{ maxWidth: '580px' }}>
            <div className="adm-modal-header">
              <h2>💬 Reply to {activeReviewForReply.name}'s Review</h2>
              <button className="adm-modal-close" onClick={closeReplyModal}>×</button>
            </div>
            <form onSubmit={handleSaveReply}>
              <div className="adm-modal-body">
                {/* Customer Review Summary Box */}
                <div
                  style={{
                    background: '#141414',
                    border: '1px solid #282828',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>{activeReviewForReply.name}</strong>
                    <div>{renderStars(activeReviewForReply.rating)}</div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#ccc', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{activeReviewForReply.text}"
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#777' }}>
                    Posted on {new Date(activeReviewForReply.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Quick Templates */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
                    Quick Templates:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      style={{ fontSize: '11px', background: '#252525', border: '1px solid #333' }}
                      onClick={() => applyTemplate('Thank you so much for your kind words! We are glad you loved the interior materials from Star Home Interior.')}
                    >
                      "Thank you so much..."
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      style={{ fontSize: '11px', background: '#252525', border: '1px solid #333' }}
                      onClick={() => applyTemplate('Thank you for choosing Star Home Interior. We truly appreciate your support and valuable feedback!')}
                    >
                      "Appreciate your support..."
                    </button>
                  </div>
                </div>

                {/* Reply Input */}
                <div className="adm-form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#e5e5e5', fontWeight: 600 }}>
                    Owner Response (Will be displayed publicly on the website)
                  </label>
                  <textarea
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response here..."
                    required
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '10px 12px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                {activeReviewForReply.reply && (
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm adm-btn-danger"
                    style={{ marginRight: 'auto' }}
                    onClick={() => handleDeleteReply(activeReviewForReply._id)}
                    disabled={savingReply}
                  >
                    Delete Reply
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn-sm adm-btn-secondary" onClick={closeReplyModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-sm adm-btn-primary"
                  disabled={savingReply}
                >
                  {savingReply ? 'Saving...' : activeReviewForReply.reply ? 'Update Reply' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
