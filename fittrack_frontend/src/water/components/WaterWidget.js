import React, { useContext, useMemo, useState } from 'react';
import { WaterContext } from '../WaterContext';
import { Card } from '../../dashboard/components/ChartPrimitives';

/**
 * PUBLIC_INTERFACE
 * WaterWidget shows today's progress and quick add buttons.
 * Props: none (uses WaterContext)
 */
export default function WaterWidget() {
  const { dailyTotalMl, dailyGoalMl, quickAdd, setDailyGoal } = useContext(WaterContext);
  const [custom, setCustom] = useState('');

  const pct = useMemo(() => Math.min(100, Math.round((dailyTotalMl / Math.max(1, dailyGoalMl)) * 100)), [dailyTotalMl, dailyGoalMl]);

  const add = async (ml) => {
    await quickAdd(ml);
    setCustom('');
  };

  const onGoalChange = (e) => {
    setDailyGoal(e.target.value);
  };

  // Simple circular progress
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Card
      title="Hydration"
      subtitle={`Today: ${dailyTotalMl} / ${dailyGoalMl} ml`}
      right={
        <div style={{ fontSize: 12, color: '#666' }}>
          Goal:{' '}
          <input
            aria-label="Daily water goal in ml"
            type="number"
            min="100"
            step="50"
            value={dailyGoalMl}
            onChange={onGoalChange}
            style={{ width: 90, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />{' '}
          ml
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width={size} height={size} role="img" aria-label="Water progress">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border-color)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--text-secondary)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fill="var(--text-primary)">{pct}%</text>
        </svg>

        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="button" onClick={() => add(250)}>+250 ml</button>
            <button className="btn" type="button" onClick={() => add(500)} style={{ background: '#43A047' }}>+500 ml</button>
            <button className="btn" type="button" onClick={() => add(750)} style={{ background: '#FFB300', color: '#000' }}>+750 ml</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              min="50"
              step="10"
              placeholder="Custom ml"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <button className="btn" type="button" onClick={() => add(Number(custom) || 0)} disabled={!custom}>Add</button>
          </div>
        </div>
      </div>
    </Card>
  );
}
