import React, { useContext, useMemo, useState } from 'react';
import { WorkoutContext } from '../workouts/WorkoutContext';
import WorkoutForm from '../workouts/components/WorkoutForm';
import WorkoutList from '../workouts/components/WorkoutList';

/**
 * PUBLIC_INTERFACE
 * WorkoutsPage shows the list of sessions and provides UI to add/edit/delete workouts.
 */
export default function WorkoutsPage() {
  const { sessions, loading, error, addSession, updateSession, deleteSession } = useContext(WorkoutContext);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [sessions]);

  const beginAdd = () => {
    setEditing(null);
    setAdding(true);
  };

  const cancelAdd = () => {
    setAdding(false);
  };

  const beginEdit = (session) => {
    setAdding(false);
    setEditing(session);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addSession(form);
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateSession(editing.id, form);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    setDeletingId(id);
    try {
      await deleteSession(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="auth-container">
      <h1>Workouts</h1>
      <h2>Log and manage your workout sessions</h2>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      {!adding && !editing && (
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={beginAdd}>+ Add workout</button>
        </div>
      )}

      {adding && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Add workout</h3>
          <WorkoutForm initial={null} onSubmit={handleAdd} onCancel={cancelAdd} submitting={saving} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Edit workout</h3>
          <WorkoutForm initial={editing} onSubmit={handleEdit} onCancel={cancelEdit} submitting={saving} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {loading && <p style={{ color: '#555' }}>Loading…</p>}
        <WorkoutList sessions={sorted} onEdit={beginEdit} onDelete={handleDelete} deletingId={deletingId} />
      </div>
    </div>
  );
}
