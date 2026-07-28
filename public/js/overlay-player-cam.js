const roleIconEl = document.getElementById('role-icon');
const summonerNameEl = document.getElementById('summoner-name');
const teamTagEl = document.getElementById('team-tag');

const ROLE_ABBREVIATIONS = {
  top: 'TOP',
  jungle: 'JNG',
  mid: 'MID',
  bot: 'BOT',
  support: 'SUP'
};

function render(state) {
  const player = state && state.spotlightPlayer;
  if (!player) {
    return;
  }

  roleIconEl.textContent = ROLE_ABBREVIATIONS[player.role] || '—';
  summonerNameEl.textContent = player.summoner_name || player.summonerName || 'Unknown Player';
  teamTagEl.textContent = player.teamTag || player.team_tag || '';
}

const socket = io();

socket.on('hud:update', (state) => render(state));
