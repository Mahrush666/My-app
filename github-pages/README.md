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
