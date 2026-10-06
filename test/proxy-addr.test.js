import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const dependencyRequire = createRequire(require.resolve('express'));
test('patched proxy-addr rejects spoofed IPv4 trust through short IPv6 prefixes', () => {
  const proxyaddr = dependencyRequire('proxy-addr');
  assert.equal(dependencyRequire('proxy-addr/package.json').version, '2.0.8');
  assert.equal(proxyaddr.compile('::ffff:10.0.0.0/8')('203.0.113.1'), false);
  assert.equal(proxyaddr.compile('::/1')('203.0.113.1'), false);
  const trust = proxyaddr.compile('::ffff:10.0.0.0/104');
  assert.equal(trust('10.1.2.3'), true);
  assert.equal(trust('203.0.113.1'), false);
});
