const bluePipsEl = document.getElementById('blue-pips');
const redPipsEl = document.getElementById('red-pips');
const labelEl = document.getElementById('label');

const FORMAT_GAME_COUNT = { bo1: 1, bo3: 3, bo5: 5 };

function renderPips(container, wins, totalPips, colorClass) {
  container.innerHTML = '';
  for (let i = 0; i < totalPips; i += 1) {
    const pip = document.createElement('div');
    pip.className = `pip${i < wins ? ` ${colorClass}` : ''}`;
    container.appendChild(pip);
  }
}

function render(state) {
  if (!state) {
    return;
  }

  const format = (state.match && state.match.format) || 'bo3';
  const gamesToWin = Math.ceil((FORMAT_GAME_COUNT[format] || 3) / 2);

  labelEl.textContent = format.toUpperCase();
  renderPips(bluePipsEl, state.team1_score || 0, gamesToWin, 'blue-win');
  renderPips(redPipsEl, state.team2_score || 0, gamesToWin, 'red-win');
}

const socket = io();

socket.on('hud:update', (state) => {
  if (state && state.match) {
    render(state.match);
  }
});
