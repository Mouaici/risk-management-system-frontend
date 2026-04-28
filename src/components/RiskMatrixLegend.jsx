import { RISK_BANDS } from "../utils/risk.js";

const probabilityRows = [
  "1 Unlikely or very rarely",
  "2 Unlikely or rarely",
  "3 High probability or regular",
  "4 Very likely or often",
  "5 Happens all the time",
];

const consequenceRows = [
  "1 Negligible",
  "2 Moderate",
  "3 Significant",
  "4 Serious",
  "5 Catastrophic",
];

const intervalRows = [
  "< 0.05 times/year",
  "0.05-0.5 times/year",
  "0.5-1 time/year",
  "1-10 times/year",
  "> 10 times/year",
];

const severityBands = [
  {
    name: RISK_BANDS.RED.label,
    score: "16-25",
    action: RISK_BANDS.RED.actionLabel,
    classes: RISK_BANDS.RED.classes,
  },
  {
    name: "Medium",
    score: "8-15",
    action: RISK_BANDS.YELLOW.actionLabel,
    classes: RISK_BANDS.YELLOW.classes,
  },
  {
    name: "Low",
    score: "1-7",
    action: RISK_BANDS.GREEN.actionLabel,
    classes: RISK_BANDS.GREEN.classes,
  },
];

export const RiskMatrixLegend = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">
          Risk matrix reference
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Dashboard ranking uses backend likelihood/impact/risk score. This
          legend shows the agreed wording and colors.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Severity bands
          </h3>
          <ul className="space-y-2 text-sm">
            {severityBands.map((band) => (
              <li
                key={band.name}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2"
              >
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${band.classes}`}
                >
                  {band.name}
                </span>
                <span className="text-slate-700">{band.score}</span>
                <span className="font-medium text-slate-900">
                  {band.action}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Consequence
            </h3>
            <ul className="space-y-1 text-sm text-slate-600">
              {consequenceRows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Probability
            </h3>
            <ul className="space-y-1 text-sm text-slate-600">
              {probabilityRows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Interval probability
        </h3>
        <p className="text-sm text-slate-600">{intervalRows.join(" | ")}</p>
      </div>
    </section>
  );
};
