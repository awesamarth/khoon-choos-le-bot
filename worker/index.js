import { TwitterApi } from 'twitter-api-v2';

export const videoTweetUrl = 'https://x.com/khoon_choos_le/status/1840617572120625549/video/1';

export async function scheduledPost(env, createClient = credentials => new TwitterApi(credentials).readWrite) {
  if (env.POSTING_ENABLED !== 'true') return { status: 'disabled' };
  const names = ['API_KEY', 'API_KEY_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET'];
  if (names.some(name => !env[name])) throw new Error('Required X credentials are missing.');
  try {
    const client = createClient({ appKey: env.API_KEY, appSecret: env.API_KEY_SECRET, accessToken: env.ACCESS_TOKEN, accessSecret: env.ACCESS_TOKEN_SECRET });
    await client.v2.tweet({ text: videoTweetUrl });
    return { status: 'posted' };
  } catch {
    throw new Error('X posting failed. Check credentials, write permission and entitlement.');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return new Response('Not found', { status: 404 });
    if (url.pathname === '/tweet') {
      if (!env.SECRET_KEY || url.searchParams.get('secret') !== env.SECRET_KEY) {
        return new Response('Unauthorized', { status: 403 });
      }
      try {
        const result = await scheduledPost(env);
        return new Response(result.status === 'posted' ? 'Tweet sent successfully' : 'Posting is disabled', { status: result.status === 'posted' ? 200 : 503 });
      } catch {
        return new Response('Tweet failed', { status: 502 });
      }
    }
    if (url.pathname !== '/') return new Response('Not found', { status: 404 });
    return Response.json({ service: 'khoon-choos-le-bot', postingEnabled: env.POSTING_ENABLED === 'true', schedule: 'Mondays 05:00 UTC / 10:30 Asia/Kolkata' });
  },
  async scheduled(controller, env) {
    // Avoid retries after ambiguous API responses, which could duplicate a tweet.
    controller.noRetry();
    const result = await scheduledPost(env);
    console.log(`Monday post status: ${result.status}`);
  },
};
