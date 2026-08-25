import { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

const TOP_N = 6;

export default function ReviewSection() {
  const { reviews, addReview, deleteReview } = useSite();
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (showForm) setShowForm(false);
      if (showAll) setShowAll(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showForm, showAll]);

  const toggleForm = () => {
    if (!showForm) window.history.pushState({ reviewForm: true }, '');
    else if (window.history.state?.reviewForm) window.history.back();
    setShowForm(!showForm);
  };

  const toggleAll = () => {
    if (!showAll) window.history.pushState({ allReviews: true }, '');
    else if (window.history.state?.allReviews) window.history.back();
    setShowAll(!showAll);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('rating', form.rating);
    fd.append('text', form.text);
    fd.append('date', new Date().toISOString());
    if (imageFile) fd.append('image', imageFile);
    await addReview(fd);
    setForm({ name: '', rating: 5, text: '' });
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
    if (window.history.state?.reviewForm) window.history.back();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < count ? 'filled' : ''}`}>★</span>
    ));
  };

  const topReviews = reviews.slice(0, TOP_N);
  const hasMore = reviews.length > TOP_N;

  const renderCard = (review, i, isModal = false) => (
    <div className="review-card" key={isModal ? review._id || i : i}>
      <div className="review-header">
        {review.image ? (
          <img src={review.image} alt={review.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div className="review-avatar">{review.name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h4 className="review-name">{review.name}</h4>
          <div className="review-stars">{renderStars(review.rating)}</div>
        </div>
        {!isModal &&                    <button className="review-delete" onClick={() => deleteReview(review._id)} title="Delete review" aria-label={`Delete review by ${review.name}`}>×</button>}
      </div>
      <p className="review-text">{review.text}</p>
      <span className="review-date">
        {new Date(review.createdAt || review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    </div>
  );

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <ScrollReveal>
          <p className="section-eyebrow">Testimonials</p>
          <h2 className="section-heading">What Our Clients Say</h2>
        </ScrollReveal>

        <div className="reviews-header">
          {submitted && <div className="review-success">Thank you! Your review has been submitted.</div>}
          <button className="btn-primary" onClick={toggleForm}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <ScrollReveal>
            <form className="review-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= form.rating ? 'filled' : ''}`} onClick={() => setForm({ ...form, rating: star })} style={{ cursor: 'pointer', fontSize: '24px' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required rows="4" placeholder="Share your experience..." />
              </div>
              <div className="form-group">
                <label>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="" style={{ maxWidth: 100, marginTop: 8, borderRadius: 6 }} />}
              </div>
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          </ScrollReveal>
        )}

        <div className="reviews-grid">
          {topReviews.map((review, i) => (
            <ScrollReveal key={review._id || i} delay={i * 100}>
              {renderCard(review, i)}
            </ScrollReveal>
          ))}
          {reviews.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button className="btn-outline" onClick={toggleAll} style={{ fontSize: 14, padding: '10px 28px' }}>
              View All {reviews.length} Reviews
            </button>
          </div>
        )}
      </div>

      {showAll && (
        <div className="reviews-overlay" onClick={(e) => { if (e.target === e.currentTarget) toggleAll(); }} role="dialog" aria-modal="true" aria-label="All reviews">
          <div className="reviews-modal">
            <div className="reviews-modal-header">
              <h2>All Reviews ({reviews.length})</h2>
              <button className="reviews-modal-close" onClick={toggleAll} aria-label="Close all reviews">×</button>
            </div>
            <div className="reviews-modal-body">
              {reviews.map((review, i) => renderCard(review, i, true))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
