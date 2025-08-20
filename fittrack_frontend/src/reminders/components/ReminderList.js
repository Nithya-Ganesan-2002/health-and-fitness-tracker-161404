import React from 'react';
import { REMINDER_TYPES } from '../RemindersContext';

/**
 * PUBLIC_INTERFACE
 * ReminderList renders a list of reminders with actions.
 * Props:
 * - reminders: array
 * - onEdit: (rem) => void
 * - onDelete: (id) => void
 * - onToggle: (id, enabled) => void
 * - deletingId: id or null
 */
export default function ReminderList({ reminders, onEdit, onDelete, onToggle, deletingId }) {
  if (!reminders?.length) {
    return <p style={{ color: '#555', marginTop: 8 }}>No reminders yet. Create one to get started!</p>;
  }

  const labelForType = (t) => {
    switch (t) {
      case REMINDER_TYPES.workout:
        return 'Workout';
      case REMINDER_TYPES.hydration:
        return 'Hydration';
      case REMINDER_TYPES.meal:
        return 'Meal';
      default:
        return t;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {reminders.map((r) => (
        <div
          key={r.id}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '12px 14px',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <strong>{labelForType(r.type)}</strong> •{' '}
              <span style={{ color: '#555' }}>{String(r.dateTime).replace('T', ' ')}</span>
              {r.message ? <div style={{ marginTop: 4, color: '#444' }}>{r.message}</div> : null}
              {r.lastTriggeredAt ? (
                <div style={{ marginTop: 4, color: '#777', fontSize: 12 }}>
                  Last triggered: {new Date(r.lastTriggeredAt).toLocaleString()}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555' }}>
                <input
                  type="checkbox"
                  checked={r.enabled !== false}
                  onChange={(e) => onToggle(r.id, e.target.checked)}
                />
                Enabled
              </label>
              <button
                className="btn"
                type="button"
                onClick={() => onEdit(r)}
                style={{ background: '#FFB300', color: '#000' }}
              >
                Edit
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => onDelete(r.id)}
                disabled={deletingId === r.id}
                style={{ background: '#c62828' }}
              >
                {deletingId === r.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
