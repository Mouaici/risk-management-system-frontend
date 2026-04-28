import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getActionPlans,
  getIncidents,
  getOrganizationAuditDetails,
  getOrganizationById,
  getRiskAssessments,
  getRisks,
} from "../api/client.js";
import { useAuth } from "../auth/useAuth.js";
import { AppShell } from "../components/AppShell.jsx";
import { AuditDatesStrip } from "../components/AuditDatesStrip.jsx";
import { RiskMatrixLegend } from "../components/RiskMatrixLegend.jsx";
import { ActionPlansCard } from "../components/cards/ActionPlansCard.jsx";
import { IncidentsCard } from "../components/cards/IncidentsCard.jsx";
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
const STATUS_BUCKETS = [
  "Open",
  "In progress",
  "Mitigated",
  "Accepted",
  "Closed",
];
const EMPTY_STATUS_SEVERITY_ROW = {
  critical: 0,
  medium: 0,
  low: 0,
  unknown: 0,
};
const INCIDENT_STATUS_BUCKETS = ["Open", "In progress", "Closed"];
const EMPTY_INCIDENT_SUMMARY = {
  total: 0,
  highSeverityTotal: 0,
  statusRows: INCIDENT_STATUS_BUCKETS.map((status) => ({
    status,
    count: 0,
    highSeverityCount: 0,
  })),
};
const EMPTY_AUDIT_DETAILS = {
  nextAuditRevisionDate: null,
  auditExpirationDate: null,
  isoScope: "",
  organizationName: "",
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

const toIncidentStatusBucket = (status) => {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .trim();

  if (!normalizedStatus) {
    return "Open";
  }

  if (
    normalizedStatus.includes("inprogress") ||
    normalizedStatus.includes("in progress")
  ) {
    return "In progress";
  }

  if (normalizedStatus.includes("closed")) {
    return "Closed";
  }

  return "Open";
};

const isHighSeverityIncident = (severity) => {
  return (
    String(severity || "")
      .toLowerCase()
      .trim() === "high"
  );
};

const toIncidentSummary = (incidents) => {
  const rowsByStatus = INCIDENT_STATUS_BUCKETS.reduce((accumulator, status) => {
    return {
      ...accumulator,
      [status]: {
        status,
        count: 0,
        highSeverityCount: 0,
      },
    };
  }, {});

  let highSeverityTotal = 0;

  incidents.forEach((incident) => {
    const statusBucket = toIncidentStatusBucket(incident.incidentStatus);
    rowsByStatus[statusBucket].count += 1;

    if (isHighSeverityIncident(incident.severity)) {
      rowsByStatus[statusBucket].highSeverityCount += 1;
      highSeverityTotal += 1;
    }
  });

  return {
    total: incidents.length,
    highSeverityTotal,
    statusRows: INCIDENT_STATUS_BUCKETS.map((status) => rowsByStatus[status]),
  };
};

const toStatusBucket = (status) => {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .trim();

  if (!normalizedStatus) {
    return "Open";
  }

  if (normalizedStatus.includes("accept")) {
    return "Accepted";
  }

  if (normalizedStatus.includes("mitigat")) {
    return "Mitigated";
  }

  if (
    normalizedStatus.includes("closed") ||
    normalizedStatus.includes("resolved") ||
    normalizedStatus.includes("complete")
  ) {
    return "Closed";
  }

  if (
    normalizedStatus.includes("in progress") ||
    normalizedStatus.includes("ongoing") ||
    normalizedStatus.includes("active")
  ) {
    return "In progress";
  }

  return "Open";
};

const toSeverityKey = (riskBand) => {
  if (riskBand === RISK_BANDS.RED) {
    return "critical";
  }

  if (riskBand === RISK_BANDS.YELLOW) {
    return "medium";
  }

  if (riskBand === RISK_BANDS.GREEN) {
    return "low";
  }

  return "unknown";
};

const toRiskSummary = (risks) => {
  return risks.reduce(
    (summary, risk) => {
      const statusBucket = toStatusBucket(risk.status);
      const isOpen = statusBucket === "Open";
      const isInProgress = statusBucket === "In progress";
      const isMitigated = statusBucket === "Mitigated";

      if (isOpen) {
        summary.open += 1;
      }
      if (isInProgress) {
        summary.inProgress += 1;
      }
      if (isMitigated) {
        summary.mitigated += 1;
      }

      const severityKey = toSeverityKey(risk.band);

      if (severityKey === "critical") {
        summary.critical += 1;
        summary.needsAction += 1;
      } else if (severityKey === "medium") {
        summary.suggestedAction += 1;
      } else if (severityKey === "low") {
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

const toStatusSeverityRows = (risks) => {
  const rowsByStatus = STATUS_BUCKETS.reduce((accumulator, status) => {
    return {
      ...accumulator,
      [status]: {
        status,
        ...EMPTY_STATUS_SEVERITY_ROW,
      },
    };
  }, {});

  risks.forEach((risk) => {
    const statusBucket = toStatusBucket(risk.status);
    const severityKey = toSeverityKey(risk.band);
    rowsByStatus[statusBucket][severityKey] += 1;
  });

  return STATUS_BUCKETS.map((status) => {
    const row = rowsByStatus[status];

    return {
      ...row,
      total: row.critical + row.medium + row.low + row.unknown,
    };
  });
};

const toAuditDetails = (auditItem, organizationItem) => {
  if (!auditItem && !organizationItem) {
    return EMPTY_AUDIT_DETAILS;
  }

  return {
    nextAuditRevisionDate:
      auditItem?.nextAuditRevisionDate ??
      auditItem?.NextAuditRevisionDate ??
      null,
    auditExpirationDate:
      auditItem?.auditExpirationDate ?? auditItem?.AuditExpirationDate ?? null,
    isoScope: organizationItem?.isoScope ?? organizationItem?.IsoScope ?? "",
    organizationName: organizationItem?.name ?? organizationItem?.Name ?? "",
  };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, displayName, logout } = useAuth();
  const organizationId = currentUser?.organizationId ?? null;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [riskSummary, setRiskSummary] = useState(EMPTY_RISK_SUMMARY);
  const [riskStatusRows, setRiskStatusRows] = useState(
    STATUS_BUCKETS.map((status) => ({
      status,
      ...EMPTY_STATUS_SEVERITY_ROW,
      total: 0,
    })),
  );
  const [incidentSummary, setIncidentSummary] = useState(
    EMPTY_INCIDENT_SUMMARY,
  );
  const [auditDetails, setAuditDetails] = useState(EMPTY_AUDIT_DETAILS);
  const [actionPlans, setActionPlans] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      const auditDetailsPromise = organizationId
        ? getOrganizationAuditDetails(organizationId)
        : Promise.resolve(null);
      const organizationPromise = organizationId
        ? getOrganizationById(organizationId)
        : Promise.resolve(null);
      const [
        riskItems,
        riskAssessments,
        incidentItems,
        actionPlanItems,
        organizationAuditDetails,
        organizationDetails,
      ] = await Promise.all([
        getRisks(),
        getRiskAssessments(),
        getIncidents(),
        getActionPlans(),
        auditDetailsPromise,
        organizationPromise,
      ]);

      const enrichedRisks = toUrgentRisks(riskItems, riskAssessments);
      const sortedIncidents = toIncidents(incidentItems);
      setRiskSummary(toRiskSummary(enrichedRisks));
      setRiskStatusRows(toStatusSeverityRows(enrichedRisks));
      setIncidentSummary(toIncidentSummary(sortedIncidents));
      setAuditDetails(
        toAuditDetails(organizationAuditDetails, organizationDetails),
      );
      setActionPlans(toActionPlans(actionPlanItems).slice(0, DASHBOARD_LIMIT));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

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

    const organizationLabel =
      auditDetails.organizationName ||
      `organization ${currentUser.organizationId}`;
    return `${currentUser.role || "User"} - ${organizationLabel}`;
  }, [auditDetails.organizationName, currentUser]);

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AuditDatesStrip details={auditDetails} />
        </div>
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <UrgentRisksCard
              summary={riskSummary}
              statusRows={riskStatusRows}
            />
            <IncidentsCard summary={incidentSummary} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ActionPlansCard actionPlans={actionPlans} />
            <RiskMatrixLegend />
          </div>
        </div>
      )}
    </AppShell>
  );
};
