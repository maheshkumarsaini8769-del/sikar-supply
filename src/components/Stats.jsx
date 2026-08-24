import { useSite } from '../context/SiteContext';
import ScrollReveal from './ScrollReveal';

export default function Stats() {
  const { settings } = useSite();

  const stats = [
    { value: settings?.statsYears || '12+', label: 'Years of Experience' },
    { value: settings?.statsProjects || '1000+', label: 'Projects Completed' },
    { value: settings?.statsRating || '5', label: 'Customer Rating', suffix: '★' },
  ];

  return (
    <section className="stats" id="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="stat-item">
                <span className="stat-number">{stat.value}{stat.suffix || ''}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
