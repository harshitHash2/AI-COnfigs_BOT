interface SkillRadarProps {
  skills: Record<string, number>;
  size?: number;
}

export const SkillRadar = ({ skills, size = 280 }: SkillRadarProps) => {
  const entries = Object.entries(skills);
  const n = entries.length;
  const center = size / 2;
  const maxRadius = size / 2 - 50;
  const angleStep = (2 * Math.PI) / n;

  const pointFor = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const labelPoint = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = maxRadius + 28;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = entries.map(([key, val], i) => pointFor(i, val));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#059669';
    if (score >= 70) return '#22C55E';
    if (score >= 55) return '#F97316';
    return '#EF4444';
  };

  const avgScore = entries.reduce((s, [, v]) => s + v, 0) / n;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Grid */}
        {gridLevels.map((level, gi) => {
          const r = maxRadius * level;
          const points = entries
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={gi}
              points={points}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={1}
              strokeDasharray={gi === gridLevels.length - 1 ? '0' : '3 3'}
            />
          );
        })}
        {/* Axes */}
        {entries.map(([key], i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={key}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(15, 23, 42, 0.08)"
          stroke="#0F172A"
          strokeWidth={2}
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={getScoreColor(entries[i][1])}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}
        {/* Labels */}
        {entries.map(([key, val], i) => {
          const lp = labelPoint(i);
          const anchor =
            lp.x < center - 10 ? 'end' : lp.x > center + 10 ? 'start' : 'middle';
          return (
            <text
              key={key}
              x={lp.x}
              y={lp.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="text-[10px] font-medium fill-slate-600"
            >
              {key}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 flex-wrap justify-center">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getScoreColor(val) }}
            />
            <span className="text-xs text-slate-500">{key}</span>
            <span className="text-xs font-semibold text-slate-700">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
