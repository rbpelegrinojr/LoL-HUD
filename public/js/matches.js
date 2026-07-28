const matchesBody = document.getElementById('matches-body');
const emptyState = document.getElementById('empty-state');
const matchForm = document.getElementById('match-form');
const matchModalEl = document.getElementById('match-modal');
const matchModal = window.bootstrap ? new window.bootstrap.Modal(matchModalEl) : null;
const modalTitle = document.getElementById('modal-title');
const tournamentSelect = document.getElementById('tournament_id');
const team1Select = document.getElementById('team1_id');
const team2Select = document.getElementById('team2_id');

let matchesCache = [];
let tournamentsCache = [];
let teamsCache = [];

function fillSelect(select, items, placeholder) {
  select.innerHTML = placeholder ? `<option value="">${placeholder}</option>` : '';
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function renderMatches(matches) {
  matchesBody.innerHTML = '';
  emptyState.classList.toggle('d-none', matches.length > 0);

  matches.forEach((match) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${match.tournament ? match.tournament.name : '—'}</td>
      <td>${match.team1 ? match.team1.name : '—'}</td>
      <td>${match.team2 ? match.team2.name : '—'}</td>
      <td>${match.format}</td>
      <td>${match.team1_score} - ${match.team2_score}</td>
      <td><span class="badge text-bg-secondary">${match.status}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${match.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${match.id}">Delete</button>
      </td>
    `;
    matchesBody.appendChild(row);
  });
}

async function loadLookups() {
  const [tournamentsRes, teamsRes] = await Promise.all([
    window.apiClient.apiFetch('/api/tournaments'),
    window.apiClient.apiFetch('/api/teams')
  ]);
  tournamentsCache = tournamentsRes.ok ? await tournamentsRes.json() : [];
  teamsCache = teamsRes.ok ? await teamsRes.json() : [];
  fillSelect(tournamentSelect, tournamentsCache);
  fillSelect(team1Select, teamsCache);
  fillSelect(team2Select, teamsCache);
}

async function loadMatches() {
  const response = await window.apiClient.apiFetch('/api/matches');
  if (!response.ok) {
    return;
  }
  matchesCache = await response.json();
  renderMatches(matchesCache);
}

matchForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('match-id').value;
  const formData = new FormData(matchForm);
  formData.delete('id');
  const payload = Object.fromEntries(formData.entries());

  const response = await window.apiClient.apiFetch(id ? `/api/matches/${id}` : '/api/matches', {
    method: id ? 'PATCH' : 'POST',
    body: payload
  });

  if (response.ok) {
    matchForm.reset();
    document.getElementById('match-id').value = '';
    if (matchModal) {
      matchModal.hide();
    }
    await loadMatches();
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to save match.');
  }
});

matchesBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const { id, action } = button.dataset;

  if (action === 'edit') {
    const match = matchesCache.find((item) => String(item.id) === id);
    if (!match) {
      return;
    }
    modalTitle.textContent = 'Edit Match';
    document.getElementById('match-id').value = match.id;
    document.getElementById('tournament_id').value = match.tournament_id;
    document.getElementById('team1_id').value = match.team1_id;
    document.getElementById('team2_id').value = match.team2_id;
    document.getElementById('format').value = match.format;
    document.getElementById('status').value = match.status;
    document.getElementById('stage').value = match.stage || '';
    document.getElementById('scheduled_at').value = match.scheduled_at ? match.scheduled_at.slice(0, 16) : '';
    if (matchModal) {
      matchModal.show();
    }
  } else if (action === 'delete') {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this match?')) {
      return;
    }
    const response = await window.apiClient.apiFetch(`/api/matches/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) {
      await loadMatches();
    }
  }
});

document.getElementById('create-btn').addEventListener('click', () => {
  modalTitle.textContent = 'New Match';
  matchForm.reset();
  document.getElementById('match-id').value = '';
});

loadLookups().then(loadMatches);
