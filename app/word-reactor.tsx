"use client";
import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Star, Pause, Volume2 } from 'lucide-react';
import type { Progress, Word } from './words';
import { speak } from './words';
import { lessonWords } from '@/lib/review-schedule';
import { publicAsset } from '@/lib/public-runtime';
import { shuffle } from '@/lib/random';

type Enemy = { id: number; x: number; y: number; hp: number; boss: boolean };
type Shot = { x: number; y: number; vx: number; vy: number; life: number };
type Energy = { x: number; y: number };
type Status = 'ready' | 'playing' | 'paused' | 'quiz' | 'upgrade' | 'won' | 'lost';
type State = { x: number; y: number; time: number; hp: number; score: number; level: number; damage: number; speed: number; shield: number; enemies: Enemy[]; shots: Shot[]; energy: Energy[]; spawn: number; fire: number; pulse: number; invincible: number; nextQuiz: number; bossSpawned: boolean; bossDefeated: boolean; id: number };
const fresh = (): State => ({ x: 300, y: 220, time: 0, hp: 4, score: 0, level: 1, damage: 1, speed: 125, shield: 60, enemies: [], shots: [], energy: [], spawn: 0, fire: 0, pulse: 0, invincible: 0, nextQuiz: 18, bossSpawned: false, bossDefeated: false, id: 0 });
const snapshot = (g: State) => ({ time: Math.floor(g.time), hp: g.hp, score: g.score, level: g.level, bossDefeated: g.bossDefeated });
const controls = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];
const ART = publicAsset('game-art/lantern-street/');
type GameArt = { street: HTMLImageElement; archer: HTMLImageElement; jiangshi: HTMLImageElement };
export default function WordReactor({ vocabulary, progress, onAnswer }: { vocabulary: Word[]; progress: Progress; onAnswer?: (word: Word, correct: boolean, mode: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null), game = useRef(fresh()), statusRef = useRef<Status>('ready'), keys = useRef(new Set<string>()), target = useRef<{ x: number; y: number } | null>(null);
  const progressRef = useRef(progress); progressRef.current = progress;
  const art = useRef<GameArt | null>(null), facing = useRef(1);
  const [artReady, setArtReady] = useState(false), [artError, setArtError] = useState(false), [artAttempt, setArtAttempt] = useState(0);
  const [status, setStatus] = useState<Status>('ready'), [hud, setHud] = useState(snapshot(game.current)), [role, setRole] = useState('spark');
  const roleRef = useRef(role); roleRef.current = role;
  const [question, setQuestion] = useState<Word | null>(null), [options, setOptions] = useState<Word[]>([]), [hint, setHint] = useState(''), [correctWords, setCorrectWords] = useState(0);
  const [upgrades, setUpgrades] = useState({ spark: 0, shield: 0, speed: 0 });
  const currentQuestion = useRef<Word | null>(null), remaining = useRef<Word[]>([]);
  useEffect(() => {
    let active = true; setArtReady(false); setArtError(false); art.current = null;
    const load = (filename: string) => new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Game artwork unavailable')); img.src = ART + filename; });
    void Promise.all([load('street.webp'), load('archer.png'), load('jiangshi.png')]).then(([street, archer, jiangshi]) => { if (active) { art.current = { street, archer, jiangshi }; setArtReady(true); } }).catch(() => { if (active) setArtError(true); });
    return () => { active = false; };
  }, [artAttempt]);
  function change(next: Status) { statusRef.current = next; keys.current.clear(); target.current = null; setHud(snapshot(game.current)); setStatus(next); }
  function start() {
    if (!art.current) return;
    const g = fresh(); if (roleRef.current === 'shield') g.shield = 88; else g.damage = 2;
    game.current = g; facing.current = 1; setCorrectWords(0); setUpgrades({ spark: 0, shield: 0, speed: 0 }); remaining.current = []; currentQuestion.current = null; setQuestion(null); setHint(''); change('playing');
  }
  function ask() {
    if (!remaining.current.length) remaining.current = lessonWords(vocabulary, progressRef.current, Date.now(), Math.min(6, vocabulary.length));
    const word = remaining.current.shift(); if (!word) return;
    currentQuestion.current = word; setQuestion(word); setOptions(shuffle([word, ...shuffle(vocabulary.filter(w => w.en !== word.en)).slice(0, 3)])); setHint(''); change('quiz');
  }
  function answer(word: Word) {
    const expected = currentQuestion.current; if (statusRef.current !== 'quiz' || !expected) return;
    const correct = word.en === expected.en; onAnswer?.(expected, correct, 'reactor');
    if (!correct) { setHint(`Try again: ${expected.zh} means ${expected.en}. 再试一次。`); speak(expected.en); return; }
    currentQuestion.current = null; setCorrectWords(n => n + 1); game.current.score += 12; game.current.level++; speak(expected.en); change('upgrade');
  }
  function upgrade(type: 'spark' | 'shield' | 'speed') {
    if (statusRef.current !== 'upgrade') return;
    const g = game.current;
    if (type === 'spark') g.damage++;
    if (type === 'shield') { g.shield = Math.min(160, g.shield + 18); g.hp = Math.min(4, g.hp + 1); }
    if (type === 'speed') g.speed = Math.min(245, g.speed + 22);
    setUpgrades(prev => ({ ...prev, [type]: prev[type] + 1 })); g.invincible = 2; change('playing');
  }
  useEffect(() => {
    const down = (event: KeyboardEvent) => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if ([...controls, 'w', 'a', 's', 'd'].includes(key) && statusRef.current === 'playing') { event.preventDefault(); keys.current.add(key); } };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    const blur = () => { keys.current.clear(); target.current = null; if (statusRef.current === 'playing') change('paused'); };
    const visibility = () => { if (document.visibilityState === 'hidden') blur(); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility);
    let frame = 0, last = performance.now(), ui = 0;
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04); last = now;
      const g = game.current, ctx = canvas.current?.getContext('2d');
      if (statusRef.current === 'playing') {
        g.time += dt; g.spawn += dt; g.fire += dt; g.pulse += dt; g.invincible = Math.max(0, g.invincible - dt);
        let dx = Number(keys.current.has('ArrowRight') || keys.current.has('d')) - Number(keys.current.has('ArrowLeft') || keys.current.has('a'));
        let dy = Number(keys.current.has('ArrowDown') || keys.current.has('s')) - Number(keys.current.has('ArrowUp') || keys.current.has('w'));
        if (target.current) { dx = target.current.x - g.x; dy = target.current.y - g.y; if (Math.hypot(dx, dy) < 5) { dx = 0; dy = 0; } }
        const length = Math.hypot(dx, dy); if (length) { if (Math.abs(dx) > 0.1) facing.current = dx > 0 ? 1 : -1; g.x += dx / length * g.speed * dt; g.y += dy / length * g.speed * dt; }
        g.x = Math.max(18, Math.min(582, g.x)); g.y = Math.max(18, Math.min(422, g.y));
        if (g.spawn > Math.max(0.45, 1.3 - g.time / 160) && g.enemies.length < 45) {
          g.spawn = 0; const side = Math.floor(Math.random() * 4);
          g.enemies.push({ id: g.id++, x: side === 0 ? -10 : side === 1 ? 610 : Math.random() * 600, y: side === 2 ? -10 : side === 3 ? 450 : Math.random() * 440, hp: 1 + Math.floor(g.time / 40), boss: false });
        }
        if (g.time >= 95 && !g.bossSpawned) { g.bossSpawned = true; g.enemies.push({ id: g.id++, x: 300, y: -25, hp: 32, boss: true }); }
        for (const enemy of g.enemies) { const d = Math.hypot(g.x - enemy.x, g.y - enemy.y) || 1; const speed = enemy.boss ? 27 : 34 + g.time * 0.22; enemy.x += (g.x - enemy.x) / d * speed * dt; enemy.y += (g.y - enemy.y) / d * speed * dt; }
        if (g.fire > 0.5 / 0.9 && g.enemies.length) {
          g.fire = 0; const enemy = g.enemies.reduce((near, e) => Math.hypot(e.x - g.x, e.y - g.y) < Math.hypot(near.x - g.x, near.y - g.y) ? e : near);
          const d = Math.hypot(enemy.x - g.x, enemy.y - g.y) || 1;
          g.shots.push({ x: g.x, y: g.y, vx: (enemy.x - g.x) / d * 310, vy: (enemy.y - g.y) / d * 310, life: 2 });
        }
        for (const shot of g.shots) { shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt; const enemy = g.enemies.find(e => e.hp > 0 && Math.hypot(e.x - shot.x, e.y - shot.y) < (e.boss ? 30 : 14)); if (enemy) { enemy.hp -= g.damage; shot.life = 0; } }
        g.shots = g.shots.filter(s => s.life > 0);
        if (g.pulse >= 2.2) { g.pulse = 0; for (const e of g.enemies) if (Math.hypot(e.x - g.x, e.y - g.y) < g.shield) e.hp -= roleRef.current === 'shield' ? 2 : 1; }
        g.enemies = g.enemies.filter(e => { if (e.hp > 0) return true; g.score += e.boss ? 40 : 2; if (e.boss) g.bossDefeated = true; if (g.energy.length < 35) g.energy.push({ x: e.x, y: e.y }); return false; });
        if (!g.invincible && g.enemies.some(e => Math.hypot(e.x - g.x, e.y - g.y) < (e.boss ? 43 : 25))) { g.hp--; g.invincible = 2; }
        g.energy = g.energy.filter(e => { if (Math.hypot(e.x - g.x, e.y - g.y) < 28) { g.score += 3; return false; } return true; });
        if (g.hp <= 0) change('lost'); else if (g.time >= 120) change('won'); else if (g.time >= g.nextQuiz) { g.nextQuiz += 18; ask(); }
      }
      if (ctx) {
        ctx.clearRect(0, 0, 600, 440); ctx.imageSmoothingEnabled = false;
        const sprites = art.current;
        if (sprites) ctx.drawImage(sprites.street, 0, 0, 600, 440);
        else { ctx.fillStyle = '#2c332b'; ctx.fillRect(0, 0, 600, 440); }
        ctx.textAlign = 'center'; ctx.font = '20px Arial'; for (const e of g.energy) { ctx.fillStyle = '#ffe478'; ctx.strokeStyle = '#754823'; ctx.lineWidth = 3; ctx.strokeText('✦', e.x, e.y + 7); ctx.fillText('✦', e.x, e.y + 7); }
        if (sprites) {
          // Sort characters by their ground position so passing sprites overlap naturally.
          const actors = [...g.enemies.map(enemy => ({ x: enemy.x, y: enemy.y, enemy })), { x: g.x, y: g.y, enemy: null }].sort((a, b) => a.y - b.y);
          for (const actor of actors) {
            const enemy = actor.enemy, size = enemy ? enemy.boss ? 82 : 46 : 58;
            const img = enemy ? sprites.jiangshi : sprites.archer;
            const width = size * img.naturalWidth / img.naturalHeight;
            const bob = enemy ? Math.abs(Math.sin(g.time * 7 + enemy.id)) * 5 : Math.sin(g.time * 10) * ((keys.current.size || target.current) ? 1.5 : 0);
            ctx.fillStyle = '#241e2360'; ctx.beginPath(); ctx.ellipse(actor.x, actor.y + size * 0.43, width * 0.3, size * 0.075, 0, 0, Math.PI * 2); ctx.fill();
            ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y - bob));
            if (enemy ? actor.x < g.x : facing.current < 0) ctx.scale(-1, 1);
            ctx.globalAlpha = !enemy && g.invincible > 0 ? 0.55 : 1;
            ctx.drawImage(img, -width / 2, -size / 2, width, size); ctx.restore();
            if (enemy?.boss) { ctx.fillStyle = '#342839'; ctx.fillRect(enemy.x - 32, enemy.y - 53, 64, 7); ctx.fillStyle = '#f4bf63'; ctx.fillRect(enemy.x - 30, enemy.y - 51, 60 * Math.max(0, enemy.hp) / 32, 3); }
          }
        }
        // Arrow direction follows its trajectory; these are functional projectile markers.
        for (const shot of g.shots) {
          ctx.save(); ctx.translate(shot.x, shot.y); ctx.rotate(Math.atan2(shot.vy, shot.vx)); ctx.strokeStyle = '#40271b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(7, 0); ctx.stroke(); ctx.strokeStyle = '#f6e2ad'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(-5, 0); ctx.lineTo(-9, 3); ctx.moveTo(3, -3); ctx.lineTo(8, 0); ctx.lineTo(3, 3); ctx.stroke(); ctx.restore();
        }
        ctx.strokeStyle = roleRef.current === 'shield' ? '#90e8da' : '#f3d28a'; ctx.globalAlpha = 0.55 * (1 - g.pulse / 2.2); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(g.x, g.y, g.shield * g.pulse / 2.2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (now - ui > 150) { ui = now; setHud(snapshot(g)); } frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); window.speechSynthesis?.cancel(); };
  }, [vocabulary]);
  function pointer(event: React.PointerEvent<HTMLCanvasElement>) { const rect = event.currentTarget.getBoundingClientRect(); target.current = { x: (event.clientX - rect.left) / rect.width * 600, y: (event.clientY - rect.top) / rect.height * 440 }; }
  return <section className="survival reactor"><div className="quiz-top"><h3>Word Reactor 能量单词</h3><span>Lantern Street · 灯笼街 · 2 min</span></div><div className="hud"><span><Shield size={18}/>{hud.hp} / 4</span><span><Zap size={18}/>Level {hud.level}</span><span><Star size={18}/>{hud.score}</span><span>{Math.max(0, 120 - hud.time)}s</span></div>
    <div className={'arena ' + (status === 'playing' ? '' : 'with-overlay')}><canvas width={600} height={440} ref={canvas} aria-label="Word Reactor arena. Move using the direction buttons or arrow keys. Your archer fires arrows automatically. Cartoon jiangshi hop towards you." onPointerDown={e => { if (statusRef.current !== 'playing') return; e.currentTarget.setPointerCapture(e.pointerId); pointer(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) pointer(e); }} onPointerUp={() => { target.current = null; }} onPointerCancel={() => { target.current = null; }} onLostPointerCapture={() => { target.current = null; }}/>
      {status !== 'playing' && <div className="game-overlay reactor-overlay">{status === 'ready' ? <><p className="eyebrow">CHOOSE YOUR ARCHER</p><h2>Guard Lantern Street! 守护灯笼街</h2><div className="role-picker"><button aria-pressed={role === 'spark'} onClick={() => setRole('spark')}><img src={ART+"archer.png"} alt="" className="archer-choice"/>Swift archer<br/><small>Stronger arrows 强力弓箭</small></button><button aria-pressed={role === 'shield'} onClick={() => setRole('shield')}><img src={ART+"archer.png"} alt="" className="archer-choice"/>Guardian archer<br/><small>Wider shield 广域护盾</small></button></div><p>Dodge hopping jiangshi and practise words to power up.<br/>躲开小僵尸，练习单词，选择升级。</p>{artError?<><p role="alert">Artwork could not load. Please try again. 图片暂时无法加载。</p><button onClick={()=>setArtAttempt(n=>n+1)}>Reload artwork 重试</button></>:<button className="primary" disabled={!vocabulary.length||!artReady} onClick={start}>{artReady?"Start 开始":"Loading the street… 正在加载"}</button>}</>
      : status === 'quiz' && question ? <><p className="eyebrow">WORD POWER · 单词能量</p><h2 lang="zh-CN">{question.zh}</h2><div className="answers">{options.map(w => <button key={w.id || w.en} onClick={() => answer(w)}>{w.en}</button>)}</div><button className="hear-hint" onClick={() => speak(question.en)}><Volume2 size={18}/>Listen 听一听</button><p aria-live="polite">{hint}</p></>
      : status === 'upgrade' ? <><h2>Choose a power! 选择升级</h2><div className="power-choices"><button onClick={() => upgrade('spark')}><Zap/>Arrows +1<span>Stronger arrows 弓箭升级</span></button><button onClick={() => upgrade('shield')}><Shield/>Shield +1<span>Wider shield + one heart 护盾和生命</span></button><button onClick={() => upgrade('speed')}><Star/>Speed +1<span>Move faster 移动升级</span></button></div></>
      : status === 'paused' ? <><h2>Take a break 休息一下</h2><button className="primary" onClick={() => change('playing')}>Resume 继续</button></>
      : <><h2>{status === 'won' ? 'Street protected! 守护成功！' : 'Nice practice! 再试一次！'}</h2><p>{correctWords} words practised · {hud.score} energy<br/>{hud.bossDefeated ? 'Final challenge cleared! 挑战成功！' : 'Keep building your word power. 继续练习单词。'}</p><button className="primary" onClick={start}>Play again 再玩一次</button></>}</div>}
    </div><div className="reactor-upgrades"><span>ϟ {upgrades.spark}</span><span>◇ {upgrades.shield}</span><span>✦ {upgrades.speed}</span><span>Words 单词: {correctWords}</span></div><div className="game-controls"><div className="dpad">{controls.map((key, i) => <button key={key} aria-label={'Move ' + key.replace('Arrow', '').toLowerCase()} disabled={status !== 'playing'} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); keys.current.add(key); }} onPointerUp={() => keys.current.delete(key)} onPointerCancel={() => keys.current.delete(key)} onLostPointerCapture={() => keys.current.delete(key)}>{['←', '↑', '↓', '→'][i]}</button>)}</div><button disabled={status !== 'playing'} onClick={() => change('paused')}><Pause size={18}/>Pause</button></div><p className="instructions">Drag or hold a direction button. Your bow fires automatically. 拖动或按住方向键，弓箭自动攻击。<br/>Arrow keys / WASD on a computer. The timer pauses during word challenges.</p>
  </section>;
}
