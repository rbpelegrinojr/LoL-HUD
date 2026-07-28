# Installation Guide

## Requirements

- Node.js 22 LTS or newer
- Git

## Windows 11

1. Install Node.js LTS from the official installer.
2. Clone the repository.
3. Run `npm install` inside the project folder.
4. Copy `.env.example` to `.env` and adjust any settings (the defaults work out of the box).
5. Run `npm run dev` for local development or `npm start` for production mode.

## Ubuntu 24.04 LTS

1. Install Node.js LTS, npm, and Git.
2. Clone the repository.
3. Run `npm install` inside the project folder.
4. Copy `.env.example` to `.env` and adjust any settings (the defaults work out of the box).
5. Run `npm run dev` for local development or `npm start` for production mode.

## Commands

- `npm install` installs the project dependencies.
- `npm run dev` starts the server with Nodemon auto-reload.
- `npm start` starts the production server.
- `npm test` runs the Node.js smoke tests.

## Database

The application uses SQLite. The database file is created automatically at the path configured in `DB_PATH` (default: `./data/lol_hud.db`). No database server installation is required.
