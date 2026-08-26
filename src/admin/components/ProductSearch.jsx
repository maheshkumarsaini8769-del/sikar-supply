import { useState, useRef, useEffect } from 'react';

export default function ProductSearch({ products, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = products.find(p => p._id === value);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(query.toLowerCase())) ||
    (p.category?.name && p.category.name.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 20);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, padding: '10px 14px',
          cursor: 'pointer', minHeight: 42, display: 'flex', alignItems: 'center',
          color: selected ? '#fff' : '#666', fontSize: 14,
        }}
      >
        {selected ? (
          <span>
            <b style={{ color: '#b8956a' }}>{selected.name}</b>
            <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>
              ₹{selected.salePrice || selected.price} | Stock: {selected.stockQuantity} {selected.unit}
            </span>
          </span>
        ) : (placeholder || 'Type to search product...')}
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#111', border: '1px solid #333', borderRadius: 8,
          maxHeight: 320, overflow: 'auto', marginTop: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', background: '#0a0a0a', border: 'none', borderBottom: '1px solid #333',
              color: '#fff', padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
          {filtered.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 13 }}>No products found</div>
          )}
          {filtered.map(p => (
            <div
              key={p._id}
              onClick={() => { onChange(p._id); setOpen(false); setQuery(''); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1a1a1a',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: value === p._id ? 'rgba(184,149,106,0.1)' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,149,106,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = value === p._id ? 'rgba(184,149,106,0.1)' : 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {p.sku && <span>SKU: {p.sku} · </span>}
                  {p.category?.name && <span>{p.category.name} · </span>}
                  <span style={{ color: p.stockQuantity > 0 ? '#25d366' : '#ff6b6b' }}>
                    Stock: {p.stockQuantity} {p.unit}
                  </span>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#b8956a', fontSize: 15 }}>
                ₹{p.salePrice || p.price || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
