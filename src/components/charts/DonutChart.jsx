const CHART_SIZE = 120;
const STROKE_WIDTH = 16;
const CENTER = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const DonutChart = ({ segments, total, centerLabel }) => {
  const safeTotal = total > 0 ? total : 0;
  const visibleSegments = segments.filter((segment) => segment.value > 0);

  let accumulated = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[120px] w-[120px]">
        <svg
          width={CHART_SIZE}
          height={CHART_SIZE}
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE_WIDTH}
          />
          {safeTotal > 0
            ? visibleSegments.map((segment) => {
                const segmentLength =
                  (segment.value / safeTotal) * CIRCUMFERENCE;
                const dashArray = `${segmentLength} ${
                  CIRCUMFERENCE - segmentLength
                }`;
                const dashOffset = -accumulated;
                accumulated += segmentLength;

                return (
                  <circle
                    key={segment.label}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })
            : null}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">
            {safeTotal}
          </span>
          <span className="text-xs text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="space-y-1 text-xs text-slate-700">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            <span>{segment.label}</span>
            <span className="font-semibold text-slate-900">
              {segment.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
