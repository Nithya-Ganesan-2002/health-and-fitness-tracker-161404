import React from 'react';
import { Card } from '../../dashboard/components/ChartPrimitives';

/**
 * PUBLIC_INTERFACE
 * AchievementCelebration displays a celebratory banner when new badges are unlocked.
 * Props:
 * - badges: array of { id, name, desc }
 * - onClose: () => void
 */
export default function AchievementCelebration({ badges = [], onClose }) {
  if (!badges?.length) return null;
  return (
    <div className="card" role="status" style={{ borderColor: '#43A047', background: 'var(--success-bg)', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--success-text)' }}>
            🎉 New achievement{badges.length > 1 ? 's' : ''} unlocked!
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map((b) => (
              <div key={b.id} className="card" style={{ padding: '6px 8px', borderRadius: 8, background: 'var(--bg-primary)' }}>
                <div style={{ fontWeight: 600 }}>{b.name}</div>
                <div style={{ color: '#555', fontSize: 12 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn" type="button" onClick={onClose} style={{ background: '#43A047' }}>
          Awesome!
        </button>
      </div>
    </div>
  );
}
