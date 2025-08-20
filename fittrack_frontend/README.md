# FitTrack Frontend

This is the React-based frontend for FitTrack. It now includes initial User Authentication (signup, login, logout, password reset) UI and flows ready to connect to backend APIs.

## Auth Setup

- Configure environment variables in `.env` (see `.env.example`):
  - `REACT_APP_API_BASE_URL` — base URL of your backend (leave empty to use dev-mode mock responses).
  - `REACT_APP_SITE_URL` — public site URL used for password reset redirect links (default http://localhost:3000).

## Auth Routes

- `/login` — user login
- `/signup` — create a new account
- `/forgot-password` — request reset link
- `/reset-password?token=...` — complete password reset
- `/` — protected home page (example), redirects to login if not authenticated

## Workout Logging

- `/workouts` — manage workout sessions (add, edit, delete)
- The frontend includes a WorkoutContext and a dev-mode in-memory API (disabled when `REACT_APP_API_BASE_URL` is provided).
- To connect to a backend, implement `/workouts` REST endpoints:
  - GET `/workouts` — list sessions
  - POST `/workouts` — add session (expects: { date, exerciseType, reps, sets, durationMinutes, notes })
  - PUT `/workouts/{id}` — update session
  - DELETE `/workouts/{id}` — delete session

## Notes

- The `src/auth/api.js` file contains endpoint placeholders. Replace the paths with your backend endpoints and remove the mock responses by providing `REACT_APP_API_BASE_URL`.
- Auth state is provided via `AuthContext`. Use it to guard routes and access `user`, `isAuthenticated`, and actions (`login`, `signup`, `logout`, etc.).
- Styling is minimal and extends `src/App.css`.

# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
