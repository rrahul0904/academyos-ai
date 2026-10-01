import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, resolveRequestPath } from '../server.mjs';

test('root resolves to the SPA shell', () => {
  assert.match(resolveRequestPath('/'), /public[\\/]index\.html$/);
});

test('query strings do not affect asset resolution', () => {
  assert.match(resolveRequestPath('/public/app.mjs?v=1'), /public[\\/]app\.mjs$/);
});


test('study provider status defaults to local without credentials', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/study-provider`);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.provider, 'local');
    assert.equal(payload.configured, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('study pack API generates a local pack end to end', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/study-pack`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Retrieval practice',
        sourceText: 'Active recall means retrieving an answer before looking at notes. Spaced repetition schedules reviews across increasing intervals. Feedback after retrieval helps correct errors before they become durable. Interleaving mixes related problem types instead of blocking one type at a time.'
      })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.pack.provider, 'local');
    assert.ok(payload.pack.flashcards.length >= 4);
    assert.ok(payload.pack.quiz.length >= 4);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
