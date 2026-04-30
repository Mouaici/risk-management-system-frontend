# Risk Management System Frontend

Frontend for the `risk-management-system` backend API.

## Stack

- Vite + React (JavaScript)
- React Router
- Tailwind CSS
- Axios
- ESLint

## Features

- Route scope:
  - `/login` for sign-in
  - `/` for dashboard (protected route)
- Session-based authentication with:
  - Access token stored in memory
  - Refresh token in HttpOnly cookie
  - Session bootstrap on app load via `/api/auth/refresh`
  - Automatic 401 refresh and original request retry (single shared refresh flow)
- Dashboard:
  - Audit strip with `ISO scope`, `Next revision`, and `Audit expiration`
  - Risk overview with:
    - status/severity stacked chart
    - severity composition donut chart
    - summary tiles (open, critical, in progress, unknown score)
  - Incidents card with status chart and high-severity summary
  - Action plans card ordered by `plannedCompletionDate` and filtered to exclude completed/closed/done statuses
  - Manual `Refresh data` action
- Risk matrix legend with color bands:
  - Red `16-25` => Needs action
  - Yellow `8-15` => Suggested action
  - Green `1-7` => Keep under observation

Current scope: this frontend is currently dashboard-focused and does not yet include full CRUD pages for risks, incidents, and action plans.

## Future improvements

- Add core pages and workflows for risks, incidents, and action plans
- Improve loading/empty/error states with clearer retry behavior
- Make dashboard cards clickable to open the matching risk category
- Strengthen filtering, sorting, search, and responsive/a11y quality

Detailed backlog: [FUTURE_IMPROVEMENTS.md](./FUTURE_IMPROVEMENTS.md)

## API assumptions

This frontend is aligned with these backend routes:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/risks`
- `GET /api/risk-assessment`
- `GET /api/incidents`
- `GET /api/action-plans`
- `GET /api/organization/{organizationId}`
- `GET /api/organization/{organizationId}/audit-details`

List endpoints are expected to return plain arrays.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

## Backend CORS and cookies

To make refresh-cookie auth work in browser:

- Backend CORS must allow the frontend origin (for example `http://localhost:5173`)
- Backend CORS must allow credentials
- Frontend requests are sent with `credentials: 'include'`

If your backend runs on another URL, set `VITE_API_BASE_URL` accordingly.
