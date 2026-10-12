import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function localDatabase(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const prepare=sql=>{let values=[];const statement=sqlite.prepare(sql);return {bind(...args){values=args;return this},async first(){return statement.get(...values)||null},async all(){return {results:statement.all(...values)}},async run(){const meta=statement.run(...values);return {success:true,meta:{changes:Number(meta.changes)}}}}};
 return {sqlite,prepare,async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};
}
