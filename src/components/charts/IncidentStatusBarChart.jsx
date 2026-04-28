const CHART_HEIGHT = 132;

const STATUS_COLORS = {
  Open: "#f59e0b",
  "In progress": "#3b82f6",
  Closed: "#10b981",
};

export const IncidentStatusBarChart = ({ rows }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const maxCount = safeRows.reduce(
    (highest, row) => Math.max(highest, row.count),
    0,
  );
  const safeMaxCount = maxCount > 0 ? maxCount : 1;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-end gap-3">
        {safeRows.map((row) => {
          const barHeight = (row.count / safeMaxCount) * CHART_HEIGHT;
          const barColor = STATUS_COLORS[row.status] || "#64748b";

          return (
            <div key={row.status} className="flex-1">
              <div
                className="mx-auto flex w-10 items-end overflow-hidden rounded-md bg-slate-100"
                style={{ height: `${CHART_HEIGHT}px` }}
                aria-label={`${row.status}: ${row.count} incidents`}
              >
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: barColor,
                  }}
                  title={`${row.status}: ${row.count}`}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[11px] font-medium text-slate-700">
                  {row.status}
                </p>
                <p className="text-xs text-slate-500">{row.count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
