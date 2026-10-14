# Classroom migration to Supabase

The classroom uses Supabase project `lzsljehuuezdlssrgzwe` (Singapore). The October 13 WeChat test without VPN passed all five connectivity checks. The October 15 rollout preserved existing student IDs, QR hashes and homework. Live checks covered teacher login, private student access, repeated scans, review saves, completion and new homework. Cloudflare and its private export remain available for rollback.

## Deployment

1. Apply `schema.sql` to project `lzsljehuuezdlssrgzwe`. Tables live in the private `wordquest` schema with RLS enabled. Only `service_role` can execute `public.wordquest_batch`; anonymous and authenticated clients cannot read private tables or execute the RPC.
2. Import the private D1 backup, preserving IDs, password hashes, sessions and student link hashes. Store the SHA-256 verifier of the existing teacher password in `wordquest.config` under `teacher_password_hash`. Neither the password nor the private import belongs in Git.
3. Bundle `edge.ts` and deploy as the `classroom` Edge Function **with JWT verification enabled**. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side. Do not expose the service key in browser configuration.
4. The browser sends the public legacy anon JWT for gateway authentication and its private application session in `X-Wordquest-Session`. The Edge Function forwards only the application session into the existing classroom authorization logic. The public gateway JWT does not grant access to student records.
5. Verify health, teacher login, matching migrated counts, unauthorized access rejection, and real student QR/homework requests. Then change `public/classroom-config.json` to `https://lzsljehuuezdlssrgzwe.supabase.co/functions/v1/classroom` and publish Pages. Keep Cloudflare and its backup for rollback.
6. Verify homework in WeChat without VPN. Previously generated QR records remain reusable unless the teacher has explicitly replaced or disabled them. Older locally saved QR images may already have been replaced; compare their hashes before using them for migration validation.

## Local verification

Run from the app root with Node 22.13 or newer:

```sh
npm run build:classroom
node --test classroom-backend/worker.test.mjs
npm install --prefix .wrangler/pg-qa --no-save @electric-sql/pglite@0.5.9
WORDQUEST_TEST_DATABASE=postgres node --test classroom-backend/worker.test.mjs supabase/classroom/database.test.mjs
```

PGlite runs the actual Postgres schema and RPC locally. The same classroom tests cover authentication, roster changes, assignment boundaries, idempotent review events, completion, repeated QR scans, rotation and revocation. Additional tests verify transaction rollback, quoted input, millisecond timestamps and denied anonymous database access.
