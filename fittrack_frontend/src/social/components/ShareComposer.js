import React, { useMemo, useState } from 'react';
import { useSharing } from '../SharingContext';
import { exportToCSV, exportToPDF } from '../exportUtils';

/**
 * PUBLIC_INTERFACE
 * ShareComposer
 * A UI to select content (workouts/nutrition within a date range), choose visibility or export type,
 * and create a share entry or export file. Prepares for backend integration.
 */
export default function ShareComposer({ availableWorkouts = [], availableMeals = [], defaultRange }) {
  const { actions } = useSharing();
  const [includeWorkouts, setIncludeWorkouts] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);
  const [visibility, setVisibility] = useState('private'); // private | public
  const [mode, setMode] = useState('feed'); // feed | export
  const [exportFormat, setExportFormat] = useState('csv'); // csv | pdf
  const [dateFrom, setDateFrom] = useState(defaultRange?.from || '');
  const [dateTo, setDateTo] = useState(defaultRange?.to || '');
  const [title, setTitle] = useState('My FitTrack Progress');

  const filteredWorkouts = useMemo(() => {
    return (availableWorkouts || []).filter((w) => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(w.date || w.createdAt || Date.now());
      const afterFrom = dateFrom ? d >= new Date(dateFrom) : true;
      const beforeTo = dateTo ? d <= new Date(dateTo) : true;
      return afterFrom && beforeTo;
    });
  }, [availableWorkouts, dateFrom, dateTo]);

  const filteredMeals = useMemo(() => {
    return (availableMeals || []).filter((m) => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(m.date || m.createdAt || Date.now());
      const afterFrom = dateFrom ? d >= new Date(dateFrom) : true;
      const beforeTo = dateTo ? d <= new Date(dateTo) : true;
      return afterFrom && beforeTo;
    });
  }, [availableMeals, dateFrom, dateTo]);

  const dataSummary = useMemo(() => {
    return {
      workouts: includeWorkouts ? filteredWorkouts : [],
      meals: includeMeals ? filteredMeals : [],
    };
  }, [includeWorkouts, includeMeals, filteredWorkouts, filteredMeals]);

  function handleCreateShare() {
    const newShare = actions.createShare({
      title,
      type: mode,
      content: dataSummary,
      visibility,
      status: mode === 'feed' ? 'published' : 'draft',
      exportFormat: mode === 'export' ? exportFormat : null,
    });

    if (mode === 'export') {
      if (exportFormat === 'csv') {
        const rows = [
          ...dataSummary.workouts.map((w) => ({
            type: 'workout',
            date: w.date,
            exercise: w.exercise || w.name || '',
            duration: w.duration || '',
            calories: w.calories || '',
          })),
          ...dataSummary.meals.map((m) => ({
            type: 'meal',
            date: m.date,
            name: m.name || '',
            calories: m.calories || '',
            protein: m.protein || '',
            carbs: m.carbs || '',
            fat: m.fat || '',
          })),
        ];
        exportToCSV(rows, `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
      } else if (exportFormat === 'pdf') {
        const tableRows = [
          ...dataSummary.workouts.map(
            (w) =>
              `<tr><td>Workout</td><td>${w.date || ''}</td><td>${w.exercise || w.name || ''}</td><td>${w.duration || ''}</td><td>${w.calories || ''}</td></tr>`
          ),
          ...dataSummary.meals.map(
            (m) =>
              `<tr><td>Meal</td><td>${m.date || ''}</td><td>${m.name || ''}</td><td>${m.calories || ''}</td><td>-</td></tr>`
          ),
        ].join('');
        const html = `
          <h1>${title}</h1>
          <table>
            <thead>
              <tr><th>Type</th><th>Date</th><th>Name/Exercise</th><th>Duration</th><th>Calories</th></tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        `;
        exportToPDF(title, html);
      }
    }

    // For now, creation is local only; future: call backend and update with canonical id/url
    return newShare;
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Share your progress</h3>
      <div style={styles.row}>
        <label style={styles.label}>Title</label>
        <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Share title" />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Date From</label>
        <input style={styles.input} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label style={{ ...styles.label, marginLeft: 12 }}>Date To</label>
        <input style={styles.input} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <div style={styles.row}>
        <label><input type="checkbox" checked={includeWorkouts} onChange={() => setIncludeWorkouts(!includeWorkouts)} /> Include Workouts</label>
      </div>
      <div style={styles.row}>
        <label><input type="checkbox" checked={includeMeals} onChange={() => setIncludeMeals(!includeMeals)} /> Include Meals</label>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Mode</label>
        <select style={styles.input} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="feed">Share to Feed (Future)</option>
          <option value="export">Export File</option>
        </select>
        {mode === 'export' && (
          <>
            <label style={{ ...styles.label, marginLeft: 12 }}>Format</label>
            <select style={styles.input} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </>
        )}
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Visibility</label>
        <select style={styles.input} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="private">Private</option>
          <option value="public">Public (Future)</option>
        </select>
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryBtn} onClick={handleCreateShare}>
          {mode === 'export' ? 'Export' : 'Share'}
        </button>
        <span style={styles.hint}>Exports download locally. Feed/public sharing will be available once backend is connected.</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginTop: 16,
  },
  heading: { margin: 0, marginBottom: 12 },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  label: { minWidth: 90, color: '#444', fontSize: 14 },
  input: { padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' },
  primaryBtn: {
    background: '#1976D2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  footer: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 },
  hint: { color: '#666', fontSize: 12 },
};
