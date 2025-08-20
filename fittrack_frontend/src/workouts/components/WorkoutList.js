import React from 'react';

/**
 * PUBLIC_INTERFACE
 * WorkoutList renders a list of workout sessions with actions.
 * Props:
 * - sessions: array of workout sessions
 * - onEdit: function(session) -> void
 * - onDelete: function(id) -> void
 * - deletingId: string | null (to show state)
 */
export default function WorkoutList({ sessions, onEdit, onDelete, deletingId }) {
  if (!sessions?.length) {
    return <p style={{ color: '#555', marginTop: 8 }}>No workouts yet. Start by adding one!</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '12px 14px',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{s.exerciseType}</strong> • {s.date}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                type="button"
                onClick={() => onEdit(s)}
                style={{ background: '#FFB300', color: '#000' }}
              >
                Edit
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => onDelete(s.id)}
                disabled={deletingId === s.id}
                style={{ background: '#c62828' }}
              >
                {deletingId === s.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 6, color: '#555' }}>
            <span>Sets: {s.sets ?? 0}</span> • <span>Reps: {s.reps ?? 0}</span> •{' '}
            <span>Duration: {s.durationMinutes ?? 0}m</span>
          </div>
          {s.notes ? <div style={{ marginTop: 6, fontStyle: 'italic' }}>{s.notes}</div> : null}
        </div>
      ))}
    </div>
  );
}
