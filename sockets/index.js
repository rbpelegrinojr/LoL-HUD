const { Server } = require('socket.io');

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

    socket.on('disconnect', () => {
      runtimeStatus.sockets.connectedClients = io.engine.clientsCount;
    });
  });

  return io;
}

module.exports = registerSocketServer;
