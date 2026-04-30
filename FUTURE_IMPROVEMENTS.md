# Frontend Future Improvements

This document tracks frontend improvements that are not fully implemented yet.

## Now (High Impact)

- [ ] Add route-based pages for each domain area with list views and read-first detail pages before full edit forms.

- [ ] Add robust loading, empty, and error states across dashboard cards
  - Why: partial failures or empty datasets can be confusing to users.
  - Direction: standardize card states (`loading`, `empty`, `error`, `ready`) and add retry actions for recoverable failures.

- [ ] Make dashboard cards clickable to open filtered risk lists
  - Why: users should be able to go from category summaries directly to matching risk records.
  - Direction: add click handlers that navigate to the risk list page with pre-applied category filters (for example severity band or status).

## Next (Important)

- [ ] Add filtering, sorting, and search for larger datasets
  - Why: usability will degrade once organizations have more records.
  - Direction: implement consistent query/filter controls and table-level sorting patterns on list pages.

- [ ] Add pagination or incremental loading patterns
  - Why: loading full arrays does not scale well for larger organizations.
  - Direction: start with client-side pagination for existing endpoints, then align with server-side pagination when available.

- [ ] Improve accessibility baseline
  - Why: keyboard users and assistive technologies need better support.
  - Direction: audit interactive elements for semantic roles, visible focus states, keyboard navigation, and color contrast.

- [ ] Harden responsive layouts for tablet and mobile
  - Why: current dashboard-first layout may not hold up on smaller screens.
  - Direction: define breakpoints per card/grid and verify overflow, text wrapping, and action placement at narrow widths.

## Later (Nice to Have)

- [ ] Add lightweight frontend observability
  - Why: runtime UI/API failures are hard to diagnose without telemetry.
  - Direction: introduce structured client error logging and optional monitoring integration with environment-based enablement.

- [ ] Consolidate frontend domain constants and mappings
  - Why: risk/incident status and severity mappings can drift across files.
  - Direction: centralize status buckets, labels, and severity mappings in shared constants with test coverage.

- [ ] Improve dashboard data freshness UX
  - Why: users need confidence in data recency.
  - Direction: show per-card "last updated" timestamps and optional auto-refresh with clear loading indicators.
