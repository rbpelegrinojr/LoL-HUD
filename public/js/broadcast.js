const matchSelect = document.getElementById('match_id');
const blueTeamSelect = document.getElementById('blue_team_id');
const redTeamSelect = document.getElementById('red_team_id');
const winnerSelect = document.getElementById('winner_team_id');
const gameStatus = document.getElementById('game-status');
const updateForm = document.getElementById('update-form');

let matchesCache = [];
let teamsCache = [];

function fillSelect(select, items) {
  select.innerHTML = '';
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

async function loadLookups() {
  const [matchesRes, teamsRes] = await Promise.all([
    window.apiClient.apiFetch('/api/matches'),
    window.apiClient.apiFetch('/api/teams')
  ]);
  matchesCache = matchesRes.ok ? await matchesRes.json() : [];
  teamsCache = teamsRes.ok ? await teamsRes.json() : [];
  fillSelect(
    matchSelect,
    matchesCache.map((match) => ({
      id: match.id,
      name: `${match.team1 ? match.team1.name : '?'} vs ${match.team2 ? match.team2.name : '?'}`
    }))
  );
  fillSelect(blueTeamSelect, teamsCache);
  fillSelect(redTeamSelect, teamsCache);
  fillSelect(winnerSelect, teamsCache);
}

function updateStatusPill(state) {
  if (!state || state.status === 'idle' || !state.status) {
    gameStatus.textContent = 'Idle';
    return;
  }
  gameStatus.textContent = state.status === 'ongoing' ? 'Live' : 'Completed';
}

async function refreshLiveState() {
  const response = await window.apiClient.apiFetch('/api/broadcast/state');
  if (response.ok) {
    updateStatusPill(await response.json());
  }
}

document.getElementById('start-game-btn').addEventListener('click', async () => {
  const response = await window.apiClient.apiFetch('/api/broadcast/game/start', {
    method: 'POST',
    body: {
      matchId: matchSelect.value,
      blueTeam: teamsCache.find((team) => String(team.id) === blueTeamSelect.value),
      redTeam: teamsCache.find((team) => String(team.id) === redTeamSelect.value)
    }
  });

  if (response.ok) {
    updateStatusPill(await response.json());
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to start the game.');
  }
});

updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const response = await window.apiClient.apiFetch('/api/broadcast/game/update', {
    method: 'PATCH',
    body: {
      blueKills: Number(document.getElementById('blueKills').value),
      redKills: Number(document.getElementById('redKills').value),
      blueGold: Number(document.getElementById('blueGold').value),
      redGold: Number(document.getElementById('redGold').value),
      blueTowers: Number(document.getElementById('blueTowers').value),
      redTowers: Number(document.getElementById('redTowers').value)
    }
  });

  if (response.ok) {
    updateStatusPill(await response.json());
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to push update. Start a game first.');
  }
});

document.getElementById('end-game-btn').addEventListener('click', async () => {
  const response = await window.apiClient.apiFetch('/api/broadcast/game/end', {
    method: 'POST',
    body: { winnerTeamId: winnerSelect.value }
  });

  if (response.ok) {
    updateStatusPill({ status: 'idle' });
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to end the game.');
  }
});

loadLookups().then(refreshLiveState);

if (window.io) {
  const socket = window.io();
  socket.on('hud:update', (state) => updateStatusPill(state));
  socket.on('hud:end', () => updateStatusPill({ status: 'idle' }));
}
