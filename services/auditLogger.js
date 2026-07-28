const path = require('node:path');
const pino = require('pino');

const logFilePath = path.join(__dirname, '..', 'logs', 'audit.log');

const auditLogger = pino(
  { base: undefined, timestamp: pino.stdTimeFunctions.isoTime },
  pino.destination({ dest: logFilePath, mkdir: true, sync: true })
);

/**
 * Writes a structured audit trail entry (auth events, CRUD mutations,
 * broadcast control actions) to logs/audit.log.
 */
function auditLog(action, details = {}) {
  auditLogger.info({ action, ...details });
}

module.exports = { auditLog };
