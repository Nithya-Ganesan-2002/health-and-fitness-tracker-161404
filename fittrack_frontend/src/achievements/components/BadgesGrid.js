import React from 'react';

/**
 * PUBLIC_INTERFACE
 * BadgesGrid renders a responsive grid of earned badges.
 * Props:
 * - badges: array of { id, name, desc, type, tier }
 * - emptyMessage?: string
 */
export default function BadgesGrid({ badges = [], emptyMessage = 'No badges yet. Keep going!' }) {
  if (!badges.length) {
    return <div style={{ color: '#666' }}>{emptyMessage}</div>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
      {badges.map((b) => (
        <div key={b.id} className="card" style={{ padding: '10px 12px', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontWeight: 700 }}>
              {b.name}
              {b.tier ? <span style={{ marginLeft: 8, color: '#777', fontSize: 12 }}>Tier {b.tier}</span> : null}
            </div>
            <span style={{ fontSize: 12, color: '#777' }}>{b.type}</span>
          </div>
          <div style={{ color: '#555', fontSize: 13, marginTop: 4 }}>{b.desc}</div>
        </div>
      ))}
    </div>
  );
}
