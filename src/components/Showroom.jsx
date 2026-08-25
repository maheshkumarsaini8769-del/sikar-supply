import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';
import { UPLOAD_URL } from '../api';

export default function Showroom() {
  const { settings } = useSite();

  return (
    <section className="showroom" id="showroom">
      <div className="container">
        <div className="showroom-grid">
          <ScrollReveal direction="left">
            <div className="showroom-image">
              <img
                src={settings?.showroomImage && typeof settings.showroomImage === 'string' ? ((settings.showroomImage.startsWith('http') || settings.showroomImage.startsWith('data:')) ? settings.showroomImage : UPLOAD_URL + settings.showroomImage) : 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=85&auto=format&fit=crop'}
                alt="Star Home Design premium showroom interior"
                loading="lazy"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={200}>
            <div className="showroom-content">
              <span className="eyebrow">{settings?.showroomHeading || 'Visit Our Showroom'}</span>
              <h2 className="section-heading">{settings?.siteName || 'Star Home Design'}</h2>

              <div className="showroom-details">
                <div className="showroom-detail">
                  <div className="showroom-detail-icon">&#9906;</div>
                  <div className="showroom-detail-text">
                    <h4>Address</h4>
                    <p>{settings?.address || 'Jaipur–Jhunjhunu Bypass Road, Sikar, Rajasthan'}</p>
                  </div>
                </div>

                <div className="showroom-detail">
                  <div className="showroom-detail-icon">&#9742;</div>
                  <div className="showroom-detail-text">
                    <h4>Phone</h4>
                    <p>{settings?.phone || '+91 82394 09535'}</p>
                  </div>
                </div>

                <div className="showroom-detail">
                  <div className="showroom-detail-icon">&#9993;</div>
                  <div className="showroom-detail-text">
                    <h4>Email</h4>
                    <p>{settings?.email || 'skysk9535@gmail.com'}</p>
                  </div>
                </div>

                <div className="showroom-detail">
                  <div className="showroom-detail-icon">&#9201;</div>
                  <div className="showroom-detail-text">
                    <h4>Hours</h4>
                    <p>{settings?.openingHours || 'Mon–Sat: 10:00–20:00'}</p>
                  </div>
                </div>
              </div>

              <div className="showroom-buttons">
                <a href={`tel:${settings?.phone || '+918239409535'}`} className="btn-primary">Call Now</a>
                <a href={`https://wa.me/${settings?.whatsapp || '918239409535'}?text=Hi%2C%20I%27m%20interested%20in%20your%20products`} target="_blank" rel="noopener noreferrer" className="btn-outline">WhatsApp</a>
                <a href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Sikar+Rajasthan'} target="_blank" rel="noopener noreferrer" className="btn-outline">Get Directions</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
