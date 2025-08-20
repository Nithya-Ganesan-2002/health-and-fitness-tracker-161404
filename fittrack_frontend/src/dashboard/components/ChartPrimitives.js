import React from 'react';

/**
 * Lightweight, dependency-free chart primitives (Bar, Line, Donut) using SVG.
 * These are intentionally simple and styled via props to keep bundle light.
 */

// PUBLIC_INTERFACE
export function Card({ title, subtitle, right, children }) {
  /** Simple card wrapper */
  return (
    <div className="card" style={{ padding: 16, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          {title && <div style={{ fontWeight: 700 }}>{title}</div>}
          {subtitle && <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * BarChart renders a simple vertical bar chart.
 * props:
 * - data: [{ label, value }]
 * - height: number (px)
 * - color: string
 */
export function BarChart({ data = [], height = 120, color = '#1976D2', background = 'rgba(25,118,210,0.15)' }) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const width = Math.max(220, data.length * 36);
  const padding = 20;
  const chartHeight = height - padding * 2;
  const barWidth = 20;
  const gap = 16;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} role="img" aria-label="Bar chart">
        {/* background grid line */}
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#ddd" />
        {data.map((d, i) => {
          const h = (chartHeight * (d.value || 0)) / max;
          const x = padding + i * (barWidth + gap);
          const y = height - padding - h;
          return (
            <g key={d.label + i}>
              <rect x={x} y={y} width={barWidth} height={h} fill={background} />
              <rect x={x} y={y + h * 0.2} width={barWidth} height={h * 0.8} fill={color} rx="4" />
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="#666">
                {d.label}
              </text>
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#333">
                {d.value || 0}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * LineChart renders a small line chart.
 * props:
 * - points: [{ label, value }]
 * - height: number (px)
 * - color: string
 */
export function LineChart({ points = [], height = 120, color = '#43A047' }) {
  const max = Math.max(1, ...points.map((p) => p.value || 0));
  const width = Math.max(220, points.length * 36);
  const padding = 24;
  const chartHeight = height - padding * 2;
  const step = (width - padding * 2) / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => {
    const x = padding + i * step;
    const y = height - padding - (chartHeight * (p.value || 0)) / max;
    return [x, y];
  });

  const pathD =
    coords.length > 1
      ? coords.reduce((acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`), '')
      : '';

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} role="img" aria-label="Line chart">
        {/* baseline */}
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#ddd" />
        {/* area fill */}
        {coords.length > 1 && (
          <path
            d={`${pathD} L ${padding + (coords.length - 1) * step} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="rgba(67,160,71,0.15)"
          />
        )}
        {/* line */}
        {coords.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />}
        {/* points and labels */}
        {coords.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={color} />
            <text x={x} y={y - 6} textAnchor="middle" fontSize="10" fill="#333">
              {points[i].value || 0}
            </text>
            <text x={x} y={height - 6} textAnchor="middle" fontSize="10" fill="#666">
              {points[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * DonutChart renders a simple donut chart for proportions.
 * props:
 * - items: [{ label, value, color? }]
 * - size: number (px)
 */
export function DonutChart({ items = [], size = 160 }) {
  const total = items.reduce((acc, it) => acc + (Number(it.value) || 0), 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  let startAngle = -Math.PI / 2;

  const arcs = items.map((it, idx) => {
    const fraction = (Number(it.value) || 0) / total;
    const angle = fraction * Math.PI * 2;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z`;
    startAngle = endAngle;
    const color = it.color || ['#1976D2', '#43A047', '#FFB300', '#8E24AA', '#E91E63'][idx % 5];

    return { path, color, label: it.label, value: it.value, fraction };
  });

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} role="img" aria-label="Donut chart">
        <circle cx={cx} cy={cy} r={r} fill="var(--bg-secondary)" stroke="var(--border-color)" strokeWidth="1" />
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} opacity="0.9" />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg-primary)" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="var(--text-primary)">
          {total}
        </text>
      </svg>
      <div style={{ display: 'grid', gap: 6 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, background: a.color, display: 'inline-block', borderRadius: 2 }} />
            <span style={{ color: '#333' }}>{a.label}</span>
            <span style={{ color: '#666' }}>— {a.value} ({Math.round(a.fraction * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
