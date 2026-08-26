import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

export default function QuoteForm() {
  const { categories, settings } = useSite();
  const [form, setForm] = useState({ name: '', mobile: '', product: '', message: '' });

  const productOptions = categories.length > 0
    ? categories.map(c => c.name)
    : ['PVC Panels', 'Deep Fluted Panels', 'Rafter Panels', 'UV Sticker Sheets', 'Decorative Tiles', 'Other'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = settings?.whatsapp || '918239409535';
    const text = `Hi, I'm interested in a quote.%0A%0AName: ${form.name}%0AMobile: ${form.mobile}%0AProduct: ${form.product}%0AMessage: ${form.message}`;

    // Save order to panel
    try {
      await fetch('/api/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.mobile,
          items: [{ productName: form.product, quantity: 1, price: 0, total: 0 }],
          total: 0,
          notes: form.message,
          source: 'website',
          whatsappMessage: `Quote Request: ${form.product}`,
        }),
      });
    } catch (e) { console.error('Order save failed:', e); }

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <section className="quote-form-section" id="contact">
      <div className="container">
        <div className="quote-form-grid">
          <ScrollReveal direction="left">
            <div className="quote-form-text">
              <span className="eyebrow">Get in Touch</span>
              <h2 className="section-heading">
                Let's Create Something Remarkable.
              </h2>
              <p>
                Share your project details and our team will help you find the perfect
                premium materials for your space. We respond within 24 hours.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <form className="quote-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product">Product</label>
                <select
                  id="product"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a product</option>
                  {productOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your project..."
                  value={form.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary">Request a Quote</button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
