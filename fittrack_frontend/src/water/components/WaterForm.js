import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * WaterForm renders a form for creating or editing a water intake log.
 * Props:
 * - initial: { amountMl, dateTime } | null
 * - onSubmit: async (formValues) => void
 * - onCancel: optional () => void
 * - submitting: boolean
 */
export default function WaterForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    amountMl: '',
    dateTime: new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        amountMl: initial.amountMl ?? '',
        dateTime: initial.dateTime || new Date().toISOString().slice(0, 16),
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const amount = Number(form.amountMl);
    if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be a positive number';
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
        amountMl: Number(form.amountMl),
        dateTime: form.dateTime,
      });
    } catch (e2) {
      setError(e2?.message || 'Failed to save');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <label htmlFor="amountMl">Amount (ml)</label>
      <input
        id="amountMl"
        name="amountMl"
        type="number"
        min="10"
        step="10"
        placeholder="e.g., 250"
        value={form.amountMl}
        onChange={onChange}
      />

      <label htmlFor="dateTime">Date & time</label>
      <input
        id="dateTime"
        name="dateTime"
        type="datetime-local"
        value={form.dateTime}
        onChange={onChange}
      />

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
