import React, { useContext, useMemo, useState } from 'react';
import { WaterContext } from '../water/WaterContext';
import WaterForm from '../water/components/WaterForm';
import WaterList from '../water/components/WaterList';
import WaterWidget from '../water/components/WaterWidget';

/**
 * PUBLIC_INTERFACE
 * WaterPage provides UI to view, add, edit, and delete water intake logs.
 */
export default function WaterPage() {
  const { logs, loading, error, addLog, updateLog, deleteLog } = useContext(WaterContext);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sorted = useMemo(() => {
    return [...logs].sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)));
  }, [logs]);

  const beginAdd = () => {
    setEditing(null);
    setAdding(true);
  };
  const cancelAdd = () => setAdding(false);

  const beginEdit = (log) => {
    setAdding(false);
    setEditing(log);
  };
  const cancelEdit = () => setEditing(null);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addLog(form);
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateLog(editing.id, form);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this water log?')) return;
    setDeletingId(id);
    try {
      await deleteLog(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="auth-container">
      <h1>Hydration</h1>
      <h2>Track your daily water intake</h2>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      {/* Quick progress and add */}
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <WaterWidget />
      </div>

      {!adding && !editing && (
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={beginAdd}>+ Add water</button>
        </div>
      )}

      {adding && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Add water</h3>
          <WaterForm initial={null} onSubmit={handleAdd} onCancel={cancelAdd} submitting={saving} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Edit water</h3>
          <WaterForm initial={editing} onSubmit={handleEdit} onCancel={cancelEdit} submitting={saving} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {loading && <p style={{ color: '#555' }}>Loading…</p>}
        <WaterList logs={sorted} onEdit={beginEdit} onDelete={handleDelete} deletingId={deletingId} />
      </div>
    </div>
  );
}
