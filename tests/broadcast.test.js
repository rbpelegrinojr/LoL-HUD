const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, '..', 'data', 'test-broadcast.db');
fs.rmSync(dbPath, { force: true });
process.env.DB_PATH = dbPath;
process.env.DEFAULT_ADMIN_USER = 'admin';
process.env.DEFAULT_ADMIN_PASSWORD = 'changeme123';

const { createServer } = require('../app');

let httpServer;
let baseUrl;
let cookie;
let csrfToken;
let tournamentId;
let team1Id;
let team2Id;
let matchId;

function authedJsonHeaders() {
  return { 'Content-Type': 'application/json', cookie, 'x-csrf-token': csrfToken };
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
  csrfToken = (await csrfResponse.json()).csrfToken;

  const tournamentResponse = await fetch(`${baseUrl}/api/tournaments`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Broadcast Cup' })
  });
  tournamentId = (await tournamentResponse.json()).id;

  const team1Response = await fetch(`${baseUrl}/api/teams`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Blue Side FC' })
  });
  team1Id = (await team1Response.json()).id;

  const team2Response = await fetch(`${baseUrl}/api/teams`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ name: 'Red Side FC' })
  });
  team2Id = (await team2Response.json()).id;

  const matchResponse = await fetch(`${baseUrl}/api/matches`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ tournament_id: tournamentId, team1_id: team1Id, team2_id: team2Id, format: 'bo1' })
  });
  matchId = (await matchResponse.json()).id;
});

test.after(async () => {
  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
});

test('GET /api/broadcast/state returns idle before any game starts', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/state`, { headers: { cookie } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'idle');
});

test('POST /api/broadcast/game/start requires matchId, blueTeam, and redTeam', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/game/start`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({})
  });
  assert.equal(response.status, 422);
});

test('POST /api/broadcast/game/start begins a live game', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/game/start`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({
      matchId,
      blueTeam: { id: team1Id, name: 'Blue Side FC' },
      redTeam: { id: team2Id, name: 'Red Side FC' }
    })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ongoing');
  assert.equal(body.matchId, matchId);
});

test('PATCH /api/broadcast/game/update updates live stats', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/game/update`, {
    method: 'PATCH',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ blueKills: 3, redKills: 1 })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.blueKills, 3);
  assert.equal(body.redKills, 1);
});

test('POST /api/broadcast/game/end concludes the live game', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/game/end`, {
    method: 'POST',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ winnerTeamId: team1Id })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'completed');
  assert.equal(body.winnerTeamId, team1Id);

  const stateResponse = await fetch(`${baseUrl}/api/broadcast/state`, { headers: { cookie } });
  const stateBody = await stateResponse.json();
  assert.equal(stateBody.status, 'idle');
});

test('PATCH /api/broadcast/game/update fails when no game is live', async () => {
  const response = await fetch(`${baseUrl}/api/broadcast/game/update`, {
    method: 'PATCH',
    headers: authedJsonHeaders(),
    body: JSON.stringify({ blueKills: 1 })
  });
  assert.equal(response.status, 409);
});
