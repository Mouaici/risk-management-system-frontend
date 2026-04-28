import { CardContainer } from "./CardContainer.jsx";
import { DonutChart } from "../charts/DonutChart.jsx";
import { StackedStatusSeverityChart } from "../charts/StackedStatusSeverityChart.jsx";

const statTiles = (summary) => [
  {
    label: "Open risks",
    value: summary.open,
    classes: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    label: "Critical risks",
    value: summary.critical,
    classes: "border-red-200 bg-red-50 text-red-700",
  },
  {
    label: "In progress",
    value: summary.inProgress,
    classes: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    label: "No score yet",
    value: summary.unknown,
    classes: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

export const UrgentRisksCard = ({ summary, statusRows }) => {
  const safeStatusRows = Array.isArray(statusRows) ? statusRows : [];
  const statusWithMostCritical = [...safeStatusRows].sort(
    (left, right) => right.critical - left.critical,
  )[0];
  const criticalInsight =
    statusWithMostCritical && statusWithMostCritical.critical > 0
      ? `${statusWithMostCritical.critical} critical risks are currently in ${statusWithMostCritical.status}.`
      : "No critical risks currently registered.";

  const donutSegments = [
    { label: "Critical", value: summary.critical, color: "#ef4444" },
    { label: "Medium", value: summary.suggestedAction, color: "#f59e0b" },
    {
      label: "Low",
      value: summary.underObservation,
      color: "#22c55e",
    },
    { label: "Unknown", value: summary.unknown, color: "#64748b" },
  ];

  return (
    <CardContainer
      title="Risk overview"
      description="Risk status by severity with a quick criticality snapshot"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {statTiles(summary).map((tile) => (
            <article
              key={tile.label}
              className={`rounded-lg border p-2 ${tile.classes}`}
            >
              <p className="text-xs font-medium">{tile.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {tile.value}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-900">
            Risk status by severity
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Status flow and severity mix shown together.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <StackedStatusSeverityChart rows={safeStatusRows} />
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">
                Severity composition
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Portfolio mix by severity level.
              </p>
              <div className="mt-3 flex justify-center">
                <DonutChart
                  segments={donutSegments}
                  total={summary.total}
                  centerLabel="Total risks"
                  showPercentages
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600">{criticalInsight}</p>
        </div>
      </div>
    </CardContainer>
  );
};
