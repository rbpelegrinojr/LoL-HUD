const { Server } = require('socket.io');
const gameStateService = require('../services/gameStateService');

function registerSocketServer(httpServer, runtimeStatus) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    runtimeStatus.sockets.connectedClients = io.engine.clientsCount;
    runtimeStatus.sockets.lastConnectionAt = new Date().toISOString();

    socket.emit('system:status', runtimeStatus);

    const liveState = gameStateService.getState();
    if (liveState) {
      socket.emit('hud:update', liveState);
    }

    // Low-latency control channel: admin/operator clients can push HUD
    // updates directly over the socket instead of the REST API. Access is
    // still gated at the HTTP layer (session cookie required to load the
    // admin dashboard that establishes this connection).
    socket.on('hud:control', (payload = {}) => {
      const state = gameStateService.updateGame(payload);
      if (state) {
        io.emit('hud:update', state);
      }
    });

    socket.on('disconnect', () => {
      runtimeStatus.sockets.connectedClients = io.engine.clientsCount;
    });
  });

  return io;
}

module.exports = registerSocketServer;
