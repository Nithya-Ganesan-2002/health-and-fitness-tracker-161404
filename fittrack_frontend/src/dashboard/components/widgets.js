import React from 'react';
import { BarChart, Card, DonutChart, LineChart } from '../components/ChartPrimitives';
import { aggregateMealsByDay, aggregateMacros, aggregateWorkoutsByDay, aggregateWorkoutDurationByDay, computeAchievements } from '../utils/aggregations';

// PUBLIC_INTERFACE
export function WorkoutVolumeWidget({ sessions }) {
  const bar = aggregateWorkoutsByDay(sessions, 7);
  return (
    <Card title="Workouts (7d)" subtitle="Sessions per day">
      <BarChart data={bar} height={140} />
    </Card>
  );
}

// PUBLIC_INTERFACE
export function WorkoutDurationWidget({ sessions }) {
  const line = aggregateWorkoutDurationByDay(sessions, 7);
  return (
    <Card title="Workout Duration (7d)" subtitle="Minutes per day">
      <LineChart points={line} height={140} />
    </Card>
  );
}

// PUBLIC_INTERFACE
export function CaloriesTrendWidget({ meals }) {
  const line = aggregateMealsByDay(meals, 7);
  return (
    <Card title="Calories (7d)" subtitle="Total daily calories">
      <LineChart points={line} height={140} color="#1976D2" />
    </Card>
  );
}

// PUBLIC_INTERFACE
export function MacrosSplitWidget({ meals }) {
  const t = aggregateMacros(meals);
  const items = [
    { label: 'Protein (g)', value: t.protein, color: '#43A047' },
    { label: 'Carbs (g)', value: t.carbs, color: '#1976D2' },
    { label: 'Fats (g)', value: t.fats, color: '#FFB300' },
  ];
  return (
    <Card title="Macros Split" subtitle="Total grams across all meals">
      <DonutChart items={items} size={180} />
    </Card>
  );
}

// PUBLIC_INTERFACE
export function AchievementsWidget({ sessions, meals, goals }) {
  const { badges, hints, workoutsThisWeek, workoutStreakDays } = computeAchievements({ sessions, meals, goals });

  return (
    <Card
      title="Achievements"
      subtitle={`Streak: ${workoutStreakDays} day(s) • This week: ${workoutsThisWeek} workout(s)`}
      right={<span style={{ fontSize: 12, color: '#666' }}>{badges.length} badge(s)</span>}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {badges.length ? (
          badges.map((b) => (
            <div key={b.id} className="card" style={{ padding: '8px 10px', borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{b.name}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{b.desc}</div>
            </div>
          ))
        ) : (
          <div style={{ color: '#666' }}>No badges yet. Keep going!</div>
        )}
      </div>
      {hints?.length ? (
        <div style={{ marginTop: 10, color: '#555', fontSize: 13 }}>
          {hints.map((h, idx) => (
            <div key={idx}>• {h}</div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
