import { CardContainer } from "./CardContainer.jsx";
import { formatDate } from "../../utils/date.js";

export const IncidentsCard = ({ incidents }) => {
  return (
    <CardContainer
      title="Incidents"
      description="Most recently occurred incidents"
    >
      {incidents.length === 0 ? (
        <p className="text-sm text-slate-500">No incidents found.</p>
      ) : (
        <ul className="space-y-3">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="rounded-lg border border-slate-200 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{incident.title}</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {incident.incidentStatus || "Status unknown"}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>Severity: {incident.severity || "—"}</p>
                <p>
                  Date: {formatDate(incident.occuredOn || incident.updatedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContainer>
  );
};
