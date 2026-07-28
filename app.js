const http = require('node:http');
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { initializeDatabase } = require('./database');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const indexRoutes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const registerSocketServer = require('./sockets');
const { ensureRuntimeDirectories } = require('./services/runtimeDirectories');

function createRuntimeStatus() {
  return {
    app: {
      name: env.appName,
      environment: env.nodeEnv,
      startedAt: new Date().toISOString()
    },
    database: {
      connected: false,
      configured: true,
      message: 'Database status pending startup check.'
    },
    sockets: {
      connectedClients: 0,
      lastConnectionAt: null
    }
  };
}

function createApp(runtimeStatus = createRuntimeStatus()) {
  const app = express();

  app.disable('x-powered-by');
  app.locals.runtimeStatus = runtimeStatus;

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'ws:', 'wss:']
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRoutes);
  app.use('/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function createServer() {
  ensureRuntimeDirectories(__dirname);

  const runtimeStatus = createRuntimeStatus();
  runtimeStatus.database = await initializeDatabase();

  const app = createApp(runtimeStatus);
  const httpServer = http.createServer(app);
  const io = registerSocketServer(httpServer, runtimeStatus);

  app.locals.io = io;

  return { app, httpServer, io };
}

async function startServer() {
  const { httpServer } = await createServer();

  return new Promise((resolve) => {
    httpServer.listen(env.port, () => {
      console.log(`${env.appName} is running at http://localhost:${env.port}`);
      resolve(httpServer);
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start the application:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  createApp,
  createServer,
  startServer
};
