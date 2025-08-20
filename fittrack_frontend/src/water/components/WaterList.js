import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * WaterList renders the list of water intake logs grouped by date with totals.
 * Props:
 * - logs: array
 * - onEdit: (log) => void
 * - onDelete: (id) => void
 * - deletingId: id or null
 */
export default function WaterList({ logs, onEdit, onDelete, deletingId }) {
  const grouped = useMemo(() => {
    const map = new Map();
    (logs || []).forEach((l) => {
      const day = String(l.dateTime).slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(l);
    });
    // sort logs by dateTime desc within each day
    const entries = Array.from(map.entries()).map(([day, items]) => [
      day,
      items.sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime))),
    ]);
    // sort days desc
    entries.sort((a, b) => b[0].localeCompare(a[0]));
    return entries;
  }, [logs]);

  if (!logs?.length) {
    return <p style={{ color: '#555', marginTop: 8 }}>No water logs yet. Start by adding one!</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {grouped.map(([day, items]) => {
        const total = items.reduce((acc, it) => acc + (Number(it.amountMl) || 0), 0);
        return (
          <div key={day} className="card" style={{ padding: '12px 14px', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{day}</strong>
              <div style={{ color: '#555' }}>Total: {total} ml</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {items.map((l) => (
                <div
                  key={l.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{l.amountMl} ml</strong>{' '}
                    <span style={{ color: '#555' }}>{String(l.dateTime).replace('T', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" type="button" onClick={() => onEdit(l)} style={{ background: '#FFB300', color: '#000' }}>
                      Edit
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => onDelete(l.id)}
                      disabled={deletingId === l.id}
                      style={{ background: '#c62828' }}
                    >
                      {deletingId === l.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
