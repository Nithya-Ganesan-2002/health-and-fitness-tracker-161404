import { startOfDayKey, startOfWeekKey, toDateOnly } from './date';

// PUBLIC_INTERFACE
export function aggregateWorkoutsByDay(sessions = [], days = 7) {
  const map = new Map();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    map.set(toDateOnly(d), 0);
  }
  sessions.forEach((s) => {
    const key = toDateOnly(new Date(s.date));
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label: label.slice(5), value }));
}

// PUBLIC_INTERFACE
export function aggregateWorkoutDurationByDay(sessions = [], days = 7) {
  const map = new Map();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    map.set(toDateOnly(d), 0);
  }
  sessions.forEach((s) => {
    const key = toDateOnly(new Date(s.date));
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + (Number(s.durationMinutes) || 0));
    }
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label: label.slice(5), value }));
}

// PUBLIC_INTERFACE
export function aggregateMacros(meals = []) {
  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += Number(m.calories) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fats += Number(m.fats) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
  return totals;
}

// PUBLIC_INTERFACE
export function aggregateMealsByDay(meals = [], days = 7) {
  const map = new Map();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    map.set(toDateOnly(d), 0);
  }
  meals.forEach((m) => {
    const key = toDateOnly(new Date(m.dateTime));
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + (Number(m.calories) || 0));
    }
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label: label.slice(5), value }));
}

// PUBLIC_INTERFACE
export function computeAchievements({ sessions = [], meals = [], goals = null }) {
  const totals = aggregateMacros(meals);
  const workoutsThisWeek = sessions.filter((s) => startOfWeekKey(new Date(s.date)) === startOfWeekKey(new Date())).length;
  const workoutStreakDays = computeStreakDays(sessions);

  const badges = [];
  if (workoutsThisWeek >= 3) badges.push({ id: 'wk3', name: 'Consistency Lv1', desc: '3+ workouts this week' });
  if (workoutStreakDays >= 3) badges.push({ id: 'streak3', name: 'Streak Lv1', desc: '3-day workout streak' });
  if (totals.calories >= 2000) badges.push({ id: 'cal2k', name: 'Fuel Up', desc: '2000+ daily calories' });

  // Goal-aligned hints
  const hints = [];
  if (goals?.workoutsPerWeek != null) {
    hints.push(`Target workouts/week: ${goals.workoutsPerWeek}, current: ${workoutsThisWeek}`);
  }
  if (goals?.dailySteps != null) {
    hints.push(`Daily steps goal: ${goals.dailySteps} (track steps in future update)`);
  }

  return { badges, hints, workoutStreakDays, workoutsThisWeek };
}

// Helpers
function computeStreakDays(sessions = []) {
  // count consecutive days with at least one workout ending today backward
  const byDay = new Set(sessions.map((s) => startOfDayKey(new Date(s.date))));
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = startOfDayKey(d);
    if (byDay.has(key)) streak += 1;
    else break;
  }
  return streak;
}
