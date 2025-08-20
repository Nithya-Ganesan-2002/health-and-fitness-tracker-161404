import React, { useContext, useMemo, useState } from 'react';
import { WorkoutContext } from '../workouts/WorkoutContext';
import { NutritionContext } from '../nutrition/NutritionContext';
import CalendarGrid from '../calendar/components/CalendarGrid';
import DayDetail from '../calendar/components/DayDetail';
import { aggregateEntriesByDate, toDateOnly } from '../calendar/utils';
import MealForm from '../nutrition/components/MealForm';
import WorkoutForm from '../workouts/components/WorkoutForm';

/**
 * PUBLIC_INTERFACE
 * CalendarPage displays an interactive monthly calendar summarizing workouts and meals per day.
 * - Navigate months
 * - Click a day to view details and add/edit entries
 * Integration:
 * - Reads sessions from WorkoutContext and meals from NutritionContext
 * - Uses existing add/update/delete actions from those contexts
 */
export default function CalendarPage() {
  const { sessions, addSession, updateSession, deleteSession } = useContext(WorkoutContext);
  const { meals, addMeal, updateMeal, deleteMeal } = useContext(NutritionContext);

  // current visible month
  const [cursor, setCursor] = useState(() => new Date());
  // day detail state
  const [detailKey, setDetailKey] = useState(null);
  // inline edit modals under detail
  const [addingWorkoutDate, setAddingWorkoutDate] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [addingMealDate, setAddingMealDate] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);
  const [deletingMealId, setDeletingMealId] = useState(null);

  const monthYear = cursor.getFullYear();
  const monthIndex = cursor.getMonth();

  const byDate = useMemo(() => aggregateEntriesByDate({ sessions, meals }), [sessions, meals]);

  const onPrevMonth = () => {
    const prev = new Date(cursor);
    prev.setMonth(cursor.getMonth() - 1);
    setCursor(prev);
  };
  const onNextMonth = () => {
    const next = new Date(cursor);
    next.setMonth(cursor.getMonth() + 1);
    setCursor(next);
  };

  const openDay = (date) => {
    setDetailKey(toDateOnly(date));
    // close any editors
    setAddingMealDate(null);
    setEditingMeal(null);
    setAddingWorkoutDate(null);
    setEditingWorkout(null);
  };

  const closeDetail = () => {
    setDetailKey(null);
    setAddingMealDate(null);
    setEditingMeal(null);
    setAddingWorkoutDate(null);
    setEditingWorkout(null);
    setSaving(false);
    setDeletingMealId(null);
    setDeletingWorkoutId(null);
  };

  const renderDayExtras = (date) => {
    const key = toDateOnly(date);
    const group = byDate.get(key);
    if (!group) return null;
    const w = group.workouts.length;
    const m = group.meals.length;
    if (w === 0 && m === 0) return null;
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {w > 0 ? (
          <span style={{ fontSize: 11, background: 'rgba(25,118,210,0.15)', color: '#1976D2', padding: '2px 6px', borderRadius: 6 }}>
            {w} workout{w > 1 ? 's' : ''}
          </span>
        ) : null}
        {m > 0 ? (
          <span style={{ fontSize: 11, background: 'rgba(67,160,71,0.15)', color: '#43A047', padding: '2px 6px', borderRadius: 6 }}>
            {m} meal{m > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
    );
  };

  const dayWorkouts = detailKey ? (byDate.get(detailKey)?.workouts || []) : [];
  const dayMeals = detailKey ? (byDate.get(detailKey)?.meals || []) : [];

  // Handlers for add/edit/delete using existing context actions
  const onAddWorkout = (dateKey) => {
    setAddingWorkoutDate(dateKey);
    setEditingWorkout(null);
    setAddingMealDate(null);
    setEditingMeal(null);
  };
  const onAddMeal = (dateKey) => {
    setAddingMealDate(dateKey);
    setEditingMeal(null);
    setAddingWorkoutDate(null);
    setEditingWorkout(null);
  };

  const onSaveNewWorkout = async (form) => {
    setSaving(true);
    try {
      await addSession({ ...form, date: addingWorkoutDate || form.date });
      setAddingWorkoutDate(null);
    } finally {
      setSaving(false);
    }
  };
  const onSaveEditWorkout = async (form) => {
    if (!editingWorkout) return;
    setSaving(true);
    try {
      await updateSession(editingWorkout.id, form);
      setEditingWorkout(null);
    } finally {
      setSaving(false);
    }
  };
  const onDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    setDeletingWorkoutId(id);
    try {
      await deleteSession(id);
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const onSaveNewMeal = async (form) => {
    setSaving(true);
    try {
      // Ensure dateTime matches selected day if launching from day
      const dt = form.dateTime || new Date().toISOString().slice(0, 16);
      const normalized =
        addingMealDate
          ? { ...form, dateTime: `${addingMealDate}T${String(dt).slice(11, 16)}` }
          : form;
      await addMeal(normalized);
      setAddingMealDate(null);
    } finally {
      setSaving(false);
    }
  };
  const onSaveEditMeal = async (form) => {
    if (!editingMeal) return;
    setSaving(true);
    try {
      await updateMeal(editingMeal.id, form);
      setEditingMeal(null);
    } finally {
      setSaving(false);
    }
  };
  const onDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal?')) return;
    setDeletingMealId(id);
    try {
      await deleteMeal(id);
    } finally {
      setDeletingMealId(null);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 1000 }}>
      <h1>Calendar</h1>
      <h2>Overview of your workouts and nutrition</h2>
      <div style={{ margin: '8px 0 12px' }}>
        <a href="/share" className="btn" style={{ textDecoration: 'none', display: 'inline-block', background: '#43A047' }}>
          Share / Export This Month
        </a>
      </div>

      <div style={{ marginTop: 10 }}>
        <CalendarGrid
          year={monthYear}
          month={monthIndex}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onSelectDay={openDay}
          renderDayExtras={renderDayExtras}
        />
      </div>

      {detailKey && (
        <DayDetail
          dateKey={detailKey}
          workouts={dayWorkouts}
          meals={dayMeals}
          onClose={closeDetail}
          onAddWorkout={onAddWorkout}
          onAddMeal={onAddMeal}
          onEditWorkout={(s) => { setEditingWorkout(s); setAddingWorkoutDate(null); setAddingMealDate(null); setEditingMeal(null); }}
          onEditMeal={(m) => { setEditingMeal(m); setAddingMealDate(null); setAddingWorkoutDate(null); setEditingWorkout(null); }}
          onDeleteWorkout={onDeleteWorkout}
          onDeleteMeal={onDeleteMeal}
          deletingWorkoutId={deletingWorkoutId}
          deletingMealId={deletingMealId}
        />
      )}

      {/* Inline editors for the selected day, rendered at page level */}
      {addingWorkoutDate && detailKey === addingWorkoutDate && (
        <div className="card" style={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 420, zIndex: 51 }}>
          <h3 style={{ margin: '8px 0' }}>Add workout ({addingWorkoutDate})</h3>
          <WorkoutForm initial={{ date: addingWorkoutDate }} onSubmit={onSaveNewWorkout} onCancel={() => setAddingWorkoutDate(null)} submitting={saving} />
        </div>
      )}
      {editingWorkout && (
        <div className="card" style={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 420, zIndex: 51 }}>
          <h3 style={{ margin: '8px 0' }}>Edit workout</h3>
          <WorkoutForm initial={editingWorkout} onSubmit={onSaveEditWorkout} onCancel={() => setEditingWorkout(null)} submitting={saving} />
        </div>
      )}
      {addingMealDate && detailKey === addingMealDate && (
        <div className="card" style={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 420, zIndex: 51 }}>
          <h3 style={{ margin: '8px 0' }}>Add meal ({addingMealDate})</h3>
          <MealForm initial={{ dateTime: `${addingMealDate}T12:00` }} onSubmit={onSaveNewMeal} onCancel={() => setAddingMealDate(null)} submitting={saving} />
        </div>
      )}
      {editingMeal && (
        <div className="card" style={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 420, zIndex: 51 }}>
          <h3 style={{ margin: '8px 0' }}>Edit meal</h3>
          <MealForm initial={editingMeal} onSubmit={onSaveEditMeal} onCancel={() => setEditingMeal(null)} submitting={saving} />
        </div>
      )}
    </div>
  );
}
