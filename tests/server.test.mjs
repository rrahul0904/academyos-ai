import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestPath } from '../server.mjs';

test('root resolves to the SPA shell', () => {
  assert.match(resolveRequestPath('/'), /public[\\/]index\.html$/);
});

test('query strings do not affect asset resolution', () => {
  assert.match(resolveRequestPath('/public/app.mjs?v=1'), /public[\\/]app\.mjs$/);
});
