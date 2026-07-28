# Installation Guide

## Requirements

- Node.js 22 LTS or newer
- MySQL 8
- Git

## Windows 11

1. Install Node.js LTS from the official installer.
2. Install MySQL 8 and create a database named `lol_hud`.
3. Clone the repository.
4. Run `npm install` inside the project folder.
5. Copy `.env.example` to `.env` and update the database credentials.
6. Run `npm run dev` for local development or `npm start` for production mode.

## Ubuntu 24.04 LTS

1. Install Node.js LTS, npm, Git, and MySQL 8.
2. Create a database named `lol_hud`.
3. Clone the repository.
4. Run `npm install` inside the project folder.
5. Copy `.env.example` to `.env` and update the database credentials.
6. Run `npm run dev` for local development or `npm start` for production mode.

## Commands

- `npm install` installs the project dependencies.
- `npm run dev` starts the server with Nodemon auto-reload.
- `npm start` starts the production server.
- `npm test` runs the Node.js smoke tests.
