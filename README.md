# WordQuest

Browser English practice for Chinese children aged 7–12, with public student entry and an owner-only teacher dashboard.

## Classroom setup

Open `/teacher` and sign in with the owner's ChatGPT account. Create a class, enter student names (up to 100 per batch), then download their personal codes or QR images. Codes are shown when created or replaced; replacement signs the student out of existing devices. Keep each child's code private.

In Lessons, create a book and unit. Enter vocabulary directly or import a UTF-8 CSV with `english,chinese,sentence,icon` columns; English and Chinese are required. Use the downloadable template. Each unit needs 4–200 different words. Add reading passages, publish the unit, and assign it to a class. The optional starter lesson contains 24 words and three passages. Book-page/PDF extraction is not implemented.

Students open their personal QR link or enter their code. No email or ChatGPT account is required. The saved session lasts 30 days; entering the same code on another device restores online progress. Students choose an assigned book/unit for a guided lesson, flashcards, matching, spelling, Word Reactor, Word Guardians, Star Sprint, and reading. The teacher's Activity view shows reviews, game and exercise accuracy, recording attempts, lesson completions, and approximate lesson minutes.

## Guided learning and games

The Lesson tab selects up to six words, prioritizing mistakes and due reviews while making room for a new word. Its sequence is listening recognition, typed spelling, example-sentence ordering, then paragraph reading. Multiword vocabulary can supply phrase ordering when no example sentence exists. Single words without examples skip sentence ordering. Children can reveal a written hint if sound is unavailable. Reading can be practised without a microphone; paragraph acknowledgements are separate from recording events and are not AI assessments.

Word Reactor is an independently implemented two-minute arena game. Children play a Chinese archer on a pixel-art ancient Chinese street with hopping cartoon jiangshi. They choose an arrow or shield play style, collect energy, answer vocabulary challenges, choose attack/shield/speed upgrades, and encounter a final challenge. Original generated artwork and prompts are in `public/game-art/lantern-street/`. Questions and pauses stop the game timer. It uses only the selected unit's vocabulary. No Classroom Survivors code, graphics, sounds, or textbook datasets were imported.

Teacher lesson reports support the last seven days, last thirty days, or all time. Lesson minutes count visible, focused time while the guided lesson is open, capped at thirty minutes per session. Leaving the lesson normally saves an incomplete session; browser termination can lose the unsent duration. These are approximate activity reports, not exam scores. Homework deadlines and independent sentence spaced repetition are not implemented.

## Progress and speech

Online progress uses a hosted D1 database. A small custom spaced-repetition scheduler brings remembered words back after 1, 3, 7, then 14 days; difficult words return after 10 minutes. Flashcards, lesson exercises, and game answers feed the same word schedule. Correct answers before a word is due keep its existing interval, so an immediate correction does not erase a mistake and repeated easy answers do not inflate mastery. Sentence exercises affect their associated vocabulary word. Pending attempts are queued in IndexedDB and retried while the app is open. This does not provide full offline app access. Demo practice stores word progress only on that device and does not submit teacher activity.

Recording and playback depend on device microphone support. Recordings are limited to 30 seconds and are not stored in the database. The optional AI endpoint requires the server-only `OPENAI_API_KEY`. Without it, AI feedback stays unavailable. If connected, a student's explicitly opted-in recording is transcribed and matched against the assigned passage; this is word recognition, not pronunciation or phoneme scoring. AI service access and WeChat microphone behavior have not been verified on classroom devices.

## Development and hosting

Install with `npm run install:ci`, develop with `npm run dev`, and build with `npm run build`. `.openai/hosting.json` declares the Sites project and `DB` binding. Schema-only migrations live in `drizzle/`; apply them through the Sites deployment flow. Set `TEACHER_EMAIL` to the owner email as a server-only secret. Local mock sign-in uses `seedy@sites.test`. Use an ignored `.env` based on `.env.example`; never put service keys in browser code.

## Verification

TypeScript and production build checks, local database migration, assigned-unit access, review scheduling, retry idempotency, student isolation, cross-device progress, teacher metrics, and code/session replacement were checked. Browser checks cover student navigation, flashcards, lesson games, teacher views, and phone layout. Test student data lives only in the local database.

For the guided-learning update, run `node --experimental-strip-types scripts/check-learning.mjs` on Node 22.13 or later. It verifies agreement between browser and database scheduling, retry safety, mistake recovery, repeated-success protection, and adaptive word selection. Local API checks also cover new event kinds, completion/minute aggregation, student isolation, and invalid requests. Real-device WeChat and microphone testing remain necessary.

## GitHub

This source can be stored in your own GitHub repository. Keep it private initially. Exclude `.env`, `.git`, `node_modules`, local databases, student-code exports, and runtime caches when uploading a source archive. The project's `.gitignore` already excludes those runtime locations and environment files.

GitHub stores versioned source; this full application still requires its Worker backend, database, and teacher authentication. GitHub Pages alone cannot run the current server routes. Keep the existing Sites hosting while connecting your GitHub repository, or plan an explicit backend/authentication migration before changing hosting. The database contents are not part of the source repository.

## GitHub Pages test build

The additional `github-pages/` entry includes lessons, local spaced review, games and illustrated reading without a server dependency. See [GitHub Pages setup](github-pages/README.md). This access-test build has device-local progress only; online student accounts, teacher reports and AI listening remain in the original server-backed app.
