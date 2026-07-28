const test = require('node:test');
const assert = require('node:assert/strict');

const { createServer } = require('../app');

test('health endpoint returns ok status', async () => {
  const { httpServer } = await createServer();

  await new Promise((resolve) => httpServer.listen(0, resolve));

  const { port } = httpServer.address();
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, 'ok');
  assert.ok(payload.app.name);

  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
});

test('admin login page is served', async () => {
  const { httpServer } = await createServer();

  await new Promise((resolve) => httpServer.listen(0, resolve));

  const { port } = httpServer.address();
  const response = await fetch(`http://127.0.0.1:${port}/admin/login`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Tournament Admin Login/);

  await new Promise((resolve, reject) => httpServer.close((error) => (error ? reject(error) : resolve())));
});
