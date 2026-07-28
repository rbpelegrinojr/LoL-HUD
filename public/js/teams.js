const teamsBody = document.getElementById('teams-body');
const emptyState = document.getElementById('empty-state');
const teamForm = document.getElementById('team-form');
const teamModalEl = document.getElementById('team-modal');
const teamModal = window.bootstrap ? new window.bootstrap.Modal(teamModalEl) : null;
const modalTitle = document.getElementById('modal-title');

let teamsCache = [];

function renderTeams(teams) {
  teamsBody.innerHTML = '';
  emptyState.classList.toggle('d-none', teams.length > 0);

  teams.forEach((team) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${team.name}</td>
      <td>${team.tag || '—'}</td>
      <td>${team.region || '—'}</td>
      <td>
        <span class="d-inline-block rounded-circle me-1" style="width:14px;height:14px;background:${team.primary_color || '#5c7cfa'};border:1px solid rgba(255,255,255,0.3);"></span>
        <span class="d-inline-block rounded-circle" style="width:14px;height:14px;background:${team.secondary_color || '#0c1330'};border:1px solid rgba(255,255,255,0.3);"></span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${team.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${team.id}">Delete</button>
      </td>
    `;
    teamsBody.appendChild(row);
  });
}

async function loadTeams() {
  const response = await window.apiClient.apiFetch('/api/teams');
  if (!response.ok) {
    return;
  }
  teamsCache = await response.json();
  renderTeams(teamsCache);
}

teamForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('team-id').value;
  const formData = new FormData(teamForm);
  formData.delete('id');

  const response = await window.apiClient.apiFetch(id ? `/api/teams/${id}` : '/api/teams', {
    method: id ? 'PATCH' : 'POST',
    body: formData
  });

  if (response.ok) {
    teamForm.reset();
    document.getElementById('team-id').value = '';
    if (teamModal) {
      teamModal.hide();
    }
    await loadTeams();
  } else {
    const data = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-alert
    alert(data.message || 'Unable to save team.');
  }
});

teamsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const { id, action } = button.dataset;

  if (action === 'edit') {
    const team = teamsCache.find((item) => String(item.id) === id);
    if (!team) {
      return;
    }
    modalTitle.textContent = 'Edit Team';
    document.getElementById('team-id').value = team.id;
    document.getElementById('name').value = team.name || '';
    document.getElementById('tag').value = team.tag || '';
    document.getElementById('region').value = team.region || '';
    document.getElementById('primary_color').value = team.primary_color || '#5c7cfa';
    document.getElementById('secondary_color').value = team.secondary_color || '#0c1330';
    if (teamModal) {
      teamModal.show();
    }
  } else if (action === 'delete') {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this team?')) {
      return;
    }
    const response = await window.apiClient.apiFetch(`/api/teams/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) {
      await loadTeams();
    }
  }
});

document.getElementById('create-btn').addEventListener('click', () => {
  modalTitle.textContent = 'New Team';
  teamForm.reset();
  document.getElementById('team-id').value = '';
});

loadTeams();
