import React, { useContext, useMemo } from 'react';
import { WorkoutContext } from '../workouts/WorkoutContext';
import { NutritionContext } from '../nutrition/NutritionContext';
import { GoalsContext } from '../goals/GoalsContext';
import { AchievementsWidget, CaloriesTrendWidget, MacrosSplitWidget, WorkoutDurationWidget, WorkoutVolumeWidget } from '../dashboard/components/widgets';
import { AchievementsContext } from '../achievements/AchievementsContext';
import AchievementCelebration from '../achievements/components/AchievementCelebration';

/**
 * PUBLIC_INTERFACE
 * ProgressDashboardPage displays aggregated workout/nutrition progress with charts and statistics.
 * It is built with modular widgets to support future additions.
 */
export default function ProgressDashboardPage() {
  const { sessions, loading: wl } = useContext(WorkoutContext);
  const { meals, loading: nl } = useContext(NutritionContext);
  const { goals } = useContext(GoalsContext);
  const { badges, newlyUnlocked, markCelebrationsSeen, progress } = useContext(AchievementsContext);

  const wSessions = useMemo(() => sessions || [], [sessions]);
  const nMeals = useMemo(() => meals || [], [meals]);

  return (
    <div className="auth-container" style={{ maxWidth: 980 }}>
      <h1>Progress Dashboard</h1>
      <h2 style={{ marginBottom: 8 }}>Your recent trends and stats</h2>
      {(wl || nl) && <div className="card" style={{ marginBottom: 12 }}>Loading data…</div>}
      {/* Celebration banner for new achievements */}
      <AchievementCelebration
        badges={badges.filter((b) => newlyUnlocked.includes(b.id))}
        onClose={markCelebrationsSeen}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
        }}
      >
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <WorkoutVolumeWidget sessions={wSessions} />
          <WorkoutDurationWidget sessions={wSessions} />
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <CaloriesTrendWidget meals={nMeals} />
          <MacrosSplitWidget meals={nMeals} />
        </div>

        {/* Row 3 */}
        <AchievementsWidget sessions={wSessions} meals={nMeals} goals={goals} />
      </div>

      {/* Responsive enhancements */}
      <style>{`
        @media (min-width: 760px) {
          .dashboard-grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
