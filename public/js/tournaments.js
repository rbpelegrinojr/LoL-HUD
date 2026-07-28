const tournamentsBody = document.getElementById('tournaments-body');
const emptyState = document.getElementById('empty-state');
const tournamentForm = document.getElementById('tournament-form');
const tournamentModalEl = document.getElementById('tournament-modal');
const tournamentModal = window.bootstrap ? new window.bootstrap.Modal(tournamentModalEl) : null;
const modalTitle = document.getElementById('modal-title');
const ongoingCount = document.getElementById('ongoing-count');

function statusBadgeClass(status) {
  return { upcoming: 'text-bg-secondary', ongoing: 'text-bg-success', completed: 'text-bg-info' }[status] || 'text-bg-secondary';
}

function renderTournaments(tournaments) {
  tournamentsBody.innerHTML = '';
  emptyState.classList.toggle('d-none', tournaments.length > 0);

  const ongoing = tournaments.filter((tournament) => tournament.status === 'ongoing').length;
  ongoingCount.textContent = `${ongoing} ongoing`;

  tournaments.forEach((tournament) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${tournament.name}</td>
      <td>${tournament.short_name || '—'}</td>
      <td>${tournament.format || '—'}</td>
      <td><span class="badge ${statusBadgeClass(tournament.status)}">${tournament.status}</span></td>
      <td>${tournament.start_date || '—'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${tournament.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${tournament.id}">Delete</button>
      </td>
    `;
    tournamentsBody.appendChild(row);
  });
}

let tournamentsCache = [];

async function loadTournaments() {
  const response = await window.apiClient.apiFetch('/api/tournaments');
  if (!response.ok) {
    return;
  }
  tournamentsCache = await response.json();
  renderTournaments(tournamentsCache);
}

tournamentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('tournament-id').value;
  const formData = new FormData(tournamentForm);
  formData.delete('id');

  const response = await window.apiClient.apiFetch(id ? `/api/tournaments/${id}` : '/api/tournaments', {
    method: id ? 'PATCH' : 'POST',
    body: formData
  });

  if (response.ok) {
    tournamentForm.reset();
    document.getElementById('tournament-id').value = '';
    if (tournamentModal) {
      tournamentModal.hide();
    }
    await loadTournaments();
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to save tournament.');
  }
});

tournamentsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const { id, action } = button.dataset;

  if (action === 'edit') {
    const tournament = tournamentsCache.find((item) => String(item.id) === id);
    if (!tournament) {
      return;
    }
    modalTitle.textContent = 'Edit Tournament';
    document.getElementById('tournament-id').value = tournament.id;
    document.getElementById('name').value = tournament.name || '';
    document.getElementById('short_name').value = tournament.short_name || '';
    document.getElementById('format').value = tournament.format || '';
    document.getElementById('status').value = tournament.status || 'upcoming';
    document.getElementById('start_date').value = tournament.start_date || '';
    document.getElementById('end_date').value = tournament.end_date || '';
    if (tournamentModal) {
      tournamentModal.show();
    }
  } else if (action === 'delete') {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this tournament?')) {
      return;
    }
    const response = await window.apiClient.apiFetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) {
      await loadTournaments();
    }
  }
});

document.getElementById('create-btn').addEventListener('click', () => {
  modalTitle.textContent = 'New Tournament';
  tournamentForm.reset();
  document.getElementById('tournament-id').value = '';
});

loadTournaments();

if (window.io) {
  const socket = window.io();
  socket.on('hud:update', () => loadTournaments());
  socket.on('hud:end', () => loadTournaments());
}
