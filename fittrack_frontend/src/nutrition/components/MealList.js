import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * MealList renders a list of meal logs with actions and a daily total summary.
 * Props:
 * - meals: array of meals
 * - onEdit: function(meal) -> void
 * - onDelete: function(id) -> void
 * - deletingId: id currently being deleted
 */
export default function MealList({ meals, onEdit, onDelete, deletingId }) {
  // Hooks must run unconditionally
  const totals = useMemo(() => {
    const list = Array.isArray(meals) ? meals : [];
    return list.reduce(
      (acc, m) => {
        acc.calories += Number(m.calories) || 0;
        acc.protein += Number(m.protein) || 0;
        acc.carbs += Number(m.carbs) || 0;
        acc.fats += Number(m.fats) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  const hasMeals = Array.isArray(meals) && meals.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {hasMeals ? (
        <>
          <div className="card" style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Totals</strong>
            <div style={{ color: '#555' }}>
              <span>Calories: {totals.calories}</span> • <span>P: {totals.protein}g</span> • <span>C: {totals.carbs}g</span> • <span>F: {totals.fats}g</span>
            </div>
          </div>

          {meals.map((m) => (
            <div
              key={m.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{m.name}</strong> • <span style={{ color: '#555' }}>{m.dateTime?.replace('T', ' ')}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" type="button" onClick={() => onEdit(m)} style={{ background: '#FFB300', color: '#000' }}>
                    Edit
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => onDelete(m.id)}
                    disabled={deletingId === m.id}
                    style={{ background: '#c62828' }}
                  >
                    {deletingId === m.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 6, color: '#555' }}>
                <span>Calories: {m.calories}</span> • <span>P: {m.protein}g</span> • <span>C: {m.carbs}g</span> • <span>F: {m.fats}g</span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p style={{ color: '#555', marginTop: 8 }}>No meals logged yet. Start by adding one!</p>
      )}
    </div>
  );
}
