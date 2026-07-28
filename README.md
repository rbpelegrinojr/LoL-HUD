# League of Legends Tournament HUD

A production-oriented starter for a school and university **League of Legends Tournament HUD and Management System**. This Milestone 1 delivery initializes the project structure, Express server, Sequelize/SQLite configuration, Socket.IO wiring, Bootstrap-based admin UI, and setup documentation.

## Milestone 1 Scope

- Express application bootstrap with MVC-friendly structure
- Sequelize configuration for MySQL 8
- Socket.IO server initialization for future real-time HUD updates
- Bootstrap login page and dark-theme admin dashboard layout
- Environment template and beginner-friendly installation guide
- Smoke tests for basic server routes

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

## Environment Variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Application environment |
| `PORT` | HTTP server port |
| `APP_NAME` | Display name used by the server |
| `DB_PATH` | Path to the SQLite database file (default: `./data/lol_hud.db`) |
| `DB_SYNC_ON_STARTUP` | Set to `false` to skip automatic table creation on boot |

## Development Mode

```bash
npm run dev
```

Nodemon watches the project and reloads `app.js` after changes.

## Production Mode

```bash
npm start
```

## OBS and Overlay Readiness

Milestone 1 only prepares the real-time server foundation. Overlay rendering routes and broadcast graphics are intentionally deferred to later milestones.

## API Endpoints Available Now

- `GET /health` - application health payload
- `GET /api/status` - runtime status for dashboard widgets
- `GET /admin/login` - Bootstrap login screen
- `GET /admin/dashboard` - admin dashboard layout preview

## Testing

```bash
npm test
```

The current test suite validates that the app boots and serves the key Milestone 1 routes.

## Beginner-Friendly Setup Help

See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for Windows 11 and Ubuntu 24.04 instructions.

## Troubleshooting

- If the database file is missing, it is created automatically in the `data/` folder when the server starts.
- If port `3000` is busy, change `PORT` in `.env`.
- If styles do not load, confirm `npm install` completed successfully so Bootstrap assets exist in `node_modules`.
