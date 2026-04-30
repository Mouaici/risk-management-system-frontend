# Risk Management System Frontend

Frontend for the `risk-management-system` backend API.

## Stack

- Vite + React (JavaScript)
- React Router
- Tailwind CSS

## Features

- Session-based authentication with:
  - Access token in memory
  - Refresh token in HttpOnly cookie
  - Automatic refresh and request retry on 401
- Dashboard cards:
  - Most severe/urgent risks (based on latest risk assessment)
  - Incidents (ordered by `occuredOn` desc)
  - Action plans (ordered by `plannedCompletionDate` asc)
  - Next revision date placeholder
- Risk matrix legend using your Excel wording and color bands:
  - Red `16-25` => Action
  - Yellow `8-15` => Suggested action
  - Green `1-7` => Keep under observation

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
