import type { RubricVerdict, RubricZone } from '@/types/interviewReport';

const ZONE_COLORS: Record<RubricZone, string> = {
  no_hire: '#EF4444',
  human_review: '#F97316',
  hire: '#22C55E',
  strong_hire: '#0D9488',
};

const ZONE_BG: Record<RubricZone, string> = {
  no_hire: '#FEE2E2',
  human_review: '#FFEDD5',
  hire: '#DCFCE7',
  strong_hire: '#CCFBF1',
};

interface Props {
  verdict: RubricVerdict;
}

export const ScoreZoneBar = ({ verdict }: Props) => {
  const { score, passing_score, strong_hire_score, human_review_min, human_review_max, zone } = verdict;

  // Zone boundaries: 0 → human_review_min → human_review_max+1 → passing_score → strong_hire_score → 100
  // no_hire: 0 to human_review_min
  // human_review: human_review_min to human_review_max+1 (i.e. passing_score)
  // hire: passing_score to strong_hire_score
  // strong_hire: strong_hire_score to 100

  const noHireEnd = human_review_min;
  const humanReviewEnd = human_review_max + 1;
  const hireEnd = strong_hire_score;
  const strongHireEnd = 100;

  const zones = [
    { label: 'No Hire', start: 0, end: noHireEnd, zone: 'no_hire' as RubricZone },
    { label: 'Human Review', start: noHireEnd, end: humanReviewEnd, zone: 'human_review' as RubricZone },
    { label: 'Hire', start: humanReviewEnd, end: hireEnd, zone: 'hire' as RubricZone },
    { label: 'Strong Hire', start: hireEnd, end: strongHireEnd, zone: 'strong_hire' as RubricZone },
  ];

  const scorePct = (score / 100) * 100;
  const markerColor = ZONE_COLORS[zone];

  return (
    <div className="flex flex-col gap-3">
      {/* Zone bar */}
      <div className="relative h-10 rounded-lg overflow-hidden flex">
        {zones.map((z) => {
          const widthPct = ((z.end - z.start) / 100) * 100;
          const isActive = z.zone === zone;
          return (
            <div
              key={z.zone}
              style={{
                width: `${widthPct}%`,
                backgroundColor: isActive ? ZONE_BG[z.zone] : '#F8FAFC',
                borderTop: `2px solid ${isActive ? ZONE_COLORS[z.zone] : '#E2E8F0'}`,
                borderBottom: `2px solid ${isActive ? ZONE_COLORS[z.zone] : '#E2E8F0'}`,
              }}
              className="flex items-center justify-center transition-all"
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wide truncate px-1"
                style={{ color: isActive ? ZONE_COLORS[z.zone] : '#94A3B8' }}
              >
                {z.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Score marker */}
      <div className="relative h-8">
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${scorePct}%`, transition: 'left 0.8s ease-in-out' }}
        >
          <div
            className="h-0 w-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `8px solid ${markerColor}`,
            }}
          />
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white mt-0.5"
            style={{ backgroundColor: markerColor }}
          >
            {score}
          </div>
        </div>
      </div>

      {/* Threshold labels */}
      <div className="relative h-4">
        {[human_review_min, human_review_max + 1, passing_score, strong_hire_score].map((val, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 text-[10px] text-slate-400 font-mono"
            style={{ left: `${val}%` }}
          >
            {val}
          </div>
        ))}
        <div className="absolute left-0 text-[10px] text-slate-400 font-mono">0</div>
        <div className="absolute right-0 text-[10px] text-slate-400 font-mono">100</div>
      </div>
    </div>
  );
};
