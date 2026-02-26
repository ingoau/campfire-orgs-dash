# Campfire Canberra Participants Dashboard

Authenticated Next.js dashboard for viewing event participants from Cockpit.

## Features

- Better Auth in stateless mode with custom OAuth provider (`auth.hackclub.com`).
- Server-only Cockpit API integration using `X-API-Key`.
- Protected dashboard route with server-side session validation.
- Participant summaries (totals, check-ins, dietary, shirt sizes, pronouns, accommodations).
- TanStack Table for participant list with sorting + search.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill all required values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_URL` | yes | App base URL (for local dev use `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | yes | Strong secret for Better Auth cookie/session signing |
| `HACKCLUB_OAUTH_CLIENT_ID` | yes | OAuth client ID from Hack Club auth provider |
| `HACKCLUB_OAUTH_CLIENT_SECRET` | yes | OAuth client secret from Hack Club auth provider |
| `ALLOWED_EMAILS` | yes | Comma-separated list of emails allowed to sign in and access dashboard data |
| `COCKPIT_BASE_URL` | no | Cockpit base URL (defaults to `https://cockpit.hackclub.com`) |
| `COCKPIT_EVENT_ID` | yes | Event ID used for participants endpoint |
| `COCKPIT_API_KEY` | yes | Cockpit API key sent in `X-API-Key` |

## Local Development

Install dependencies:

```bash
ni
```

Run the app:

```bash
nr dev
```

The app redirects:

- unauthenticated users to `/sign-in`
- authenticated users to `/dashboard`

## Security Notes

- Cockpit API calls are made on the server only.
- API key is never sent to the browser.
- `/dashboard` requires authentication and server-side session validation.
- `/dashboard` also requires the signed-in email to be listed in `ALLOWED_EMAILS`.
- Dashboard structure follows the current Cockpit `ParticipantsAPIResponse` shape.
