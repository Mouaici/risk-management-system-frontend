import { toTimestamp } from "./date.js";

export const RISK_BANDS = {
  RED: {
    label: "Critical",
    actionLabel: "Needs action",
    min: 16,
    max: 25,
    classes: "bg-red-100 text-red-800",
  },
  YELLOW: {
    label: "Elevated",
    actionLabel: "Suggested action",
    min: 8,
    max: 15,
    classes: "bg-amber-100 text-amber-800",
  },
  GREEN: {
    label: "Monitored",
    actionLabel: "Keep under observation",
    min: 1,
    max: 7,
    classes: "bg-emerald-100 text-emerald-800",
  },
  UNKNOWN: {
    label: "Unknown",
    actionLabel: "No score available",
    classes: "bg-slate-100 text-slate-700",
  },
};

export const getRiskBand = (score) => {
  if (typeof score !== "number") {
    return RISK_BANDS.UNKNOWN;
  }

  if (score >= RISK_BANDS.RED.min && score <= RISK_BANDS.RED.max) {
    return RISK_BANDS.RED;
  }

  if (score >= RISK_BANDS.YELLOW.min && score <= RISK_BANDS.YELLOW.max) {
    return RISK_BANDS.YELLOW;
  }

  if (score >= RISK_BANDS.GREEN.min && score <= RISK_BANDS.GREEN.max) {
    return RISK_BANDS.GREEN;
  }

  return RISK_BANDS.UNKNOWN;
};

const getAssessmentTimestamp = (assessment) => {
  return (
    toTimestamp(assessment.updatedAt) ??
    toTimestamp(assessment.createdAt) ??
    Number.NEGATIVE_INFINITY
  );
};

export const buildLatestAssessmentByRiskId = (assessments) => {
  return assessments.reduce((accumulator, assessment) => {
    if (!assessment?.riskId) {
      return accumulator;
    }

    const previous = accumulator[assessment.riskId];
    if (!previous) {
      return {
        ...accumulator,
        [assessment.riskId]: assessment,
      };
    }

    const currentTs = getAssessmentTimestamp(assessment);
    const previousTs = getAssessmentTimestamp(previous);

    if (currentTs > previousTs) {
      return {
        ...accumulator,
        [assessment.riskId]: assessment,
      };
    }

    return accumulator;
  }, {});
};

export const toSeverityScore = (assessment) => {
  if (!assessment) {
    return null;
  }

  if (typeof assessment.riskScore === "number") {
    return assessment.riskScore;
  }

  if (
    typeof assessment.likelihood === "number" &&
    typeof assessment.impact === "number"
  ) {
    return assessment.likelihood * assessment.impact;
  }

  return null;
};
