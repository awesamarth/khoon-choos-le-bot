import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { scheduledPost, videoTweetUrl } from '../worker/index.js';
const env = { POSTING_ENABLED: 'true', API_KEY: 'mock', API_KEY_SECRET: 'mock', ACCESS_TOKEN: 'mock', ACCESS_TOKEN_SECRET: 'mock' };
test('disabled cron cannot create a client or post', async () => {
  assert.deepEqual(await scheduledPost({}, () => assert.fail('must not create client')), { status: 'disabled' });
});
test('missing secrets stop posting', async () => {
  await assert.rejects(scheduledPost({ POSTING_ENABLED: 'true' }, () => assert.fail()), /credentials are missing/);
});
test('worker preserves original payload and posts once', async () => {
  let calls = 0;
  assert.deepEqual(await scheduledPost(env, () => ({ v2: { async tweet(payload) { calls++; assert.deepEqual(payload, { text: videoTweetUrl }); } } })), { status: 'posted' });
  assert.equal(calls, 1);
});
test('API errors are sanitized and never retried', async () => {
  let calls = 0;
  await assert.rejects(scheduledPost(env, () => ({ v2: { async tweet() { calls++; throw new Error('secret-bearing mock error'); } } })), error => error.message === 'X posting failed. Check credentials, write permission and entitlement.');
  assert.equal(calls, 1);
});
test('health route is harmless and no HTTP posting route exists', async () => {
  const response = worker.fetch(new Request('https://example.test/'), {});
  assert.equal((await response.json()).postingEnabled, false);
  assert.equal(worker.fetch(new Request('https://example.test/tweet?secret=mock'), env).status, 404);
});
test('scheduled handler disables automatic retry and respects posting gate', async () => {
  let calls = 0;
  await worker.scheduled({ noRetry() { calls++; } }, {});
  assert.equal(calls, 1);
});
