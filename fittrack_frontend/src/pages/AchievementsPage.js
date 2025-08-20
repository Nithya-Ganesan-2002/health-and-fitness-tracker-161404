import React, { useContext, useMemo } from 'react';
import { AchievementsContext } from '../achievements/AchievementsContext';
import BadgesGrid from '../achievements/components/BadgesGrid';

/**
 * PUBLIC_INTERFACE
 * AchievementsPage shows user's earned badges and current progress toward next ones.
 */
export default function AchievementsPage() {
  const { badges, progress } = useContext(AchievementsContext);

  const progressLines = useMemo(() => {
    const parts = [];
    parts.push(`Workout streak: ${progress.workoutStreakDays} day(s)`);
    parts.push(`This week workouts: ${progress.workoutsThisWeek}`);
    parts.push(`Meal logging streak: ${progress.mealsStreakDays} day(s)`);
    parts.push(`Hydration goal reached today: ${progress.waterReachedToday ? 'Yes' : 'No'}`);
    return parts;
  }, [progress]);

  return (
    <div className="auth-container">
      <h1>Achievements & Badges</h1>
      <h2>Gamify your progress and celebrate milestones</h2>

      <div className="card" style={{ marginTop: 8 }}>
        <strong>Current progress</strong>
        <div style={{ marginTop: 6, color: '#555', display: 'grid', gap: 4 }}>
          {progressLines.map((t, i) => (
            <div key={i}>• {t}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: '8px 0' }}>Your badges</h3>
        <BadgesGrid badges={badges} />
      </div>
    </div>
  );
}
