import fs from 'node:fs';
import {createRequire} from 'node:module';
const {PGlite}=createRequire(new URL('../../.wrangler/pg-qa/package.json',import.meta.url))('@electric-sql/pglite');
import {build} from 'esbuild';
await build({entryPoints:['supabase/classroom/database.ts'],bundle:true,platform:'node',format:'esm',outfile:'.wrangler/pg-qa/database.mjs'});
const {classroomDatabase}=await import('../../.wrangler/pg-qa/database.mjs');
export async function localDatabase(){const pg=new PGlite();await pg.exec('CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;');await pg.exec(fs.readFileSync('supabase/classroom/schema.sql','utf8'));
const db=classroomDatabase(async items=>{const r=await pg.query('SELECT public.wordquest_batch($1::jsonb) AS result',[JSON.stringify(items)]);return r.rows[0].result;});
return {...db,pg,sqlite:{close:()=>pg.close(),prepare:sql=>({get:async(...p)=>{let qindex=0;const q=sql.replaceAll('?',()=>'$'+(++qindex));return(await pg.query(q,p)).rows[0];},run:async(...p)=>{let index=0;return pg.query(sql.replaceAll('?',()=>'$'+(++index)),p);}})}};}
