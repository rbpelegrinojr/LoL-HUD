const http = require('node:http');
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3');
const SQLiteStoreFactory = require('connect-sqlite3');
const pinoHttp = require('pino-http');
const pino = require('pino');

const env = require('./config/env');
const { initializeDatabase } = require('./database');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const indexRoutes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/api');
const overlayRoutes = require('./routes/overlay');
const registerSocketServer = require('./sockets');
const { ensureRuntimeDirectories } = require('./services/runtimeDirectories');

const SQLiteStore = SQLiteStoreFactory(session);

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
  app.use(
    pinoHttp({
      logger: pino(pino.destination({ dest: path.join(__dirname, 'logs', 'http.log'), mkdir: true, sync: false })),
      autoLogging: env.nodeEnv !== 'test'
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // The session store shares the same SQLite file as the main application
  // database (a separate driver connection, since Sequelize owns its own).
  const sessionDbConnection = new sqlite3.Database(env.database.path);

  app.use(
    session({
      store: new SQLiteStore({ db: sessionDbConnection, table: 'sessions' }),
      name: 'lol-hud.sid',
      secret: env.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.nodeEnv === 'production',
        maxAge: 1000 * 60 * 60 * 8
      }
    })
  );
  app.use(cookieParser());

  app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRoutes);
  app.use('/admin', adminRoutes);
  app.use('/api', apiRoutes);
  app.use('/overlay', overlayRoutes);

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
