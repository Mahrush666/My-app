// Groq credentials stay in the Cloudflare secret binding, never in the browser.
const MAX_BYTES = 1024 * 1024;
const formats = new Map([
  ['audio/mp4', 'm4a'], ['audio/x-m4a', 'm4a'], ['audio/m4a', 'm4a'],
  ['audio/webm', 'webm'], ['audio/ogg', 'ogg'], ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'], ['audio/mpeg', 'mp3'],
]);

async function readClip(request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function handleRequest(request, env, upstreamFetch = fetch) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const headers = {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin'};
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
  if (!origin || !allowed.includes(origin)) return reply({error: 'origin_not_allowed'}, 403);
  headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type';
  if (new URL(request.url).pathname !== '/transcribe') return reply({error: 'not_found'}, 404);
  if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (request.method !== 'POST') return reply({error: 'method_not_allowed'}, 405);
  if (!env.GROQ_API_KEY || !env.SPEECH_RATE_LIMITER) return reply({error: 'not_configured'}, 503);
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const extension = formats.get(type);
  if (!extension) return reply({error: 'unsupported_audio'}, 415);
  // IP limits are a best-effort abuse guard. Groq enforces the account's free quota.
  const {success} = await env.SPEECH_RATE_LIMITER.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'});
  if (!success) return reply({error: 'busy'}, 429);
  try {
    const bytes = await readClip(request);
    if (!bytes) return reply({error: 'clip_too_large'}, 413);
    if (bytes.byteLength < 200) return reply({status: 'unclear', transcript: ''});
    const form = new FormData();
    form.set('file', new Blob([bytes], {type}), `recording.${extension}`);
    form.set('model', 'whisper-large-v3-turbo');
    form.set('language', 'en');
    form.set('response_format', 'verbose_json');
    form.set('temperature', '0');
    // Do not prompt with the expected answer: that can bias short/silent clips.
    const response = await upstreamFetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST', headers: {Authorization: `Bearer ${env.GROQ_API_KEY}`},
      body: form, signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return reply({error: response.status === 429 ? 'busy' : 'service_unavailable'}, response.status === 429 ? 429 : 502);
    const data = await response.json();
    const transcript = typeof data.text === 'string' ? data.text.trim().slice(0, 300) : '';
    const segments = Array.isArray(data.segments) ? data.segments : [];
    if (typeof data.duration !== 'number' || data.duration > 12) return reply({error: 'invalid_clip'}, 422);
    const hasSpeech = segments.some(s => typeof s.no_speech_prob === 'number' && s.no_speech_prob < 0.6 && typeof s.avg_logprob === 'number' && s.avg_logprob > -1);
    if (!transcript || !hasSpeech) return reply({status: 'unclear', transcript: ''});
    return reply({status: 'recognized', transcript});
  } catch {
    // Never return provider errors, audio, credentials or transcripts in logs.
    return reply({error: 'service_unavailable'}, 502);
  }
}

export default {fetch: (request, env) => handleRequest(request, env)};
