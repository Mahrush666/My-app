# Optional local English speaking trial
Open ?speech-trial=1. This is independent of homework, saved SRS and XP.
No audio is sent to a speech API. The parent explicitly starts the download; all browser assets are served by this app.
Model: Xenova/whisper-tiny.en at 79fb389fc764e7c395bd330e9531d9d32ada7049 (Apache-2.0 conversion; upstream Whisper by OpenAI).
Runtime: Transformers.js 3.8.1, locked ONNX Runtime Web, single-thread WebAssembly to avoid cross-origin isolation requirements.
Run npm ci --prefix speech-runtime --ignore-scripts, then node scripts/prepare-local-speech.mjs before build:pages.
CI does this automatically. Model/runtime binaries are generated during deployment, not committed.
The five-word trial downloads roughly 72 MiB. Runtime and model responses use an app-specific Cache API store. Browser eviction or clearing data can require another download. Scripts themselves also use normal HTTP caching.
Model errors are retries, not pronunciation grades. No expected-word prompts are supplied to Whisper. Silence is filtered before inference.
Validation: actual bundled WebAssembly inference in local Node harness recognized climb/swim/jump/run but misheard walk from existing adult samples. Around 1.2–1.4s on the development Mac. Real WeChat/microphone performance is unverified and must be tested on phones.
