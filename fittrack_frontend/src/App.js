import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './auth/AuthContext';
import { createAuthApi } from './auth/api';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WorkoutsPage from './pages/WorkoutsPage';
import { WorkoutProvider } from './workouts/WorkoutContext';
import { NutritionProvider } from './nutrition/NutritionContext';
import NutritionPage from './pages/NutritionPage';
import GoalsPage from './pages/GoalsPage';
import { GoalsProvider } from './goals/GoalsContext';
import ProgressDashboardPage from './pages/ProgressDashboardPage';
import RemindersPage from './pages/RemindersPage';
import { RemindersProvider } from './reminders/RemindersContext';
import WaterPage from './pages/WaterPage';
import { WaterProvider } from './water/WaterContext';
import { AchievementsProvider } from './achievements/AchievementsContext';
import AchievementsPage from './pages/AchievementsPage';
import CalendarPage from './pages/CalendarPage';
import SharingPage from './pages/SharingPage';
import ThemeToggle from './theme/ThemeToggle';

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
