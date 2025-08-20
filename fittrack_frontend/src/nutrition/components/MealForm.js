import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * MealForm renders a form for creating or editing a meal log.
 * Props:
 * - initial: initial values or null
 * - onSubmit: async function(formValues) -> void
 * - onCancel: optional cancel handler
 * - submitting: boolean
 */
export default function MealForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    dateTime: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        calories: initial.calories ?? '',
        protein: initial.protein ?? '',
        carbs: initial.carbs ?? '',
        fats: initial.fats ?? '',
        dateTime: initial.dateTime || new Date().toISOString().slice(0, 16),
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter meal name';
    const calories = Number(form.calories);
    const protein = Number(form.protein);
    const carbs = Number(form.carbs);
    const fats = Number(form.fats);
    if ([calories, protein, carbs, fats].some((n) => Number.isNaN(n))) {
      return 'Calories, protein, carbs, and fats must be numbers';
    }
    if ([calories, protein, carbs, fats].some((n) => n < 0)) {
      return 'Calories and macros cannot be negative';
    }
    if (!form.dateTime) return 'Please select date & time';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    try {
      await onSubmit({
        name: form.name.trim(),
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fats: Number(form.fats),
        dateTime: form.dateTime,
      });
    } catch (e2) {
      setError(e2?.message || 'Failed to submit');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <label htmlFor="name">Meal name</label>
      <input id="name" name="name" type="text" placeholder="e.g., Grilled Chicken Salad" value={form.name} onChange={onChange} />

      <label htmlFor="calories">Calories</label>
      <input id="calories" name="calories" type="number" min="0" placeholder="e.g., 450" value={form.calories} onChange={onChange} />

      <label htmlFor="protein">Protein (g)</label>
      <input id="protein" name="protein" type="number" min="0" placeholder="e.g., 35" value={form.protein} onChange={onChange} />

      <label htmlFor="carbs">Carbs (g)</label>
      <input id="carbs" name="carbs" type="number" min="0" placeholder="e.g., 40" value={form.carbs} onChange={onChange} />

      <label htmlFor="fats">Fats (g)</label>
      <input id="fats" name="fats" type="number" min="0" placeholder="e.g., 12" value={form.fats} onChange={onChange} />

      <label htmlFor="dateTime">Date & time</label>
      <input id="dateTime" name="dateTime" type="datetime-local" value={form.dateTime} onChange={onChange} />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" type="submit" disabled={!!submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button className="btn" type="button" onClick={onCancel} disabled={!!submitting} style={{ background: '#6c757d' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
