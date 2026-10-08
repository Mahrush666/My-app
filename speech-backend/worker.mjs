// Groq credentials stay in the Cloudflare secret binding, never in the browser.
const MAX_BYTES = 1024 * 1024;
const formats = new Map([
  ['audio/mp4', 'm4a'], ['audio/x-m4a', 'm4a'], ['audio/m4a', 'm4a'],
  ['audio/webm', 'webm'], ['audio/ogg', 'ogg'], ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'], ['audio/mpeg', 'mp3'],
]);

async function readClip(request, maxBytes = MAX_BYTES) {
  if (Number(request.headers.get('content-length')) > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

// Reject genuinely silent PCM WAV clips before asking the transcription model.
export function silentPcmWav(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const label = offset => String.fromCharCode(...bytes.slice(offset, offset + 4));
  if (bytes.length < 44 || label(0) !== 'RIFF' || label(8) !== 'WAVE') return false;
  let pcm16 = false;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = view.getUint32(offset + 4, true), start = offset + 8;
    if (start + size > bytes.length) return false;
    if (label(offset) === 'fmt ' && size >= 16) pcm16 = view.getUint16(start, true) === 1 && view.getUint16(start + 14, true) === 16;
    if (label(offset) === 'data' && pcm16) {
      if (size < 2) return true;
      let sum = 0;
      for (let i = start; i + 1 < start + size; i += 2) { const x = view.getInt16(i, true) / 32768; sum += x * x; }
      return Math.sqrt(sum / Math.floor(size / 2)) < 0.003;
    }
    offset = start + size + (size % 2);
  }
  return false;
}

export async function handleRequest(request, env, upstreamFetch = fetch) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const headers = {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin'};
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
  const path = new URL(request.url).pathname;
  // A public, read-only status page makes phone connectivity testable directly.
  if (path === '/health' && request.method === 'GET') {
    if (origin && !allowed.includes(origin)) return reply({error: 'origin_not_allowed'}, 403);
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    const ready = Boolean(env.GROQ_API_KEY && env.SPEECH_RATE_LIMITER);
    return reply({status: ready ? 'ready' : 'not_configured'}, ready ? 200 : 503);
  }
  if (!origin || !allowed.includes(origin)) return reply({error: 'origin_not_allowed'}, 403);
  headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type';
  if (path !== '/transcribe') return reply({error: 'not_found'}, 404);
  if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (request.method !== 'POST') return reply({error: 'method_not_allowed'}, 405);
  if (!env.GROQ_API_KEY || !env.SPEECH_RATE_LIMITER) return reply({error: 'not_configured'}, 503);
  let type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const multipart = type === 'multipart/form-data';
  if (!multipart && !formats.has(type)) return reply({error: 'unsupported_audio'}, 415);
  // IP limits are a best-effort abuse guard. Groq enforces the account's free quota.
  const {success} = await env.SPEECH_RATE_LIMITER.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'});
  if (!success) return reply({error: 'busy'}, 429);
  try {
    let bytes = await readClip(request, multipart ? MAX_BYTES + 16384 : MAX_BYTES);
    if (!bytes) return reply({error: 'clip_too_large'}, 413);
    if (multipart) {
      let upload;
      try {upload = (await new Response(bytes, {headers: {'Content-Type': request.headers.get('Content-Type')}}).formData()).get('file');}
      catch {return reply({error: 'unsupported_audio'}, 415);}
      if (!upload || typeof upload.arrayBuffer !== 'function') return reply({error: 'unsupported_audio'}, 415);
      if (upload.size > MAX_BYTES) return reply({error: 'clip_too_large'}, 413);
      type = upload.type.split(';')[0].trim().toLowerCase();
      if (!formats.has(type)) return reply({error: 'unsupported_audio'}, 415);
      bytes = new Uint8Array(await upload.arrayBuffer());
    }
    const extension = formats.get(type);
    if (bytes.byteLength < 200 || silentPcmWav(bytes)) return reply({status: 'unclear', transcript: ''});
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
