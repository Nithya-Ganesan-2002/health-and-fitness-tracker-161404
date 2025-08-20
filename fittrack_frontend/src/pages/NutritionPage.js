import React, { useContext, useMemo, useState } from 'react';
import { NutritionContext } from '../nutrition/NutritionContext';
import MealForm from '../nutrition/components/MealForm';
import MealList from '../nutrition/components/MealList';

/**
 * PUBLIC_INTERFACE
 * NutritionPage shows meal logs and provides UI to add/edit/delete meals.
 */
export default function NutritionPage() {
  const { meals, loading, error, addMeal, updateMeal, deleteMeal } = useContext(NutritionContext);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sorted = useMemo(() => {
    // Sort by dateTime desc
    return [...meals].sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)));
  }, [meals]);

  const beginAdd = () => {
    setEditing(null);
    setAdding(true);
  };

  const cancelAdd = () => setAdding(false);

  const beginEdit = (meal) => {
    setAdding(false);
    setEditing(meal);
  };

  const cancelEdit = () => setEditing(null);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addMeal(form);
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateMeal(editing.id, form);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal?')) return;
    setDeletingId(id);
    try {
      await deleteMeal(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="auth-container">
      <h1>Nutrition</h1>
      <h2>Log and manage your meals</h2>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 8 }}>
          {error}
        </div>
      )}

      {!adding && !editing && (
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={beginAdd}>+ Add meal</button>
        </div>
      )}

      {adding && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Add meal</h3>
          <MealForm initial={null} onSubmit={handleAdd} onCancel={cancelAdd} submitting={saving} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>Edit meal</h3>
          <MealForm initial={editing} onSubmit={handleEdit} onCancel={cancelEdit} submitting={saving} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {loading && <p style={{ color: '#555' }}>Loading…</p>}
        <MealList meals={sorted} onEdit={beginEdit} onDelete={handleDelete} deletingId={deletingId} />
      </div>
    </div>
  );
}
