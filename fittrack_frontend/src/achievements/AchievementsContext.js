import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { WorkoutContext } from '../workouts/WorkoutContext';
import { NutritionContext } from '../nutrition/NutritionContext';
import { GoalsContext } from '../goals/GoalsContext';
import { WaterContext } from '../water/WaterContext';

/**
 * PUBLIC_INTERFACE
 * Achievement definitions and helpers.
 * Badge structure:
 * { id: string, name: string, desc: string, icon?: string, type: 'streak'|'consistency'|'goal'|'nutrition'|'hydration', tier?: number }
 */
const BADGE_DEFS = [
  { id: 'streak3', name: 'Streak Lv1', desc: '3-day workout streak', type: 'streak', tier: 1 },
  { id: 'streak7', name: 'Streak Lv2', desc: '7-day workout streak', type: 'streak', tier: 2 },
  { id: 'streak14', name: 'Streak Lv3', desc: '14-day workout streak', type: 'streak', tier: 3 },
  { id: 'wk3', name: 'Consistency Lv1', desc: '3+ workouts this week', type: 'consistency', tier: 1 },
  { id: 'wk5', name: 'Consistency Lv2', desc: '5+ workouts this week', type: 'consistency', tier: 2 },
  { id: 'meal7', name: 'Mindful Logger', desc: 'Logged meals 7 days in a row', type: 'nutrition', tier: 1 },
  { id: 'macro2000', name: 'Fuel Up', desc: '2000+ calories in a day', type: 'nutrition', tier: 1 },
  { id: 'water2l', name: 'Hydration Hero', desc: 'Reached 2000 ml water goal today', type: 'hydration', tier: 1 },
  { id: 'goal-met', name: 'Goal Crusher', desc: 'Met weekly workout goal', type: 'goal', tier: 1 },
];

/**
 * Helpers for dates
 */
