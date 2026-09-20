export default function TrustBadges() {
  const badges = [
    {
      icon: '🛡️',
      title: '10+ Year Durability',
      desc: 'High-grade virgin polymers engineered for lifetime quality',
    },
    {
      icon: '💧',
      title: '100% Waterproof',
      desc: 'Permanent protection against wall seelan, dampness & moisture',
    },
    {
      icon: '🐜',
      title: 'Anti-Termite Proof',
      desc: 'Zero termite, borer or insect damage guaranteed',
    },
    {
      icon: '🛠️',
      title: 'Turnkey Installation',
      desc: 'Expert craftsmen team for fast, flawless 1-2 day installation',
    },
    {
      icon: '🚚',
      title: 'Direct Sikar Delivery',
      desc: 'Prompt delivery across Sikar, Jaipur & all of Rajasthan',
    },
  ];

  return (
    <section className="trust-badges-section">
      <div className="container">
        <div className="trust-badges-grid">
          {badges.map((b, i) => (
            <div key={i} className="trust-badge-card">
              <div className="trust-badge-icon">{b.icon}</div>
              <div className="trust-badge-content">
                <h4 className="trust-badge-title">{b.title}</h4>
                <p className="trust-badge-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
