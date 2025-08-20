import React from 'react';

/**
 * PUBLIC_INTERFACE
 * DayDetail renders a simple modal-like card with lists of workouts and meals for a given day,
 * and exposes Add/Edit actions via callbacks to parent page which has access to contexts.
 * Props:
 * - dateKey: string (yyyy-mm-dd)
 * - workouts: array
 * - meals: array
 * - onClose: () => void
 * - onAddWorkout: (dateKey) => void
 * - onAddMeal: (dateKey) => void
 * - onEditWorkout: (session) => void
 * - onEditMeal: (meal) => void
 * - onDeleteWorkout: (id) => void
 * - onDeleteMeal: (id) => void
 * - deletingWorkoutId: string|null
 * - deletingMealId: string|null
 */
export default function DayDetail({
  dateKey,
  workouts = [],
  meals = [],
  onClose,
  onAddWorkout,
  onAddMeal,
  onEditWorkout,
  onEditMeal,
  onDeleteWorkout,
  onDeleteMeal,
  deletingWorkoutId,
  deletingMealId,
}) {
  return (
    <div className="card" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div className="card" style={{ maxWidth: 640, width: '100%', background: 'var(--bg-primary)', padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Details for {dateKey}</strong>
          </div>
          <button className="btn" type="button" onClick={onClose} style={{ background: '#6c757d' }}>
            Close
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Workouts</strong>
              <button className="btn" type="button" onClick={() => onAddWorkout?.(dateKey)}>+ Add workout</button>
            </div>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {workouts.length ? workouts.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 10px', background: 'var(--bg-secondary)' }}>
                  <div>
                    <strong>{s.exerciseType}</strong>{' '}
                    <span style={{ color: '#555' }}>sets: {s.sets ?? 0}, reps: {s.reps ?? 0}, {s.durationMinutes ?? 0}m</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" type="button" onClick={() => onEditWorkout?.(s)} style={{ background: '#FFB300', color: '#000' }}>Edit</button>
                    <button className="btn" type="button" onClick={() => onDeleteWorkout?.(s.id)} disabled={deletingWorkoutId === s.id} style={{ background: '#c62828' }}>
                      {deletingWorkoutId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )) : <div style={{ color: '#555' }}>No workouts for this day.</div>}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Meals</strong>
              <button className="btn" type="button" onClick={() => onAddMeal?.(dateKey)}>+ Add meal</button>
            </div>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {meals.length ? meals.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 10px', background: 'var(--bg-secondary)' }}>
                  <div>
                    <strong>{m.name}</strong>{' '}
                    <span style={{ color: '#555' }}>Cals: {m.calories}, P:{m.protein}g C:{m.carbs}g F:{m.fats}g</span>
                    <div style={{ color: '#777', fontSize: 12 }}>{String(m.dateTime).replace('T', ' ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" type="button" onClick={() => onEditMeal?.(m)} style={{ background: '#FFB300', color: '#000' }}>Edit</button>
                    <button className="btn" type="button" onClick={() => onDeleteMeal?.(m.id)} disabled={deletingMealId === m.id} style={{ background: '#c62828' }}>
                      {deletingMealId === m.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )) : <div style={{ color: '#555' }}>No meals for this day.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
