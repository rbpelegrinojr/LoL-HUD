const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, '..', 'data', 'test-crud.db');
fs.rmSync(dbPath, { force: true });
process.env.DB_PATH = dbPath;
process.env.DEFAULT_ADMIN_USER = 'admin';
process.env.DEFAULT_ADMIN_PASSWORD = 'changeme123';

const { createServer } = require('../app');

let httpServer;
let baseUrl;
let cookie;
let csrfToken;

async function jsonFetch(url, options = {}) {
  return fetch(url, options);
}

test.before(async () => {
  const server = await createServer();
  httpServer = server.httpServer;
  await new Promise((resolve) => httpServer.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;

  const loginResponse = await fetch(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'changeme123' })
  });
  cookie = loginResponse.headers.get('set-cookie').split(';')[0];

  const csrfResponse = await fetch(`${baseUrl}/api/csrf-token`, { headers: { cookie } });
  const csrfSetCookie = csrfResponse.headers.get('set-cookie');
  if (csrfSetCookie) {
    cookie = [cookie, csrfSetCookie.split(';')[0]].join('; ');
  }
  const csrfBody = await csrfResponse.json();
  csrfToken = csrfBody.csrfToken;
});

test.after(async () => {
  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
});

function authedJsonHeaders() {
  return { 'Content-Type': 'application/json', cookie, 'x-csrf-token': csrfToken };
}

test('GET /api/tournaments without auth returns 401', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments`);
  assert.equal(response.status, 401);
});

let tournamentId;

test('POST /api/tournaments creates a tournament', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Spring Cup', format: 'Double Elimination' })
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.name, 'Spring Cup');
  tournamentId = body.id;
});

test('POST /api/tournaments without a name is rejected with 422', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({})
  });
  assert.equal(response.status, 422);
});

test('GET /api/tournaments/:id returns the created tournament', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments/${tournamentId}`, { headers: { cookie } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.id, tournamentId);
});

test('PATCH /api/tournaments/:id updates the tournament', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments/${tournamentId}`, {
    method: 'PATCH',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ status: 'ongoing' })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ongoing');
});

test('GET /api/tournaments/:id returns 404 for an unknown id', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments/999999`, { headers: { cookie } });
  assert.equal(response.status, 404);
});

let team1Id;
let team2Id;

test('POST /api/teams creates two teams', async () => {
  const response1 = await jsonFetch(`${baseUrl}/api/teams`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Team Nexus', tag: 'TNX' })
  });
  const body1 = await response1.json();
  assert.equal(response1.status, 201);
  team1Id = body1.id;

  const response2 = await jsonFetch(`${baseUrl}/api/teams`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Team Vertex', tag: 'VTX' })
  });
  const body2 = await response2.json();
  assert.equal(response2.status, 201);
  team2Id = body2.id;
});

test('GET /api/teams lists created teams', async () => {
  const response = await jsonFetch(`${baseUrl}/api/teams`, { headers: { cookie } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(body.length >= 2);
});

let playerId;

test('POST /api/players creates a player linked to a team', async () => {
  const response = await jsonFetch(`${baseUrl}/api/players`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ summoner_name: 'Faker Jr', role: 'mid', team_id: team1Id })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.summoner_name, 'Faker Jr');
  playerId = body.id;
});

test('PATCH /api/players/:id updates the player', async () => {
  const response = await jsonFetch(`${baseUrl}/api/players/${playerId}`, {
    method: 'PATCH',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ role: 'jungle' })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.role, 'jungle');
});

let matchId;

test('POST /api/matches creates a match between the two teams', async () => {
  const response = await jsonFetch(`${baseUrl}/api/matches`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ tournament_id: tournamentId, team1_id: team1Id, team2_id: team2Id, format: 'bo3' })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  matchId = body.id;
});

test('GET /api/matches/:id includes team associations', async () => {
  const response = await jsonFetch(`${baseUrl}/api/matches/${matchId}`, { headers: { cookie } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.team1.id, team1Id);
  assert.equal(body.team2.id, team2Id);
});

test('DELETE /api/players/:id removes the player', async () => {
  const response = await jsonFetch(`${baseUrl}/api/players/${playerId}`, {
    method: 'DELETE',
    headers: { cookie, 'x-csrf-token': csrfToken }
  });
  assert.equal(response.status, 204);

  const showResponse = await jsonFetch(`${baseUrl}/api/players/${playerId}`, { headers: { cookie } });
  assert.equal(showResponse.status, 404);
});

test('DELETE /api/tournaments/:id without a CSRF token is rejected', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: { cookie }
  });
  assert.equal(response.status, 403);
});

test('DELETE /api/tournaments/:id removes the tournament', async () => {
  const response = await jsonFetch(`${baseUrl}/api/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: { cookie, 'x-csrf-token': csrfToken }
  });
  assert.equal(response.status, 204);
});
