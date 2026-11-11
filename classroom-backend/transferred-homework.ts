import type {D1Database} from '@cloudflare/workers-types';

const prefix='transferred_homework:';

// Use with children c and assignments a. Saved work also covers transfers
// made before the app started retaining the full assignment list.
export const homeworkBelongsToStudent=`(a.group_id=c.group_id
 OR EXISTS(SELECT 1 FROM config t WHERE t.key=('${prefix}' || c.id || ':' || a.id))
 OR EXISTS(SELECT 1 FROM attempts t WHERE t.child_id=c.id AND t.assignment_id=a.id)
 OR EXISTS(SELECT 1 FROM completions t WHERE t.child_id=c.id AND t.assignment_id=a.id)
 OR EXISTS(SELECT 1 FROM homework_time t WHERE t.child_id=c.id AND t.assignment_id=a.id))`;

export function keepTransferredHomework(db:D1Database,childId:string,groupId:string){
 return db.prepare(`INSERT OR IGNORE INTO config(key,value)
  SELECT ? || c.id || ':' || a.id,a.id FROM children c JOIN assignments a ON a.group_id=c.group_id
  WHERE c.id=? AND c.group_id=? AND c.approved=1`).bind(prefix,childId,groupId);
}

export function clearTransferredHomework(db:D1Database,childId:string){
 const key=prefix+childId;
 return db.prepare('DELETE FROM config WHERE key>=? AND key<?').bind(key+':',key+';');
}

export function hasTransferredHomework(db:D1Database,where:'a.id=?'|'a.group_id=?',id:string){
 return db.prepare(`SELECT a.id FROM assignments a CROSS JOIN children c
  WHERE ${where} AND c.group_id<>a.group_id AND ${homeworkBelongsToStudent} LIMIT 1`).bind(id).first();
}
