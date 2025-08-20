import React, { useEffect, useState } from 'react';
import { REMINDER_TYPES } from '../RemindersContext';

/**
 * PUBLIC_INTERFACE
 * ReminderForm renders a unified form for creating or editing reminders.
 * Props:
 * - initial: initial reminder or null
 * - onSubmit: async (formValues) => void
 * - onCancel: optional () => void
 * - submitting: boolean
 */
export default function ReminderForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    type: REMINDER_TYPES.workout,
    dateTime: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString().slice(0, 16), // +10 min
    message: '',
    enabled: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        type: initial.type || REMINDER_TYPES.workout,
        dateTime: initial.dateTime?.slice(0, 16) || new Date().toISOString().slice(0, 16),
        message: initial.message || '',
        enabled: initial.enabled !== false,
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!form.type) return 'Please select a reminder type';
    if (!form.dateTime) return 'Please select date and time';
    const when = new Date(form.dateTime).getTime();
    if (Number.isNaN(when)) return 'Invalid date/time';
    if (when < Date.now() - 60 * 1000) return 'Time must be in the future';
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
        type: form.type,
        dateTime: new Date(form.dateTime).toISOString().slice(0, 16),
        message: form.message.trim(),
        enabled: !!form.enabled,
      });
    } catch (e2) {
      setError(e2?.message || 'Failed to save reminder');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <label htmlFor="type">Type</label>
      <select id="type" name="type" value={form.type} onChange={onChange}>
        <option value={REMINDER_TYPES.workout}>Workout</option>
        <option value={REMINDER_TYPES.hydration}>Hydration</option>
        <option value={REMINDER_TYPES.meal}>Meal</option>
      </select>

      <label htmlFor="dateTime">Date & time</label>
      <input id="dateTime" name="dateTime" type="datetime-local" value={form.dateTime} onChange={onChange} />

      <label htmlFor="message">Message (optional)</label>
      <input id="message" name="message" type="text" placeholder="Add a note to your reminder" value={form.message} onChange={onChange} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input id="enabled" name="enabled" type="checkbox" checked={!!form.enabled} onChange={onChange} />
        <label htmlFor="enabled">Enabled</label>
      </div>

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
