import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

export default function ReviewSection() {
  const { reviews, addReview, deleteReview } = useSite();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addReview({
      ...form,
      date: new Date().toISOString(),
    });
    setForm({ name: '', rating: 5, text: '' });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < count ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <ScrollReveal>
          <p className="section-eyebrow">Testimonials</p>
          <h2 className="section-heading">What Our Clients Say</h2>
        </ScrollReveal>

        <div className="reviews-header">
          {submitted && <div className="review-success">Thank you! Your review has been submitted.</div>}
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <ScrollReveal>
            <form className="review-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= form.rating ? 'filled' : ''}`}
                      onClick={() => setForm({ ...form, rating: star })}
                      style={{ cursor: 'pointer', fontSize: '24px' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          </ScrollReveal>
        )}

        <div className="reviews-grid">
          {reviews.map((review, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="review-card">
                <div className="review-header">
                  <div className="review-avatar">{review.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h4 className="review-name">{review.name}</h4>
                    <div className="review-stars">{renderStars(review.rating)}</div>
                  </div>
                   <button className="review-delete" onClick={() => deleteReview(review._id)} title="Delete review">×</button>
                </div>
                <p className="review-text">{review.text}</p>
                <span className="review-date">
                  {new Date(review.createdAt || review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </ScrollReveal>
          ))}
          {reviews.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
