import { CardContainer } from "./CardContainer.jsx";

export const UrgentRisksCard = ({ risks }) => {
  return (
    <CardContainer
      title="Most severe / urgent risks"
      description="Top risks ranked by latest assessment score"
    >
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
                  {risk.band.label}: {risk.band.actionLabel}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>Score: {risk.severityScore ?? "—"}</p>
                <p>Status: {risk.status || "Unknown"}</p>
                <p>Owner user id: {risk.ownerUserId ?? "—"}</p>
                <p>Asset id: {risk.assetId ?? "—"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContainer>
  );
};
