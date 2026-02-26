---
name: Secure Participants Dashboard
overview: Build a Next.js dashboard with Better Auth (stateless, custom OAuth via Hack Club OIDC), server-only Cockpit API integration, and a TanStack Table participants view with summary cards.
todos:
  - id: add-auth
    content: Set up Better Auth stateless mode with Hack Club OIDC discovery and auth route handlers
    status: pending
  - id: add-server-cockpit-client
    content: Implement server-only Cockpit participants fetcher using X-API-Key and env-based event ID
    status: pending
  - id: build-dashboard
    content: Create protected SSR dashboard with summary cards and TanStack Table
    status: pending
  - id: harden-and-doc
    content: Add proxy/auth guard patterns, env docs, and verification steps
    status: pending
isProject: false
---

# Secure Participants Dashboard Plan

## Goals

- Add authenticated access to a participants dashboard in Next.js.
- Use Better Auth in stateless mode with custom OAuth provider discovery at `https://auth.hackclub.com/.well-known/openid-configuration`.
- Fetch participants from Cockpit endpoint `/api/events/{id}/participants` on the server only, passing `X-API-Key` from environment variables.
- Render participant table + aggregate summaries server-first, excluding disabled participants by default.

## Implementation Steps

- **Auth foundation (stateless + custom OAuth)**
  - Add Better Auth setup in `[lib/auth.ts](lib/auth.ts)` and client helper in `[lib/auth-client.ts](lib/auth-client.ts)`.
  - Configure stateless sessions (no DB), secure cookie cache, strict origin checks, and Generic OAuth provider via discovery URL.
  - Mount Better Auth handler at `[app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts)`.
  - Add sign-in/sign-out UI flow pages at `[app/sign-in/page.tsx](app/sign-in/page.tsx)` and optional auth error page.
- **Server-side protection and route gating**
  - Add authenticated dashboard route at `[app/dashboard/page.tsx](app/dashboard/page.tsx)`.
  - In the server component, require a valid session using `auth.api.getSession({ headers })`; redirect unauthenticated users to `/sign-in`.
  - Keep all Cockpit data access in server-only modules; do not expose API key or raw upstream endpoint to client.
- **Cockpit API integration (server-only)**
  - Create typed fetcher in `[lib/cockpit.ts](lib/cockpit.ts)` for `/api/events/{id}/participants`.
  - Read `COCKPIT_EVENT_ID` and `COCKPIT_API_KEY` from env; send `X-API-Key` header; validate required env at runtime with clear errors.
  - Normalize potentially empty-string enum/text fields and parse date fields safely.
- **Dashboard data shaping and summaries**
  - Create derivation helpers in `[lib/participants.ts](lib/participants.ts)`:
    - default filtered list (`disabled !== true`)
    - totals: participant count, checked-in count, volunteer count, disabled count
    - grouped summaries: dietary restrictions, shirt sizes, pronouns, accommodations (skip blanks by default or bucket as “Unspecified”)
  - Ensure summaries are deterministic and robust when fields are empty strings.
- **TanStack Table UI**
  - Build reusable table component in `[components/participants-table.tsx](components/participants-table.tsx)` using TanStack Table.
  - Define typed columns (name, contact, age, pronouns, check-in, volunteer, shirt size, dietary restrictions, created time, etc.).
  - Use server-provided initial data and client-side table state (sorting/filtering/column visibility), while keeping source data fetch server-side.
  - Add a server-rendered dashboard shell with summary cards + table in `[app/dashboard/page.tsx](app/dashboard/page.tsx)`.
- **Security hardening and DX**
  - Add minimal `proxy.ts` for optimistic redirect only; keep authoritative checks in server components/handlers.
  - Add strict env docs to `[README.md](README.md)` and `.env.example` with:
    - `BETTER_AUTH_SECRET`
    - `BETTER_AUTH_URL`
    - OAuth client id/secret for Hack Club provider
    - `COCKPIT_BASE_URL` (defaulting to `https://cockpit.hackclub.com`)
    - `COCKPIT_EVENT_ID`
    - `COCKPIT_API_KEY`
  - Provide safe error UI states (auth required, upstream fetch failure, empty result).

## Key Design Decisions

- Use exact endpoint requested: `/api/events/{id}/participants`.
- Use server-to-server Cockpit fetches only; never fetch Cockpit directly from browser.
- Exclude disabled participants by default in primary table/summaries; expose disabled count as a metric.
- Prefer SSR for initial render and auth checks; use client interactivity only for table UX.

## Test & Verification

- Validate sign-in/out flow and protected route redirects.
- Confirm requests to Cockpit include `X-API-Key` and event ID from env.
- Verify disabled users are excluded by default and summary counts match visible dataset.
- Verify blank-string fields do not break rendering and are represented consistently.
- Run lint/build and fix introduced issues.
