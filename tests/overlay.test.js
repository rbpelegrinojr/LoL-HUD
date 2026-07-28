const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, '..', 'data', 'test-overlay.db');
fs.rmSync(dbPath, { force: true });
process.env.DB_PATH = dbPath;

const { createServer } = require('../app');

let httpServer;
let baseUrl;

test.before(async () => {
  const server = await createServer();
  httpServer = server.httpServer;
  await new Promise((resolve) => httpServer.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
});

const overlays = ['scoreboard', 'series-score', 'player-cam', 'event-feed'];

overlays.forEach((name) => {
  test(`GET /overlay/${name} returns 200 HTML`, async () => {
    const response = await fetch(`${baseUrl}/overlay/${name}`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(body, /<html/i);
  });
});

test('GET /overlay/unknown returns 404', async () => {
  const response = await fetch(`${baseUrl}/overlay/unknown`);
  assert.equal(response.status, 404);
});
