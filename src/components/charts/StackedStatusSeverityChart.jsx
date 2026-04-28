const CHART_SERIES = [
  { key: "critical", label: "Critical", color: "#ef4444" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "low", label: "Low", color: "#22c55e" },
  { key: "unknown", label: "Unknown", color: "#64748b" },
];

const CHART_HEIGHT = 180;

export const StackedStatusSeverityChart = ({ rows }) => {
  const maxTotal = rows.reduce(
    (highest, row) => Math.max(highest, row.total),
    0,
  );
  const safeMaxTotal = maxTotal > 0 ? maxTotal : 1;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-end gap-1 overflow-x-auto pb-2">
        {rows.map((row) => (
          <div key={row.status} className="min-w-[64px] flex-1">
            <div
              className="mx-auto flex w-8 flex-col-reverse overflow-hidden rounded-md bg-slate-100"
              style={{ height: `${CHART_HEIGHT}px` }}
              aria-label={`${row.status}: ${row.total} risks`}
            >
              {CHART_SERIES.map((series) => {
                const value = row[series.key];
                const segmentHeight = (value / safeMaxTotal) * CHART_HEIGHT;

                if (value === 0) {
                  return null;
                }

                return (
                  <div
                    key={series.key}
                    style={{
                      height: `${segmentHeight}px`,
                      backgroundColor: series.color,
                    }}
                    title={`${series.label}: ${value}`}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <p className="text-[11px] font-medium text-slate-700">
                {row.status}
              </p>
              <p className="text-xs text-slate-500">{row.total}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700">
        {CHART_SERIES.map((series) => (
          <div key={series.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            <span>{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
