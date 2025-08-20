import React, { useContext, useMemo, useState } from 'react';
import { GoalsContext } from '../goals/GoalsContext';
import GoalsForm from '../goals/components/GoalsForm';

/**
 * PUBLIC_INTERFACE
 * GoalsPage provides UI to view and update fitness goals (weight, steps, frequency).
 */
export default function GoalsPage() {
  const { goals, loading, error, saveGoals, clearGoals } = useContext(GoalsContext);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const summary = useMemo(() => {
    if (!goals) return 'No goals set yet.';
    const parts = [];
    if (goals.targetWeightKg != null) parts.push(`Target weight: ${goals.targetWeightKg} kg`);
    if (goals.dailySteps != null) parts.push(`Daily steps: ${goals.dailySteps}`);
    if (goals.workoutsPerWeek != null) parts.push(`Workouts/week: ${goals.workoutsPerWeek}`);
    return parts.length ? parts.join(' • ') : 'No goals set yet.';
  }, [goals]);

  const beginEdit = () => setEditing(true);
  const cancelEdit = () => setEditing(false);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      await saveGoals(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all goals?')) return;
    setClearing(true);
    try {
      await clearGoals();
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Goals</h1>
      <h2>Set and update your fitness goals</h2>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      {!editing && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Current goals</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={beginEdit}>Edit goals</button>
              <button
                className="btn"
                type="button"
                onClick={handleClear}
                disabled={clearing}
                style={{ background: '#c62828' }}
              >
                {clearing ? 'Clearing…' : 'Clear'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#555' }}>
            {loading ? 'Loading…' : summary}
          </div>
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Update goals</h3>
          <GoalsForm initial={goals} onSubmit={handleSave} onCancel={cancelEdit} submitting={saving} />
        </div>
      )}

      {!editing && !goals && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Set your goals</h3>
          <GoalsForm initial={goals} onSubmit={handleSave} submitting={saving} />
        </div>
      )}
    </div>
  );
}
