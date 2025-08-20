import React, { useContext, useMemo, useState } from 'react';
import { RemindersContext } from '../reminders/RemindersContext';
import ReminderForm from '../reminders/components/ReminderForm';
import ReminderList from '../reminders/components/ReminderList';

/**
 * PUBLIC_INTERFACE
 * RemindersPage provides UI to create, edit, delete, and toggle daily reminders.
 * It also exposes a button to request browser notifications permission.
 */
export default function RemindersPage() {
  const { reminders, loading, error, addReminder, updateReminder, deleteReminder, requestNotificationPermission } =
    useContext(RemindersContext);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [permStatus, setPermStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const sorted = useMemo(() => {
    return [...reminders].sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)));
  }, [reminders]);

  const askPermission = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
  };

  const beginAdd = () => {
    setEditing(null);
    setAdding(true);
  };

  const cancelAdd = () => setAdding(false);

  const beginEdit = (rem) => {
    setAdding(false);
    setEditing(rem);
  };

  const cancelEdit = () => setEditing(null);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addReminder(form);
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateReminder(editing.id, form);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    setDeletingId(id);
    try {
      await deleteReminder(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id, enabled) => {
    await updateReminder(id, { enabled });
  };

  return (
    <div className="auth-container">
      <h1>Daily Reminders</h1>
      <h2>Schedule reminders for workouts, hydration, and meals</h2>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Notifications</strong>
          <div style={{ color: '#555', fontSize: 13 }}>Permission: {permStatus}</div>
        </div>
        <button className="btn" type="button" onClick={askPermission}>
          Enable notifications
        </button>
      </div>

      {!adding && !editing && (
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={beginAdd}>+ Schedule reminder</button>
        </div>
      )}

      {adding && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Add reminder</h3>
          <ReminderForm initial={null} onSubmit={handleAdd} onCancel={cancelAdd} submitting={saving} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Edit reminder</h3>
          <ReminderForm initial={editing} onSubmit={handleEdit} onCancel={cancelEdit} submitting={saving} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {loading && <p style={{ color: '#555' }}>Loading…</p>}
        <ReminderList reminders={sorted} onEdit={beginEdit} onDelete={handleDelete} onToggle={handleToggle} deletingId={deletingId} />
      </div>
    </div>
  );
}
