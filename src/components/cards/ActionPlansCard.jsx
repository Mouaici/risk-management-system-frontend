import { CardContainer } from "./CardContainer.jsx";
import { formatDate } from "../../utils/date.js";

export const ActionPlansCard = ({ actionPlans }) => {
  return (
    <CardContainer
      title="Action plans"
      description="Ordered by planned completion date"
    >
      {actionPlans.length === 0 ? (
        <p className="text-sm text-slate-500">No action plans found.</p>
      ) : (
        <ul className="space-y-3">
          {actionPlans.map((actionPlan) => (
            <li
              key={actionPlan.id}
              className="rounded-lg border border-slate-200 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  {actionPlan.suggestedAction || "No action description"}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {actionPlan.actionPlanStatus || "Status unknown"}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>
                  Planned completion:{" "}
                  {formatDate(actionPlan.plannedCompletionDate)}
                </p>
                <p>Owner user id: {actionPlan.ownerUserId ?? "—"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContainer>
  );
};
