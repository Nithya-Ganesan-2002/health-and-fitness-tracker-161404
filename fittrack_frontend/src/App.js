import React, { useEffect, useState } from 'react';
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

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const api = createAuthApi();

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <AuthProvider api={api}>
        <WorkoutProvider>
          <NutritionProvider>
            <GoalsProvider>
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
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ProgressDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>
              </BrowserRouter>
            </GoalsProvider>
          </NutritionProvider>
        </WorkoutProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
