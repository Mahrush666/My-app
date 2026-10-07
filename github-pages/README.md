# GitHub Pages access test

This is an additional static entry point for the existing WordQuest app. It includes the current archer game, all other games, guided exercises, local spaced review and the illustrated monkey-and-shark lesson. It does not publish student records, codes or credentials.

Progress is saved only in this browser, shared by people using the same browser. There is no teacher login, online reporting, cross-device synchronization or AI analysis in this access-test version. Recording/playback depends on browser microphone support. The server-backed app remains intact for later backend migration.

## Publish under Mahrush666

1. Create a repository named `My-app` on GitHub. For a free account, Pages normally requires a public repository. Upload the source contents from the sanitized archive, preserving `.github/workflows/pages.yml`.
2. In Settings → Pages, choose **GitHub Actions** as the build source.
3. Run the “Publish WordQuest to GitHub Pages” workflow, or push to `main`.
4. Once the deployment succeeds, use the exact URL shown by the workflow. The expected address is `https://mahrush666.github.io/My-app/`; it is not live until GitHub confirms deployment.
5. Test that URL on a phone with VPN disabled and inside WeChat before sharing a QR. Also test game artwork, reading illustrations and saving a flashcard review after reload.

## Build locally

`npm run build:pages` produces `dist-pages/`. All JavaScript, CSS and illustrations are included locally; no third-party CDN is needed. Relative URLs support both a repository subpath and a custom domain. Keep the lockfile with the source. Never upload `.env`, `.wrangler`, `.sites-runtime`, `node_modules`, local QA data or personal access-code exports.

## Mobile audio and game view

Bundled M4A recordings cover the published words, sentences and readings. Audio plays directly on a Listen tap; a native audio control appears if playback is blocked. Custom text without a bundled clip uses speech synthesis with visible failure feedback. Regenerate bundled recordings on macOS with `python3 scripts/generate-lesson-audio.py`; CI uses the committed assets. Run `node scripts/check-audio.mjs` from the project root to check playback routing.

Word Reactor automatically fills the browser viewport when started. It adapts the arena to portrait or landscape without stretching character sprites. Back, Shrink and Pause remain accessible; drag to move, with no direction-button row. Browser bars may remain visible in WeChat.

## Unit activity settings
The visible Teacher view lets you select book/unit, an age note, presets, and individual activities. Settings are saved only in that browser. Create a student link/QR to carry a unit's settings to another device; later changes require a new link. This is not authentication or a private backend. Browser-local progress has no online reporting.

Picture → listen has four audio choices, a separate selection control, and OK to submit. Picture → speak records up to ten seconds and supports replay. Optional browser speech recognition requires a parent/teacher opt-in, may send audio to the browser provider, and compares the recognized whole phrase; it is not pronunciation scoring. Unsupported/failed recognition never counts as a wrong answer. WeChat speech recognition is not guaranteed. No audio is uploaded to our server or retained by this app after leaving the activity.

## Shared flashcards and restricted student links
Picture speaking, picture listening, written-word choices and read/recall are all flashcard formats. They share one browser-local schedule per word. Daily queues contain only new/due cards. First-attempt mistakes return after ten minutes and are not erased by an immediate corrected answer. Speech that cannot be graded is not marked correct automatically; a parent/teacher may listen and rate it.

Save & update student QR now creates a fresh configured link. New links store choices in URL query parameters, keep the student book/unit menu within assigned lessons, preserve settings through the home link, and hide disabled panels entirely. Old fragment links remain readable. A teacher can apply the same choices to one unit or all units in a book. Existing printed QR codes keep their old settings; there is still no server to update them remotely. The general app URL is a catalogue, not a configured student assignment.

## Power up Starter picture story

Unit 7 · Reading contains The queen of the river, imported from the teacher’s PPT. Watch & listen is the only activity enabled by default. Ten close-up picture views use the original illustrated page; the original MP3 plays continuously while children change pictures manually. There is no inferred scene timing. Replay resets the audio and returns to the first picture. The final view includes the crown and speech bubble.
