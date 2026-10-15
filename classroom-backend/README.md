# WordQuest classroom backend

Status: deployed to Cloudflare Workers and D1 on October 12, 2026. Live API tests passed; China/WeChat access still needs the teacher’s phone test. Endpoint: https://wordquest-classroom.makhmetshin1907.workers.dev. The GitHub Pages app continues to work without accounts. Its Classes & families screen has an explicit connection test; family sign-in stays disabled until a configured backend is reachable.

## What it provides

- One private teacher account (password supplied as a Worker secret).
- Parent registration/login, multiple child profiles per family, class invitation codes and teacher approval.
- Class-specific assignments: book/unit, activity types, selected vocabulary and optional due date. At least four vocabulary items are required for multiple-choice activities. Reading/story assignments currently include the whole selected lesson rather than individual paragraphs.
- Automatic homework completion: each assigned checked-answer activity finishes after every selected word has a saved correct answer (corrections count). Guided lessons require listening, spelling and sentence questions. Self-rated cards, video, story, listening and reading remain accessible as extra practice. Completed status persists across QR scans; editing an assignment resets its requirements while preserving SRS and answer history. Answer counts and completion are practice records, not proficiency scores.
- Hashed sessions, salted PBKDF2 passwords, access checks for each child/assignment, login throttling, request-size limits, origin restrictions. No audio or speech recognition.
- Password recovery, account deletion UI, offline answer queue, multi-teacher organizations and email verification are not included in this pilot. Parents must keep their login name/password. Keep the first test to teacher-created test accounts until real WeChat connectivity and account lifecycle requirements are settled.

## Connect using your existing Cloudflare account

1. In **Storage & databases → D1**, create a database named **wordquest-classroom**.
2. Open that database's console and run the complete contents of `schema.sql` once. Statements are safe to rerun; they do not erase existing data.
3. In **Workers & Pages**, create a separate Worker named **wordquest-classroom**. Keep the speech Worker separate.
4. Deploy the bundled `outputs/wordquest-classroom-worker.js` file through the Worker editor (or upload it as the Worker script).
5. Add a **D1 database binding** named **DB**, selecting the database above.
6. Add a text variable **ALLOWED_ORIGINS** with `https://mahrush666.github.io`.
7. Add an encrypted secret **TEACHER_PASSWORD** with a unique strong password. Enter it directly in Cloudflare; never paste it into GitHub or chat. Redeploy after changing settings.
8. Open the Worker's `/health` address. It must return `{"status":"ready"}`. The health endpoint checks the database schema and teacher secret without showing credentials.
9. In the app's **Classes & families** screen, paste the Worker base URL, tap **Test connection**, and sign in as teacher. Test this on your phone in WeChat, without VPN. An agent-side successful test does not establish China/WeChat reachability.
10. Once that test succeeds, put the base URL in `public/classroom-config.json` as `{"endpoint":"https://YOUR-BACKEND"}` and publish. This contains a public address only. Parents will then connect automatically, using the same endpoint and database. No password/API key goes in this file.

The default workers.dev address is only a connection candidate: the previous speech Worker was unreachable from the teacher's phone. If this one is also unreachable, stop onboarding families and choose a reachable host or test a domain before purchase. Standard Cloudflare free Workers are not Cloudflare's paid China Network. The frontend remains on GitHub Pages.

### CLI alternative

From the repository root, using Node 22+ and Wrangler:

```sh
npx wrangler login
npx wrangler d1 create wordquest-classroom
```

Replace `REPLACE_WITH_DATABASE_ID` in `classroom-backend/wrangler.jsonc` with the returned database ID, then:

```sh
npx wrangler d1 execute wordquest-classroom --remote --file classroom-backend/schema.sql --config classroom-backend/wrangler.jsonc
npx wrangler secret put TEACHER_PASSWORD --config classroom-backend/wrangler.jsonc
npx wrangler deploy --config classroom-backend/wrangler.jsonc
```

Keep the account on the free plan for the pilot. The app does not configure billing or opt into a paid plan. Cloudflare D1/Workers free quotas still apply.

## Build and verify

```sh
npx vite build --config classroom-backend/vite.config.ts
node --test classroom-backend/worker.test.mjs
npx tsc --noEmit --incremental false
npm run build:pages
```

Tests use real SQLite with an adapter for D1's methods. They exercise registration/login, invitations, class separation, teacher approval/revocation, assignment edits, child ownership, unauthorized activities/words, shared review timing, duplicate events and teacher reports. A deployed D1 test remains necessary.

## Local demo before connection
Run `npm run preview:classroom`, then open `http://127.0.0.1:5174/#view=classroom`. The demo teacher password is `local-demo-only`. All demo profiles and results are temporary and disappear on shutdown. This server listens only on this computer; its address is not a student mobile QR destination. Production still requires a deployed database and secret.

When publishing new lesson content or activity types, redeploy the classroom Worker as well as the frontend: both use the same lesson catalogue.
