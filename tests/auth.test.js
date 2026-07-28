const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, '..', 'data', 'test-auth.db');
fs.rmSync(dbPath, { force: true });
process.env.DB_PATH = dbPath;
process.env.DEFAULT_ADMIN_USER = 'admin';
process.env.DEFAULT_ADMIN_PASSWORD = 'changeme123';

const { createServer } = require('../app');

async function startTestServer() {
  const { httpServer } = await createServer();
  await new Promise((resolve) => httpServer.listen(0, resolve));
  const { port } = httpServer.address();
  return { httpServer, baseUrl: `http://127.0.0.1:${port}` };
}

async function closeServer(httpServer) {
  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
}

function extractCookie(response) {
  const setCookie = response.headers.get('set-cookie');
  return setCookie ? setCookie.split(';')[0] : null;
}

let sharedServer;
let sharedBaseUrl;
let sessionCookie;

test.before(async () => {
  const { httpServer, baseUrl } = await startTestServer();
  sharedServer = httpServer;
  sharedBaseUrl = baseUrl;
});

test.after(async () => {
  await closeServer(sharedServer);
});

test('POST /admin/login succeeds with valid credentials and sets a session cookie', async () => {
  const response = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'changeme123' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.redirect, '/admin/dashboard');

  sessionCookie = extractCookie(response);
  assert.ok(sessionCookie);
});

test('POST /admin/login fails with invalid credentials', async () => {
  const response = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, 'Invalid credentials');
});

test('GET /admin/dashboard redirects to login without a session', async () => {
  const response = await fetch(`${sharedBaseUrl}/admin/dashboard`, { redirect: 'manual' });
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /\/admin\/login/);
});

test('GET /admin/dashboard succeeds with a valid session cookie', async () => {
  const response = await fetch(`${sharedBaseUrl}/admin/dashboard`, {
    headers: { cookie: sessionCookie }
  });
  assert.equal(response.status, 200);
});

test('POST /admin/login is rate limited after repeated failed attempts', async () => {
  // Two prior POST /admin/login requests (valid + invalid) already counted
  // towards the limiter above; three more keep us at the limit boundary.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(`${sharedBaseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
    });
    assert.equal(response.status, 401);
  }

  const limitedResponse = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
  });

  assert.equal(limitedResponse.status, 429);
});
