import { CardContainer } from "./CardContainer.jsx";
import { DonutChart } from "../charts/DonutChart.jsx";

const statTiles = (summary) => [
  {
    label: "Critical risks",
    value: summary.critical,
    classes: "border-red-200 bg-red-50 text-red-700",
  },
  {
    label: "Mitigated risks",
    value: summary.mitigated,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    label: "Open risks",
    value: summary.open,
    classes: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    label: "In progress",
    value: summary.inProgress,
    classes: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
];

const breakdownItems = (summary) => [
  {
    label: "Needs action",
    value: summary.needsAction,
    classes: "bg-red-100 text-red-800",
  },
  {
    label: "Suggested action",
    value: summary.suggestedAction,
    classes: "bg-amber-100 text-amber-800",
  },
  {
    label: "Keep under observation",
    value: summary.underObservation,
    classes: "bg-emerald-100 text-emerald-800",
  },
  {
    label: "No score yet",
    value: summary.unknown,
    classes: "bg-slate-100 text-slate-700",
  },
];

export const UrgentRisksCard = ({ risks, summary }) => {
  const donutSegments = [
    { label: "Critical", value: summary.critical, color: "#ef4444" },
    { label: "Elevated", value: summary.suggestedAction, color: "#f59e0b" },
    {
      label: "Monitored",
      value: summary.underObservation,
      color: "#22c55e",
    },
    { label: "Unknown", value: summary.unknown, color: "#64748b" },
  ];

  return (
    <CardContainer
      title="Risk overview"
      description="Current risk landscape and what needs attention"
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {statTiles(summary).map((tile) => (
            <article
              key={tile.label}
              className={`rounded-lg border p-3 ${tile.classes}`}
            >
              <p className="text-sm font-medium">{tile.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {tile.value}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Needs attention
            </p>
            <ul className="mt-2 space-y-2">
              {breakdownItems(summary).map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-2"
                >
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${item.classes}`}
                  >
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DonutChart
            segments={donutSegments}
            total={summary.total}
            centerLabel="Total risks"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">
            Highest severity risks
          </p>
          {risks.length === 0 ? (
            <p className="text-sm text-slate-500">No risks found.</p>
          ) : (
            <ul className="space-y-3">
              {risks.map((risk) => (
                <li
                  key={risk.id}
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{risk.title}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${risk.band.classes}`}
                    >
                      {risk.band.label} - {risk.band.actionLabel}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>Score: {risk.severityScore ?? "—"}</p>
                    <p>Status: {risk.status || "Unknown"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
