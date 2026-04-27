import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getActionPlans,
  getIncidents,
  getRiskAssessments,
  getRisks,
} from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";
import { AppShell } from "../components/AppShell.jsx";
import { RiskMatrixLegend } from "../components/RiskMatrixLegend.jsx";
import { ActionPlansCard } from "../components/cards/ActionPlansCard.jsx";
import { IncidentsCard } from "../components/cards/IncidentsCard.jsx";
import { NextRevisionCard } from "../components/cards/NextRevisionCard.jsx";
import { UrgentRisksCard } from "../components/cards/UrgentRisksCard.jsx";
import { toTimestamp } from "../utils/date.js";
import {
  buildLatestAssessmentByRiskId,
  RISK_BANDS,
  getRiskBand,
  toSeverityScore,
} from "../utils/risk.js";

const DASHBOARD_LIMIT = 5;
const EMPTY_RISK_SUMMARY = {
  total: 0,
  open: 0,
  critical: 0,
  inProgress: 0,
  mitigated: 0,
  needsAction: 0,
  suggestedAction: 0,
  underObservation: 0,
  unknown: 0,
};

const sortByDateDescending = (a, b) => {
  const left = toTimestamp(a) ?? Number.NEGATIVE_INFINITY;
  const right = toTimestamp(b) ?? Number.NEGATIVE_INFINITY;
  return right - left;
};

const sortByDateAscending = (a, b) => {
  const left = toTimestamp(a);
  const right = toTimestamp(b);

  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
};

const toActionPlans = (items) => {
  const completedKeywords = ["complete", "completed", "closed", "done"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items
    .filter((actionPlan) => {
      if (!actionPlan) {
        return false;
      }

      const rawStatus = actionPlan.actionPlanStatus?.toLowerCase() || "";
      if (
        rawStatus &&
        completedKeywords.some((word) => rawStatus.includes(word))
      ) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      const leftDate = toTimestamp(left.plannedCompletionDate);
      const rightDate = toTimestamp(right.plannedCompletionDate);

      const leftPriority =
        leftDate !== null && leftDate >= today.getTime() ? 0 : 1;
      const rightPriority =
        rightDate !== null && rightDate >= today.getTime() ? 0 : 1;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return sortByDateAscending(
        left.plannedCompletionDate,
        right.plannedCompletionDate,
      );
    });
};

const toUrgentRisks = (risks, assessments) => {
  const latestAssessmentByRiskId = buildLatestAssessmentByRiskId(assessments);

  return risks
    .map((risk) => {
      const assessment = latestAssessmentByRiskId[risk.id];
      const severityScore = toSeverityScore(assessment);
      const band = getRiskBand(severityScore);

      return {
        ...risk,
        severityScore,
        band,
      };
    })
    .sort((left, right) => {
      if (left.severityScore === null && right.severityScore === null) {
        return sortByDateDescending(left.updatedAt, right.updatedAt);
      }

      if (left.severityScore === null) {
        return 1;
      }

      if (right.severityScore === null) {
        return -1;
      }

      if (left.severityScore !== right.severityScore) {
        return right.severityScore - left.severityScore;
      }

      return sortByDateDescending(left.updatedAt, right.updatedAt);
    });
};

const toIncidents = (incidents) => {
  return [...incidents].sort((left, right) =>
    sortByDateDescending(
      left.occuredOn || left.updatedAt,
      right.occuredOn || right.updatedAt,
    ),
  );
};

const toRiskSummary = (risks) => {
  return risks.reduce(
    (summary, risk) => {
      const normalizedStatus = String(risk.status || "")
        .toLowerCase()
        .trim();
      const isMitigated =
        normalizedStatus.includes("mitigated") ||
        normalizedStatus.includes("resolved") ||
        normalizedStatus.includes("closed") ||
        normalizedStatus.includes("complete");
      const isInProgress =
        normalizedStatus.includes("in progress") ||
        normalizedStatus.includes("ongoing") ||
        normalizedStatus.includes("active");
      const isOpen = !isMitigated;

      if (isOpen) {
        summary.open += 1;
      }
      if (isInProgress) {
        summary.inProgress += 1;
      }
      if (isMitigated) {
        summary.mitigated += 1;
      }

      if (risk.band === RISK_BANDS.RED) {
        summary.critical += 1;
        summary.needsAction += 1;
      } else if (risk.band === RISK_BANDS.YELLOW) {
        summary.suggestedAction += 1;
      } else if (risk.band === RISK_BANDS.GREEN) {
        summary.underObservation += 1;
      } else {
        summary.unknown += 1;
      }

      return summary;
    },
    {
      ...EMPTY_RISK_SUMMARY,
      total: risks.length,
    },
  );
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, displayName, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [urgentRisks, setUrgentRisks] = useState([]);
  const [riskSummary, setRiskSummary] = useState(EMPTY_RISK_SUMMARY);
  const [incidents, setIncidents] = useState([]);
  const [actionPlans, setActionPlans] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      const [riskItems, riskAssessments, incidentItems, actionPlanItems] =
        await Promise.all([
          getRisks(),
          getRiskAssessments(),
          getIncidents(),
          getActionPlans(),
        ]);

      const enrichedRisks = toUrgentRisks(riskItems, riskAssessments);
      setUrgentRisks(enrichedRisks.slice(0, DASHBOARD_LIMIT));
      setRiskSummary(toRiskSummary(enrichedRisks));
      setIncidents(toIncidents(incidentItems).slice(0, DASHBOARD_LIMIT));
      setActionPlans(toActionPlans(actionPlanItems).slice(0, DASHBOARD_LIMIT));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  const subtitle = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return `${currentUser.role || "User"} - organization ${currentUser.organizationId}`;
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleRefreshData = useCallback(() => {
    setIsLoading(true);
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <AppShell
      title="Dashboard"
      subtitle={subtitle}
      userName={displayName}
      userEmail={currentUser?.email || "—"}
      onLogout={handleLogout}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Clear overview of urgent risks, incidents and planned actions.
        </p>
        <button
          type="button"
          onClick={handleRefreshData}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          disabled={isLoading}
        >
          Refresh data
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading dashboard data...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <UrgentRisksCard risks={urgentRisks} summary={riskSummary} />
            <IncidentsCard incidents={incidents} />
            <ActionPlansCard actionPlans={actionPlans} />
            <NextRevisionCard />
          </div>
          <RiskMatrixLegend />
        </div>
      )}
    </AppShell>
  );
};
