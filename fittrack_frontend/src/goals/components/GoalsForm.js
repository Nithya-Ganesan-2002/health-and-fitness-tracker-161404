import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * GoalsForm renders a form for setting or updating user fitness goals.
 * Props:
 * - initial: { targetWeightKg, dailySteps, workoutsPerWeek } | null
 * - onSubmit: async function(formValues) -> void
 * - onCancel: optional cancel handler
 * - submitting: boolean (loading state)
 */
export default function GoalsForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    targetWeightKg: '',
    dailySteps: '',
    workoutsPerWeek: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        targetWeightKg: initial.targetWeightKg ?? '',
        dailySteps: initial.dailySteps ?? '',
        workoutsPerWeek: initial.workoutsPerWeek ?? '',
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const toNumberOrEmpty = (v) => (v === '' || v === null ? '' : Number(v));
    const weight = toNumberOrEmpty(form.targetWeightKg);
    const steps = toNumberOrEmpty(form.dailySteps);
    const freq = toNumberOrEmpty(form.workoutsPerWeek);

    if (weight !== '' && (Number.isNaN(weight) || weight <= 0)) return 'Target weight must be a positive number';
    if (steps !== '' && (Number.isNaN(steps) || steps < 0)) return 'Daily steps must be a non-negative number';
    if (freq !== '' && (Number.isNaN(freq) || freq < 0)) return 'Workouts per week must be a non-negative number';
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
        targetWeightKg: form.targetWeightKg === '' ? null : Number(form.targetWeightKg),
        dailySteps: form.dailySteps === '' ? null : Number(form.dailySteps),
        workoutsPerWeek: form.workoutsPerWeek === '' ? null : Number(form.workoutsPerWeek),
      });
    } catch (e2) {
      setError(e2?.message || 'Failed to save goals');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <label htmlFor="targetWeightKg">Target weight (kg)</label>
      <input
        id="targetWeightKg"
        name="targetWeightKg"
        type="number"
        min="0"
        placeholder="e.g., 72"
        value={form.targetWeightKg}
        onChange={onChange}
      />

      <label htmlFor="dailySteps">Daily step count</label>
      <input
        id="dailySteps"
        name="dailySteps"
        type="number"
        min="0"
        placeholder="e.g., 10000"
        value={form.dailySteps}
        onChange={onChange}
      />

      <label htmlFor="workoutsPerWeek">Workouts per week</label>
      <input
        id="workoutsPerWeek"
        name="workoutsPerWeek"
        type="number"
        min="0"
        placeholder="e.g., 4"
        value={form.workoutsPerWeek}
        onChange={onChange}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" type="submit" disabled={!!submitting}>
          {submitting ? 'Saving…' : 'Save goals'}
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
