This is a [Next.js](https://nextjs.org) project (App Router) for the Resident Directory frontend.

## Retro Theme UI
The UI is intentionally "retro" (bold borders, offset shadows, monospace feel) implemented in `src/app/globals.css`.

## Environment variables
The frontend calls the backend via a configurable base URL.

Required (already provided in this environment):
- `NEXT_PUBLIC_API_BASE` (preferred) or `NEXT_PUBLIC_BACKEND_URL` — e.g. `https://...:3001`
- `NEXT_PUBLIC_WS_URL` — optional (future WebSocket announcements)

## Getting Started

```bash
npm run dev
```

Open http://localhost:3000

## Screens implemented (PRD Step 1)
- Auth: `/auth/register`, `/auth/login` (password + OTP flows), `/auth/pending`
- Directory: `/` with search/filter
- Resident profile view: `/residents/[id]`
- My profile edit + privacy controls: `/profile`
- Announcements feed: `/announcements`
- Admin: `/admin/approvals`, `/admin/residents`, `/admin/announcements`

## Backend note
The backend OpenAPI currently exposes only `GET /` as a health check. The frontend is wired to PRD-based endpoints that will become active once backend APIs are implemented in later steps of the work item.
