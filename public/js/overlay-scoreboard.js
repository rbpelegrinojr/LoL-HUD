const blueNameEl = document.getElementById('blue-name');
const redNameEl = document.getElementById('red-name');
const blueKillsEl = document.getElementById('blue-kills');
const redKillsEl = document.getElementById('red-kills');
const goldDiffEl = document.getElementById('gold-diff');
const timerEl = document.getElementById('timer');

let startedAtMs = null;
let timerInterval = null;

function formatGoldDiff(diff) {
  if (!diff) {
    return 'GOLD EVEN';
  }
  const side = diff > 0 ? 'BLUE' : 'RED';
  return `${side} +${Math.abs(diff).toLocaleString()}`;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    if (startedAtMs) {
      timerEl.textContent = formatDuration(Date.now() - startedAtMs);
    }
  }, 1000);
}

function render(state) {
  if (!state || state.status !== 'ongoing') {
    return;
  }

  blueNameEl.textContent = (state.blueTeam && (state.blueTeam.tag || state.blueTeam.name)) || 'BLUE';
  redNameEl.textContent = (state.redTeam && (state.redTeam.tag || state.redTeam.name)) || 'RED';
  blueKillsEl.textContent = state.blueKills || 0;
  redKillsEl.textContent = state.redKills || 0;
  goldDiffEl.textContent = formatGoldDiff((state.blueGold || 0) - (state.redGold || 0));

  if (state.startedAt) {
    startedAtMs = new Date(state.startedAt).getTime();
    startTimer();
  }
}

const socket = io();

socket.on('hud:update', (state) => render(state));

socket.on('hud:end', () => {
  stopTimer();
  timerEl.textContent = '00:00';
});
