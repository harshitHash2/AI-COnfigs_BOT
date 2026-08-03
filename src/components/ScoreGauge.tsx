interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const getScoreColor = (score: number): string => {
  if (score >= 85) return '#059669';
  if (score >= 70) return '#22C55E';
  if (score >= 55) return '#F97316';
  return '#EF4444';
};

const getScoreLabel = (score: number): string => {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Borderline';
  return 'Below bar';
};

export const ScoreGauge = ({ score, size = 140 }: ScoreGaugeProps) => {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-slate-400 font-medium">/ 100</span>
        <span className="text-[11px] font-medium mt-0.5" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
};
