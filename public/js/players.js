const playersBody = document.getElementById('players-body');
const emptyState = document.getElementById('empty-state');
const playerForm = document.getElementById('player-form');
const playerModalEl = document.getElementById('player-modal');
const playerModal = window.bootstrap ? new window.bootstrap.Modal(playerModalEl) : null;
const modalTitle = document.getElementById('modal-title');
const teamSelect = document.getElementById('team_id');

let playersCache = [];
let teamsCache = [];

function renderTeamOptions() {
  teamSelect.innerHTML = '<option value="">Free agent</option>';
  teamsCache.forEach((team) => {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = team.name;
    teamSelect.appendChild(option);
  });
}

function renderPlayers(players) {
  playersBody.innerHTML = '';
  emptyState.classList.toggle('d-none', players.length > 0);

  players.forEach((player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.summoner_name}</td>
      <td>${player.real_name || '—'}</td>
      <td>${player.role || '—'}</td>
      <td>${player.team ? player.team.name : '—'}</td>
      <td>${player.is_active ? 'Yes' : 'No'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${player.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${player.id}">Delete</button>
      </td>
    `;
    playersBody.appendChild(row);
  });
}

async function loadTeams() {
  const response = await window.apiClient.apiFetch('/api/teams');
  if (response.ok) {
    teamsCache = await response.json();
    renderTeamOptions();
  }
}

async function loadPlayers() {
  const response = await window.apiClient.apiFetch('/api/players');
  if (!response.ok) {
    return;
  }
  playersCache = await response.json();
  renderPlayers(playersCache);
}

playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('player-id').value;
  const formData = new FormData(playerForm);
  formData.delete('id');
  formData.set('is_active', document.getElementById('is_active').checked ? 'true' : 'false');
  if (!formData.get('team_id')) {
    formData.delete('team_id');
  }

  const response = await window.apiClient.apiFetch(id ? `/api/players/${id}` : '/api/players', {
    method: id ? 'PATCH' : 'POST',
    body: formData
  });

  if (response.ok) {
    playerForm.reset();
    document.getElementById('player-id').value = '';
    if (playerModal) {
      playerModal.hide();
    }
    await loadPlayers();
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to save player.');
  }
});

playersBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const { id, action } = button.dataset;

  if (action === 'edit') {
    const player = playersCache.find((item) => String(item.id) === id);
    if (!player) {
      return;
    }
    modalTitle.textContent = 'Edit Player';
    document.getElementById('player-id').value = player.id;
    document.getElementById('summoner_name').value = player.summoner_name || '';
    document.getElementById('real_name').value = player.real_name || '';
    document.getElementById('role').value = player.role || '';
    document.getElementById('team_id').value = player.team_id || '';
    document.getElementById('nationality').value = player.nationality || '';
    document.getElementById('is_active').checked = Boolean(player.is_active);
    if (playerModal) {
      playerModal.show();
    }
  } else if (action === 'delete') {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this player?')) {
      return;
    }
    const response = await window.apiClient.apiFetch(`/api/players/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) {
      await loadPlayers();
    }
  }
});

document.getElementById('create-btn').addEventListener('click', () => {
  modalTitle.textContent = 'New Player';
  playerForm.reset();
  document.getElementById('player-id').value = '';
});

loadTeams().then(loadPlayers);
