const path = require('node:path');
const fs = require('node:fs');
const { generateCsrfToken } = require('../middleware/csrf');

const publicDirectory = path.join(__dirname, '..', 'public');

function sendPage(relativePath) {
  return (_request, response) => {
    response.sendFile(path.join(publicDirectory, relativePath));
  };
}

const redirectToLogin = (_request, response) => {
  response.redirect('/admin/login');
};

const healthCheck = (request, response) => {
  response.json({
    status: 'ok',
    app: request.app.locals.runtimeStatus.app,
    uptime: process.uptime()
  });
};

const runtimeStatus = (request, response) => {
  response.json(request.app.locals.runtimeStatus);
};

const loginPage = (request, response) => {
  // Touch the session so express-session persists it (and sends the session
  // cookie back to the browser) even though `saveUninitialized` is false.
  // This keeps the session identifier stable between this GET request (where
  // the CSRF token is issued) and the subsequent POST /admin/login, which is
  // required for the double-submit CSRF token to validate correctly.
  if (request.session) {
    request.session.csrfSeed = true;
  }

  const csrfToken = generateCsrfToken(request, response, { overwrite: true });
  const html = fs.readFileSync(path.join(publicDirectory, 'admin', 'login.html'), 'utf8');
  const withToken = html.replace('</head>', `    <meta name="csrf-token" content="${csrfToken}" />\n  </head>`);

  response.type('html').send(withToken);
};

module.exports = {
  redirectToLogin,
  healthCheck,
  runtimeStatus,
  loginPage,
  dashboardPage: sendPage(path.join('admin', 'dashboard.html')),
  tournamentsPage: sendPage(path.join('admin', 'tournaments.html')),
  teamsPage: sendPage(path.join('admin', 'teams.html')),
  playersPage: sendPage(path.join('admin', 'players.html')),
  matchesPage: sendPage(path.join('admin', 'matches.html')),
  broadcastPage: sendPage(path.join('admin', 'broadcast.html'))
};
