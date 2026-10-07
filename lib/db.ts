import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
export type Bindings={DB?:D1Database;TEACHER_EMAIL?:string;OPENAI_API_KEY?:string};
export function bindings(){return env as unknown as Bindings}
export function db(){const database=bindings().DB;if(!database)throw new Error('Online storage is not available. Please try again later.');return database}
export async function hash(s:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
export function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(16));return Array.from(bytes,b=>chars[b%chars.length]).join('')}
export function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')}
export const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}
