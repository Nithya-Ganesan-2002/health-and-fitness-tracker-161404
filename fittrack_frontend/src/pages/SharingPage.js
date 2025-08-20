import React, { useMemo, useContext } from 'react';
import ShareComposer from '../social/components/ShareComposer';
import SharedItemsList from '../social/components/SharedItemsList';
import { SharingProvider } from '../social/SharingContext';
import { WorkoutContext } from '../workouts/WorkoutContext';
import { NutritionContext } from '../nutrition/NutritionContext';

/**
 * PUBLIC_INTERFACE
 * SharingPage
 * Top-level page that allows the user to compose a share/export and manage previously shared items.
 * Data is pulled from workouts and nutrition contexts if available.
 */
export default function SharingPage() {
  const workoutCtx = useContext(WorkoutContext);
  const nutritionCtx = useContext(NutritionContext);

  const workouts = workoutCtx?.sessions || [];
  const meals = nutritionCtx?.meals || [];

  const defaultRange = useMemo(() => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10); // start of month
    return { from, to };
  }, []);

  return (
    <SharingProvider>
      <div style={styles.container}>
        <h2>Social Sharing</h2>
        <p style={styles.subtitle}>Export your progress or prepare posts for the upcoming social feed.</p>
        <ShareComposer availableWorkouts={workouts} availableMeals={meals} defaultRange={defaultRange} />
        <SharedItemsList />
      </div>
    </SharingProvider>
  );
}

const styles = {
  container: { maxWidth: 960, margin: '0 auto', padding: 16 },
  subtitle: { color: '#555', marginTop: -8 },
};
