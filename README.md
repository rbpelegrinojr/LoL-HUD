# League of Legends Tournament HUD

A production-oriented starter for a school and university **League of Legends Tournament HUD and Management System**. This Milestone 1 delivery initializes the project structure, Express server, Sequelize/MySQL configuration, Socket.IO wiring, Bootstrap-based admin UI, and setup documentation.

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
- MySQL 8

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
4. Update the MySQL credentials in `.env`.
5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Application environment |
| `PORT` | HTTP server port |
| `APP_NAME` | Display name used by the server |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_CONNECT_ON_STARTUP` | Set to `true` to verify MySQL during boot |

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

- If MySQL is not ready yet, keep `DB_CONNECT_ON_STARTUP=false` so the UI can still boot while you finish setup.
- If port `3000` is busy, change `PORT` in `.env`.
- If styles do not load, confirm `npm install` completed successfully so Bootstrap assets exist in `node_modules`.
