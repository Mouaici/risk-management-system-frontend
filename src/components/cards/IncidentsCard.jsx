import { CardContainer } from "./CardContainer.jsx";
import { IncidentStatusBarChart } from "../charts/IncidentStatusBarChart.jsx";

export const IncidentsCard = ({ summary }) => {
  const safeSummary = summary || {
    total: 0,
    highSeverityTotal: 0,
    statusRows: [],
  };
  const openHighSeverity =
    safeSummary.statusRows.find((row) => row.status === "Open")
      ?.highSeverityCount || 0;

  return (
    <CardContainer
      title="Incidents"
      description="Incident status distribution with high severity visibility"
    >
      {safeSummary.total === 0 ? (
        <p className="text-sm text-slate-500">No incidents found.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Incident status
            </p>
            <IncidentStatusBarChart rows={safeSummary.statusRows} />
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              High severity incidents
            </p>
            <p className="mt-1 text-2xl font-semibold text-red-900">
              {safeSummary.highSeverityTotal}
            </p>
            <p className="mt-1 text-xs text-red-700">
              Open high severity incidents: {openHighSeverity}
            </p>
          </div>
        </div>
      )}
    </CardContainer>
  );
};
