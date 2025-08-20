import React, { useContext, useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, AuthContext } from './auth/AuthContext';
import { createAuthApi } from './auth/api';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WorkoutsPage from './pages/WorkoutsPage';
import { WorkoutProvider, WorkoutContext } from './workouts/WorkoutContext';
import { NutritionProvider, NutritionContext } from './nutrition/NutritionContext';
import NutritionPage from './pages/NutritionPage';
import GoalsPage from './pages/GoalsPage';
import { GoalsProvider, GoalsContext } from './goals/GoalsContext';
import ProgressDashboardPage from './pages/ProgressDashboardPage';
import RemindersPage from './pages/RemindersPage';
import { RemindersProvider, RemindersContext } from './reminders/RemindersContext';
import WaterPage from './pages/WaterPage';
import { WaterProvider, WaterContext } from './water/WaterContext';
import { AchievementsProvider } from './achievements/AchievementsContext';
import AchievementsPage from './pages/AchievementsPage';
import CalendarPage from './pages/CalendarPage';
import SharingPage from './pages/SharingPage';
import ThemeToggle from './theme/ThemeToggle';
import SyncService from './sync/SyncService';

// A component that wires SyncService to contexts when authenticated
function SyncBridge() {
  const { token, isAuthenticated } = useContext(AuthContext);
  const workoutCtx = useContext(WorkoutContext);
  const nutritionCtx = useContext(NutritionContext);
  const goalsCtx = useContext(GoalsContext);
  const waterCtx = useContext(WaterContext);
  // Reminders may be local-only but we still accept snapshots if backend provides them
  const remindersCtx = useContext(RemindersContext);

  const sync = useMemo(
    () =>
      new SyncService({
        getToken: () => token,
        onError: (e) => console.warn('Sync warning:', e?.message || e),
        pollIntervalMs: 30000,
      }),
    [token]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      sync.stop();
      return;
    }

    // Register merge handlers
    const unsubscribers = [];

    // Workouts: snapshot replaces state, upsert merges by id, delete removes
    unsubscribers.push(
      sync.registerHandler('workouts', (msg) => {
        const type = msg?.type;
        const data = msg?.data;
        if (!type) return;
        if (type === 'snapshot' && Array.isArray(data)) {
          // Replace local list with server snapshot
          workoutCtx?.listSessions?.().catch(() => {}); // ensure latest via API if listSessions uses backend; in dev, this just refreshes.
          // Also set directly if method exists
          if (Array.isArray(data) && workoutCtx?.sessions != null) {
            // naive reconciliation: replace via setter if available; otherwise trigger list
            // contexts don't expose setter; call listSessions to refresh from API
          }
        } else if (type === 'upsert' && data) {
          // Try to update if exists else prepend; contexts only expose actions via API; safest is to refetch
          workoutCtx?.listSessions?.().catch(() => {});
        } else if (type === 'delete' && data?.id) {
          workoutCtx?.listSessions?.().catch(() => {});
        }
      })
    );

    // Nutrition
    unsubscribers.push(
      sync.registerHandler('nutrition', (msg) => {
        const { type } = msg || {};
        if (type === 'snapshot') {
          nutritionCtx?.listMeals?.().catch(() => {});
        } else {
          nutritionCtx?.listMeals?.().catch(() => {});
        }
      })
    );

    // Water
    unsubscribers.push(
      sync.registerHandler('water', (msg) => {
        const { type } = msg || {};
        if (type === 'snapshot') {
          waterCtx?.listLogs?.().catch(() => {});
        } else {
          waterCtx?.listLogs?.().catch(() => {});
        }
      })
    );

    // Goals
    unsubscribers.push(
      sync.registerHandler('goals', (msg) => {
        const { type } = msg || {};
        if (type === 'snapshot' || type === 'upsert') {
          goalsCtx?.fetchGoals?.().catch(() => {});
        }
      })
    );

    // Reminders (optional backend)
    if (remindersCtx?.listReminders) {
      unsubscribers.push(
        sync.registerHandler('reminders', () => {
          remindersCtx.listReminders().catch(() => {});
        })
      );
    }

    // Start sync
    sync.start();

    return () => {
      unsubscribers.forEach((off) => {
        try {
          off();
        } catch {}
      });
      sync.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sync]);

  return null;
}

// PUBLIC_INTERFACE
function App() {
  const api = createAuthApi();

  return (
    <div className="App">
      <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span role="img" aria-label="FitTrack">🏃‍♂️</span>
          <strong>FitTrack</strong>
        </div>
        <ThemeToggle />
      </header>

      <AuthProvider api={api}>
        <WorkoutProvider>
          <NutritionProvider>
            <GoalsProvider>
              <RemindersProvider>
                <WaterProvider>
                  <AchievementsProvider>
                    {/* SyncBridge sits under providers so it can call their actions */}
                    <SyncBridge />
                    <BrowserRouter>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <HomePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <ProgressDashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/achievements"
                          element={
                            <ProtectedRoute>
                              <AchievementsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workouts"
                          element={
                            <ProtectedRoute>
                              <WorkoutsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/nutrition"
                          element={
                            <ProtectedRoute>
                              <NutritionPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/goals"
                          element={
                            <ProtectedRoute>
                              <GoalsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/reminders"
                          element={
                            <ProtectedRoute>
                              <RemindersPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/water"
                          element={
                            <ProtectedRoute>
                              <WaterPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <ProtectedRoute>
                              <CalendarPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/share"
                          element={
                            <ProtectedRoute>
                              <SharingPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                      </Routes>
                    </BrowserRouter>
                  </AchievementsProvider>
                </WaterProvider>
              </RemindersProvider>
            </GoalsProvider>
          </NutritionProvider>
        </WorkoutProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
