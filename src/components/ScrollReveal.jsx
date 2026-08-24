import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const dirClass = `reveal-${direction}`;
  return (
    <div
      ref={ref}
      className={`${className} reveal ${dirClass} ${isVisible ? 'revealed' : ''}`}
    >
      {children}
    </div>
  );
}
