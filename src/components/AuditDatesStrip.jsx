import { formatDate } from "../utils/date.js";

const DateItem = ({ label, value }) => {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {formatDate(value)}
      </p>
    </div>
  );
};

const TextItem = ({ label, value }) => {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
};

export const AuditDatesStrip = ({ details }) => {
  const safeDetails = details || {
    nextAuditRevisionDate: null,
    auditExpirationDate: null,
    isoScope: "",
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="grid grid-cols-3 gap-2">
        <TextItem label="ISO scope" value={safeDetails.isoScope} />
        <DateItem
          label="Next revision"
          value={safeDetails.nextAuditRevisionDate}
        />
        <DateItem
          label="Audit expiration"
          value={safeDetails.auditExpirationDate}
        />
      </div>
    </section>
  );
};
