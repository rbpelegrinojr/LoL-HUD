# League of Legends Tournament HUD

A production-oriented **League of Legends Tournament HUD and Management System** for school and university esports broadcasts. It ships an Express + Sequelize/SQLite backend, session-based admin authentication, a full CRUD admin panel for tournaments/teams/players/matches, live broadcast control over Socket.IO, and OBS-ready browser-source overlays.

## Feature Overview

- Session-based authentication (bcrypt password hashing, role-aware access control: `admin` / `operator`)
- CSRF protection (double-submit cookie pattern) on all state-changing admin/API requests
- Full CRUD admin panel: Tournaments, Teams, Players, Matches, Games (with logo/photo uploads)
- Live broadcast control panel driving real-time HUD overlays via Socket.IO
- OBS browser-source overlays: scoreboard, series score, player cam, event feed
- Structured audit logging (`logs/audit.log`) for auth and data-mutation events
- Rate limiting on login and API routes

## Folder Structure

```text
.
├── app.js
├── config/
├── controllers/
├── database/
├── docs/
├── helpers/
├── logs/
├── middleware/
├── models/
├── public/
│   ├── admin/
│   ├── assets/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── overlay/
├── routes/
├── services/
├── sockets/
├── tests/
└── uploads/
```

## Requirements

- Node.js 22 LTS or newer
- npm

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Default Credentials

On first boot, if no users exist yet, a default admin account is seeded automatically using the `DEFAULT_ADMIN_USER` / `DEFAULT_ADMIN_PASSWORD` environment variables:

- **Username:** `admin`
- **Password:** `changeme123`

> **⚠️ Change the default password immediately in any non-local deployment.** Set `DEFAULT_ADMIN_PASSWORD` (and ideally `DEFAULT_ADMIN_USER`) to strong, unique values in your `.env` file *before* the first server start, since the seed only runs when the `users` table is empty. If you forget, create a new admin user directly in the database and disable/delete the default account.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Application environment |
| `PORT` | HTTP server port |
| `APP_NAME` | Display name used by the server |
| `DB_PATH` | Path to the SQLite database file (default: `./data/lol_hud.db`) |
| `DB_SYNC_ON_STARTUP` | Set to `false` to skip automatic table creation on boot |
| `SESSION_SECRET` | Secret used to sign session cookies and CSRF tokens. **Must** be changed in production. |
| `BCRYPT_ROUNDS` | bcrypt cost factor for password hashing (default: `12`) |
| `DEFAULT_ADMIN_USER` | Username seeded for the default admin account (default: `admin`) |
| `DEFAULT_ADMIN_PASSWORD` | Password seeded for the default admin account (default: `changeme123`) |

## Development Mode

```bash
npm run dev
```

Nodemon watches the project and reloads `app.js` after changes.

## Production Mode

```bash
npm start
```

## API Reference

All `/api/*` routes require an authenticated admin session (`GET /admin/login` → sign in). Non-`GET` requests additionally require a CSRF token: fetch one from `GET /api/csrf-token` and send it back in the `x-csrf-token` header.

| Method | Path | Description | Role |
| --- | --- | --- | --- |
| GET | `/api/csrf-token` | Issue a CSRF token for the current session | any |
| GET/POST/PATCH | `/api/tournaments`, `/api/tournaments/:id` | Manage tournaments (supports `logo` file upload) | any (write ok) |
| DELETE | `/api/tournaments/:id` | Delete a tournament | admin |
| GET/POST/PATCH | `/api/teams`, `/api/teams/:id` | Manage teams (supports `logo` file upload) | any (write ok) |
| DELETE | `/api/teams/:id` | Delete a team | admin |
| GET/POST/PATCH | `/api/players`, `/api/players/:id` | Manage players (supports `photo` file upload, `?team_id=` filter) | any (write ok) |
| DELETE | `/api/players/:id` | Delete a player | admin |
| GET/POST/PATCH | `/api/matches`, `/api/matches/:id` | Manage match series (`?tournament_id=` filter) | any (write ok) |
| DELETE | `/api/matches/:id` | Delete a match | admin |
| GET/POST/PATCH | `/api/games`, `/api/games/:id` | Manage individual games (`?match_id=` filter) | any (write ok) |
| DELETE | `/api/games/:id` | Delete a game | admin |
| GET | `/api/broadcast/state` | Current live HUD state (or `{status:'idle'}`) | any |
| POST | `/api/broadcast/game/start` | Start a live game and broadcast `hud:update` | operator/admin |
| PATCH | `/api/broadcast/game/update` | Push live stat updates and broadcast `hud:update` | operator/admin |
| POST | `/api/broadcast/game/end` | End the live game, persist results, broadcast `hud:end` | operator/admin |

Page routes: `/admin/login`, `/admin/dashboard`, `/admin/tournaments`, `/admin/teams`, `/admin/players`, `/admin/matches`, `/admin/broadcast`, `/admin/logout`. Health/status: `GET /health`, `GET /api/status`.

## OBS Overlay Setup

Overlay pages are plain HTML/CSS/JS served without authentication so OBS's Browser Source can load them directly, and they update live via Socket.IO (`hud:update` / `hud:end` events):

| Overlay | URL | Suggested Size |
| --- | --- | --- |
| Scoreboard | `http://<host>:<port>/overlay/scoreboard` | 1920×1080 |
| Series Score | `http://<host>:<port>/overlay/series-score` | 1920×1080 |
| Player Cam | `http://<host>:<port>/overlay/player-cam` | 640×120 |
| Event Feed | `http://<host>:<port>/overlay/event-feed` | 480×1080 |

**Adding an overlay in OBS:**

1. Add a **Browser Source** in your scene.
2. Set the URL to one of the addresses above (replace `<host>:<port>` with your server's address, e.g. `http://localhost:3000/overlay/scoreboard`).
3. Set the width/height to match the suggested size (or your scene's canvas resolution for full-screen overlays).
4. Check **"Refresh browser when scene becomes active"** so the overlay reconnects cleanly if OBS restarts.
5. Start a live game from **Admin → Broadcast** to see the overlay populate in real time.

Overlay backgrounds are transparent (`background: transparent;`) so they composite cleanly over your gameplay capture.

## Testing

```bash
npm test
```

The suite (Node's built-in test runner) covers:

- Core app boot and static admin pages (`tests/app.test.js`)
- Authentication, sessions, and login rate limiting (`tests/auth.test.js`)
- CRUD API behavior including auth/CSRF/validation errors (`tests/crud.test.js`)
- Live broadcast control flow (`tests/broadcast.test.js`)
- Overlay page routing (`tests/overlay.test.js`)

Each test file uses its own isolated SQLite database file under `data/` (ignored by git) to avoid interfering with your local development database.

## Beginner-Friendly Setup Help

See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for Windows 11 and Ubuntu 24.04 instructions.

## Troubleshooting

- If the database file is missing, it is created automatically in the `data/` folder when the server starts.
- If port `3000` is busy, change `PORT` in `.env`.
- If styles do not load, confirm `npm install` completed successfully so Bootstrap assets exist in `node_modules`.
- If admin API calls return `403` errors, your CSRF token may be stale — refresh the admin page so it fetches a new token from `GET /api/csrf-token`.
- If you're locked out after too many failed logins, wait 15 minutes (the login rate limiter resets automatically) or restart the server.
