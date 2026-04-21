export const parseDateOrNull = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toTimestamp = (value) => {
  const parsedDate = parseDateOrNull(value);
  return parsedDate ? parsedDate.getTime() : null;
};

export const formatDate = (value) => {
  const parsedDate = parseDateOrNull(value);
  if (!parsedDate) {
    return "—";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsedDate);
};
