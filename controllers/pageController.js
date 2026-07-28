const path = require('node:path');

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

module.exports = {
  redirectToLogin,
  healthCheck,
  runtimeStatus,
  loginPage: sendPage(path.join('admin', 'login.html')),
  dashboardPage: sendPage(path.join('admin', 'dashboard.html'))
};
