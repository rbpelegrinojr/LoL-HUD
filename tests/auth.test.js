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
  const setCookie = response.headers.getSetCookie ? response.headers.getSetCookie() : [response.headers.get('set-cookie')];
  return setCookie.filter(Boolean).map((cookie) => cookie.split(';')[0]);
}

async function fetchLoginForm(baseUrl) {
  const response = await fetch(`${baseUrl}/admin/login`);
  const html = await response.text();
  const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
  const cookies = extractCookie(response);
  return { csrfToken: match ? match[1] : null, cookie: cookies.join('; ') };
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
  const { csrfToken, cookie } = await fetchLoginForm(sharedBaseUrl);
  const response = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken, cookie },
    body: JSON.stringify({ username: 'admin', password: 'changeme123' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.redirect, '/admin/dashboard');

  const cookies = extractCookie(response);
  sessionCookie = cookies.find((value) => value.startsWith('lol-hud.sid=')) || cookies[0];
  assert.ok(sessionCookie);
});

test('POST /admin/login fails with invalid credentials', async () => {
  const { csrfToken, cookie } = await fetchLoginForm(sharedBaseUrl);
  const response = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken, cookie },
    body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, 'Invalid credentials');
});

test('POST /admin/login without a CSRF token is rejected', async () => {
  const response = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'changeme123' })
  });

  assert.equal(response.status, 403);
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
  // Three prior POST /admin/login requests (valid + invalid + missing csrf)
  // already counted towards the limiter above; two more keep us at the limit
  // boundary before the 6th request trips the 429 response.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { csrfToken, cookie } = await fetchLoginForm(sharedBaseUrl);
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(`${sharedBaseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken, cookie },
      body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
    });
    assert.equal(response.status, 401);
  }

  const { csrfToken, cookie } = await fetchLoginForm(sharedBaseUrl);
  const limitedResponse = await fetch(`${sharedBaseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken, cookie },
    body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
  });

  assert.equal(limitedResponse.status, 429);
});
