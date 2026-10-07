import { getChatGPTUser } from '@/app/chatgpt-auth';
import { bindings, db, hash } from './db';
export async function teacher(){const user=await getChatGPTUser();const allowed=bindings().TEACHER_EMAIL;if(!user||!allowed||user.email.toLowerCase()!==allowed.toLowerCase())return null;return user}
export type Student={id:string;name:string;class_id:string;class_name:string};
export async function student(request:Request):Promise<Student|null>{const raw=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('wq_student='))?.slice(11);if(!raw||!/^[a-f0-9]{64}$/.test(raw))return null;return await db().prepare('SELECT s.id,s.name,s.class_id,c.name AS class_name FROM student_sessions t JOIN students s ON s.id=t.student_id JOIN classes c ON c.id=s.class_id WHERE t.hash=? AND t.expires_at>?').bind(await hash(raw),Date.now()).first<Student>()}
export function cookie(value:string,request:Request,maxAge=2592000){return `wq_student=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
