const environmentElement = document.getElementById('environment');
const databaseStatusElement = document.getElementById('database-status');
const connectedClientsElement = document.getElementById('connected-clients');
const startedAtElement = document.getElementById('started-at');
const socketStatusElement = document.getElementById('socket-status');

async function loadRuntimeStatus() {
  const response = await fetch('/api/status');
  const status = await response.json();

  environmentElement.textContent = status.app.environment;
  databaseStatusElement.textContent = status.database.connected ? 'Connected' : 'Configured';
  databaseStatusElement.title = status.database.error || status.database.message;
  connectedClientsElement.textContent = String(status.sockets.connectedClients);
  startedAtElement.textContent = new Date(status.app.startedAt).toLocaleString();
}

loadRuntimeStatus().catch(() => {
  socketStatusElement.textContent = 'Socket: status unavailable';
});

const socket = io();

socket.on('connect', () => {
  socketStatusElement.textContent = 'Socket: connected';
});

socket.on('system:status', (status) => {
  connectedClientsElement.textContent = String(status.sockets.connectedClients);
});

socket.on('disconnect', () => {
  socketStatusElement.textContent = 'Socket: disconnected';
});
