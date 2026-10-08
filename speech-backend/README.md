# WordQuest voice checking: Cloudflare Free + Groq Free

The Worker forwards short recordings to Groq Whisper Turbo using a Cloudflare secret. It does not store audio or deliberately log audio/transcripts. The app compares recognized English with the flashcard and updates the existing spaced-review schedule. This is word recognition, not pronunciation scoring.

## Activate

1. Create/sign in to Cloudflare and Groq accounts. Keep both on Free.
2. Create a Groq API key. Enter it directly into the Cloudflare secret below, never into a chat, public repository or browser app.
3. From the app root:
   ```sh
   npx wrangler login
   npx wrangler secret put GROQ_API_KEY --config speech-backend/wrangler.jsonc
   npx wrangler deploy --config speech-backend/wrangler.jsonc
   ```
4. Set `public/speech-config.json` to the actual deployed URL, then publish this file with the app:
   ```json
   {"endpoint":"https://wordquest-speech.YOUR-SUBDOMAIN.workers.dev/transcribe"}
   ```
   This public endpoint URL is not a credential. Never include the Groq key here.
5. A parent/teacher enables voice checking in Look & say. Record a word, stop and wait for the result. Test correct words, different words, silence and connection loss with actual children. Test on a phone inside WeChat with VPN disabled before classroom rollout.

Incomplete setup is clearly shown in the app. Failed/unclear checks do not schedule a card; manual adult ratings remain available. Only the first graded attempt updates each card's review schedule.

## Limits and handling

Clips are capped at ten seconds in the UI, one MB while uploading, and twelve seconds in the provider's duration metadata. Speech/silence confidence metadata guards against unclear recordings, but does not guarantee accuracy. The expected answer is never sent as a recognition prompt.

Allowed origins restrict browsers, not determined callers who spoof headers. The no-login endpoint is public. A best-effort per-IP limiter mitigates repeated requests; Groq's free account quota is the final cap. Shared mobile IPs can hit the limiter. Keep Groq on Free; this Worker does not enforce a global spending limit for paid accounts.

There is no audio database or transcript logging in this Worker. Cloudflare and Groq process audio under their own policies. Review those policies and obtain parental consent before classroom use.

Default allowed origin: `https://mahrush666.github.io`. For local testing add the actual localhost origin to a local configuration, removing it before deploy. Do not add `*`. Provider quotas can change. Local tests do not verify mainland-China/WeChat connectivity.

## Verify without credentials

```sh
node --test speech-backend/worker.test.mjs
npm run build:pages
npx wrangler deploy --dry-run --config speech-backend/wrangler.jsonc
```
