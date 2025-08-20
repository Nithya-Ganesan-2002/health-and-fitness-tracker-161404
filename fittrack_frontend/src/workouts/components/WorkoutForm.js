import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * WorkoutForm renders a form for creating or editing a workout session.
 * Props:
 * - initial: initial values
 * - onSubmit: async function(formValues) -> void
 * - onCancel: optional cancel handler
 * - submitting: boolean (loading state)
 */
export default function WorkoutForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    exerciseType: '',
    reps: '',
    sets: '',
    durationMinutes: '',
    notes: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date || new Date().toISOString().slice(0, 10),
        exerciseType: initial.exerciseType || '',
        reps: initial.reps ?? '',
        sets: initial.sets ?? '',
        durationMinutes: initial.durationMinutes ?? '',
        notes: initial.notes || '',
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Basic validation
    if (!form.exerciseType) return setError('Please enter exercise type');
    const reps = Number(form.reps) || 0;
    const sets = Number(form.sets) || 0;
    const durationMinutes = Number(form.durationMinutes) || 0;
    if (reps < 0 || sets < 0 || durationMinutes < 0) {
      return setError('Reps, sets, and duration must be non-negative');
    }
    try {
      await onSubmit({
        ...form,
        reps,
        sets,
        durationMinutes,
      });
    } catch (e2) {
      setError(e2?.message || 'Failed to submit');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}
      <label htmlFor="date">Date</label>
      <input
        id="date"
        name="date"
        type="date"
        value={form.date}
        onChange={onChange}
      />

      <label htmlFor="exerciseType">Exercise</label>
      <input
        id="exerciseType"
        name="exerciseType"
        type="text"
        placeholder="e.g., Squats, Running, Push-ups"
        value={form.exerciseType}
        onChange={onChange}
      />

      <label htmlFor="reps">Reps</label>
      <input
        id="reps"
        name="reps"
        type="number"
        min="0"
        placeholder="e.g., 10"
        value={form.reps}
        onChange={onChange}
      />

      <label htmlFor="sets">Sets</label>
      <input
        id="sets"
        name="sets"
        type="number"
        min="0"
        placeholder="e.g., 3"
        value={form.sets}
        onChange={onChange}
      />

      <label htmlFor="durationMinutes">Duration (minutes)</label>
      <input
        id="durationMinutes"
        name="durationMinutes"
        type="number"
        min="0"
        placeholder="e.g., 45"
        value={form.durationMinutes}
        onChange={onChange}
      />

      <label htmlFor="notes">Notes (optional)</label>
      <input
        id="notes"
        name="notes"
        type="text"
        placeholder="Any notes..."
        value={form.notes}
        onChange={onChange}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" type="submit" disabled={!!submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button
            className="btn"
            type="button"
            onClick={onCancel}
            disabled={!!submitting}
            style={{ background: '#6c757d' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