function toDateOnly(d) {
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function startOfWeekKey(d) {
  const day = d.getDay(); // 0=sun
  const diff = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diff);
  return toDateOnly(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
}

/**
 * Compute workout streak in days counting back from today.
 */
function computeWorkoutStreakDays(sessions) {
  const byDay = new Set((sessions || []).map((s) => toDateOnly(new Date(s.date))));
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateOnly(d);
    if (byDay.has(key)) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Compute a map date->hasMeal and meal-calorie totals by date
 */
function computeMealDaily(meals) {
  const map = new Map();
  (meals || []).forEach((m) => {
    const key = toDateOnly(new Date(m.dateTime));
    const prev = map.get(key) || { count: 0, calories: 0 };
    map.set(key, { count: prev.count + 1, calories: prev.calories + (Number(m.calories) || 0) });
  });
  return map;
}

/**
 * PUBLIC_INTERFACE
 * AchievementsContext provides earned badges, progress metrics, and handler to mark celebrations as seen.
 */
export const AchievementsContext = createContext({
  badges: [],
  newlyUnlocked: [],
  progress: {
    workoutStreakDays: 0,
    workoutsThisWeek: 0,
    mealsStreakDays: 0,
    waterReachedToday: false,
  },
  markCelebrationsSeen: () => {},
});

/**
 * PUBLIC_INTERFACE
 * AchievementsProvider derives achievements from other domain contexts (workouts, meals, water, goals).
 * Dev mode persists earned badges to localStorage and shows a celebratory banner when new badges unlock.
 * Ready for backend integration by piping load/saveEarnedBadges to API.
 */
export function AchievementsProvider({ children }) {
  const { sessions } = useContext(WorkoutContext);
  const { meals } = useContext(NutritionContext);
  const { goals } = useContext(GoalsContext);
  const { dailyTotalMl, dailyGoalMl } = useContext(WaterContext);

  const STORAGE_KEY = 'ft_achievements_earned_v1';
  const loadEarned = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, []);
  const saveEarned = useCallback((list) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }, []);

  const [earned, setEarned] = useState(() => loadEarned());
  const prevEarnedRef = useRef(earned);

  // derive progress
  const progress = useMemo(() => {
    const workoutStreakDays = computeWorkoutStreakDays(sessions || []);
    const workoutsThisWeek = (sessions || []).filter(
      (s) => startOfWeekKey(new Date(s.date)) === startOfWeekKey(new Date())
    ).length;

    // meals streak: consecutive days up to today with at least one meal
    const dailyMeals = computeMealDaily(meals || []);
    let mealsStreakDays = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateOnly(d);
      if (dailyMeals.has(key) && dailyMeals.get(key).count > 0) mealsStreakDays += 1;
      else break;
    }

    const waterReachedToday = dailyTotalMl >= Math.max(1, Number(dailyGoalMl) || 2000);

    return { workoutStreakDays, workoutsThisWeek, mealsStreakDays, waterReachedToday };
  }, [sessions, meals, dailyTotalMl, dailyGoalMl]);

  // compute which badges should be earned based on progress/goals
  const shouldHave = useMemo(() => {
    const list = [];

    if (progress.workoutStreakDays >= 3) list.push('streak3');
    if (progress.workoutStreakDays >= 7) list.push('streak7');
    if (progress.workoutStreakDays >= 14) list.push('streak14');

    if (progress.workoutsThisWeek >= 3) list.push('wk3');
    if (progress.workoutsThisWeek >= 5) list.push('wk5');

    if (progress.mealsStreakDays >= 7) list.push('meal7');

    // nutrition: any day >= 2000 calories — check today first, else any day in last 14 days
    const daily = computeMealDaily(meals || []);
    const todayKey = toDateOnly(new Date());
    const caloricToday = daily.get(todayKey)?.calories || 0;
    const caloricAnyRecent = (() => {
      let ok = caloricToday >= 2000;
      if (ok) return true;
      const now = new Date();
      for (let i = 1; i <= 14; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = toDateOnly(d);
        if ((daily.get(key)?.calories || 0) >= 2000) return true;
      }
      return false;
    })();
    if (caloricAnyRecent) list.push('macro2000');

    // hydration
    if (progress.waterReachedToday) list.push('water2l');

    // goal: weekly workouts met
    if (goals?.workoutsPerWeek != null && progress.workoutsThisWeek >= Number(goals.workoutsPerWeek)) {
      list.push('goal-met');
    }

    // dedupe
    return Array.from(new Set(list));
  }, [progress, meals, goals]);

  // update earned + compute new unlocks
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  useEffect(() => {
    const prev = new Set(earned);
    const next = Array.from(new Set([...earned, ...shouldHave]));
    setEarned(next);
    saveEarned(next);

    // compute newly unlocked relative to previous snapshot
    const unlocked = next.filter((id) => !prev.has(id));
    // avoid firing on first mount if previous was empty but shouldHave non-empty
    const firstRender = prevEarnedRef.current === null;
    if (!firstRender && unlocked.length) {
      setNewlyUnlocked(unlocked);
    } else if (prevEarnedRef.current && unlocked.length) {
      setNewlyUnlocked(unlocked);
    }
    prevEarnedRef.current = new Set(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldHave]); // recalc when conditions change

  const markCelebrationsSeen = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const badges = useMemo(() => {
    const lookup = new Map(BADGE_DEFS.map((b) => [b.id, b]));
    return earned
      .map((id) => lookup.get(id))
      .filter(Boolean)
      .sort((a, b) => (a.type === b.type ? (a.tier || 0) - (b.tier || 0) : a.type.localeCompare(b.type)));
  }, [earned]);

  const value = useMemo(
    () => ({
      badges,
      newlyUnlocked,
      progress,
      markCelebrationsSeen,
      // extras exposed for future backend: earned ids, all defs
      _earnedIds: earned,
      _badgeDefs: BADGE_DEFS,
    }),
    [badges, newlyUnlocked, progress, markCelebrationsSeen, earned]
  );

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
}
