import React from 'react';
import { buildMonthGrid, toDateOnly, weekdayShort } from '../utils';

/**
 * PUBLIC_INTERFACE
 * CalendarGrid renders a month grid with navigation controls and per-day content.
 * Props:
 * - year: number
 * - month: number (0-11)
 * - onPrevMonth: () => void
 * - onNextMonth: () => void
 * - renderDayExtras?: (date: Date) => ReactNode   // used to show counts/markers
 * - onSelectDay?: (date: Date) => void
 */
export default function CalendarGrid({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  renderDayExtras,
  onSelectDay,
}) {
  const grid = React.useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayKey = toDateOnly(new Date());

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button className="btn" type="button" onClick={onPrevMonth} aria-label="Previous month" style={{ background: '#6c757d' }}>
          ‹
        </button>
        <div style={{ fontWeight: 700 }}>{monthLabel}</div>
        <button className="btn" type="button" onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {weekdayShort().map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, color: '#666' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {grid.flat().map((date, idx) => {
          const inMonth = date.getMonth() === month;
          const key = toDateOnly(date);
          const isToday = key === todayKey;

          return (
            <button
              key={key + idx}
              type="button"
              onClick={() => onSelectDay && onSelectDay(date)}
              className="card"
              style={{
                textAlign: 'left',
                padding: 8,
                opacity: inMonth ? 1 : 0.5,
                borderColor: isToday ? '#1976D2' : 'var(--border-color)',
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700 }}>{date.getDate()}</span>
              </div>
              {renderDayExtras ? (
                <div style={{ marginTop: 6 }}>
                  {renderDayExtras(date)}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
