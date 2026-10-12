import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
export default defineConfig({resolve:{alias:{'@':root}},build:{outDir:root+'/dist-classroom',lib:{entry:root+'/classroom-backend/worker.ts',formats:['es'],fileName:()=> 'worker.mjs'},minify:false}});
