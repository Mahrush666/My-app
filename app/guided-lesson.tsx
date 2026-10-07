"use client";
import { useEffect, useRef, useState } from 'react';
import { Check, Headphones, Volume2, Star, BookOpen, Gamepad2 } from 'lucide-react';
import type { Word, Progress } from './words';
import { speak, stopSpeaking } from './words';
import Reading from './reading';
import { shuffle } from '@/lib/random';
import { answerKey, lessonWords, sentenceTokens } from '@/lib/review-schedule';
import type { ReadingPassage } from '@/lib/classroom-types';

type Stage = 'listen' | 'spell' | 'sentence' | 'read' | 'done';
const stages = [{ id: 'listen', label: 'Listen 听' }, { id: 'spell', label: 'Spell 拼写' }, { id: 'sentence', label: 'Build 组句' }, { id: 'read', label: 'Read 朗读' }];
type Props = {
  vocabulary: Word[]; progress: Progress; readings: ReadingPassage[]; unitId?: string;
  onAnswer: (word: Word, correct: boolean, exercise: string) => Promise<void>;
  onRecording: (passage: ReadingPassage) => void;
  onSession: (durationSeconds: number, completed: boolean, answers: number, firstTry: number) => Promise<void>;
  onPlay: () => void;
};

export default function GuidedLesson({ vocabulary, progress, readings, unitId, onAnswer, onRecording, onSession, onPlay }: Props) {
  // Hold a session's selection steady while background syncing refreshes progress.
  const [selected] = useState(() => lessonWords(vocabulary, progress, Date.now()));
  const [sentences] = useState(() => selected.filter(w => sentenceTokens(w.sentence || w.en).length > 1).slice(0, 4));
  const [stage, setStage] = useState<Stage>('listen'), [round, setRound] = useState(0);
  const [choices, setChoices] = useState<Word[]>([]), [tokens, setTokens] = useState<string[]>([]), [used, setUsed] = useState<number[]>([]);
  const [typed, setTyped] = useState(''), [feedback, setFeedback] = useState(''), [correct, setCorrect] = useState(false), [busy, setBusy] = useState(false), [mistaken, setMistaken] = useState(false), [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState(0), [firstTry, setFirstTry] = useState(0), [readIds, setReadIds] = useState<string[]>([]), [sessionSaved, setSessionSaved] = useState(false);
  const seconds = useRef(0), writing = useRef(false), saved = useRef(false), counts = useRef({ answers: 0, firstTry: 0 });
  const report = useRef(onSession); report.current = onSession;
  const pool = stage === 'sentence' ? sentences : selected;
  const word = pool[round];
  const sentence = word?.sentence.trim() || word?.en || '';
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible' && document.hasFocus() && !saved.current) seconds.current = Math.min(1800, seconds.current + 1); }, 1000);
    return () => { clearInterval(timer); if (!saved.current && !writing.current && seconds.current >= 5) void report.current(seconds.current, false, counts.current.answers, counts.current.firstTry).catch(() => {}); stopSpeaking(); };
  }, []);
  useEffect(() => {
    setUsed([]); setTyped(''); setCorrect(false); setMistaken(false); setFeedback(''); setShowHint(false);
    if (word) {
      setChoices(shuffle([word, ...shuffle(vocabulary.filter(w => w.en !== word.en)).slice(0, 3)]));
      const original = sentenceTokens(sentence); const scrambled = shuffle(original);
      setTokens(scrambled.join(' ') === original.join(' ') ? [...scrambled.slice(1), scrambled[0]] : scrambled);
    }
  }, [stage, round, word, sentence, vocabulary]);

  async function check(answer: string) {
    if (!word || correct || writing.current) return;
    writing.current = true; setBusy(true);
    const ok = stage === 'sentence' ? answer === sentenceTokens(sentence).join(' ') : answerKey(answer) === answerKey(word.en);
    try {
      await onAnswer(word, ok, stage);
      if (ok) {
        setCorrect(true); setFeedback('You did it! 答对啦！'); speak(stage === 'sentence' ? sentence : word.en);
        setAnswers(n => n + 1); counts.current.answers++;
        if (!mistaken) { setFirstTry(n => n + 1); counts.current.firstTry++; }
      } else {
        setMistaken(true); setFeedback(stage === 'sentence' ? 'Listen, then try the order again. 听一听，再组句。' : `Listen and try again. 再试一次。 ${word.en}`);
        speak(stage === 'sentence' ? sentence : word.en);
      }
    } catch { setFeedback('We could not keep this answer. Please try again. 暂时无法保存，请重试。'); }
    finally { writing.current = false; setBusy(false); }
  }
  function next() {
    if (round + 1 < pool.length) setRound(n => n + 1);
    else { setRound(0); setStage(stage === 'listen' ? 'spell' : stage === 'spell' ? 'sentence' : 'read'); }
  }
  async function finish() {
    if (writing.current) return; writing.current = true; setBusy(true);
    try { await onSession(seconds.current, true, answers, firstTry); saved.current = true; setSessionSaved(true); setStage('done'); }
    catch { setFeedback('Your lesson is not saved yet. Please try again. 请重试保存。'); }
    finally { writing.current = false; setBusy(false); }
  }
  const current = stages.findIndex(s => s.id === stage);
  return <section className="guided-lesson">
    <div className="section-heading"><div><p className="eyebrow">YOUR LESSON JOURNEY</p><h2>A little English, every day</h2></div><span className="pill">{selected.length} words 单词</span></div>
    <ol className="lesson-steps" aria-label="Lesson stages">{stages.map((s, i) => <li key={s.id} className={stage === 'done' || i < current ? 'finished' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}><span>{stage === 'done' || i < current ? <Check size={18}/> : i + 1}</span>{s.label}</li>)}</ol>
    {stage === 'done' ? <div className="lesson-complete"><Star size={44}/><h2>Lesson complete! 完成啦！</h2><p>{firstTry} / {answers} on your first try. Every try helps you learn.</p><p>{sessionSaved ? 'Your practice is saved or waiting to sync. 学习记录已保存或等待同步。' : ''}</p><button className="primary" onClick={onPlay}><Gamepad2 size={20}/>Choose a game 玩游戏</button></div>
    : stage === 'read' ? <><Reading lessonPassages={readings} unitId={unitId} onComplete={onRecording} onRead={p => setReadIds(ids => ids.includes(p.id) ? ids : [...ids, p.id])} readIds={readIds}/><div className="lesson-finish"><p>{readings.length ? `${readIds.length} / ${readings.length} paragraphs practised 段落已练习` : 'No story in this unit. You can finish your word practice. 本单元暂无故事。'}</p><button className="primary" disabled={busy || readIds.length < readings.length} onClick={() => void finish()}>{busy ? 'Saving…' : 'Finish lesson 完成课程'}</button><p className="feedback" aria-live="polite">{feedback}</p></div></>
    : !word ? <div className="empty"><BookOpen size={36}/><h2>Ready for reading?</h2><p>Your teacher can add example sentences for sentence-building practice. 老师可以添加例句。</p><button className="primary" onClick={() => { setStage('read'); setRound(0); }}>Read the story 读故事</button></div>
    : <section className="quiz-surface lesson-question"><div className="quiz-top"><h3>{stage === 'listen' ? 'Listen and choose 听音选词' : stage === 'spell' ? 'Spell the word 拼写单词' : 'Build the sentence 组句'}</h3><span>{round + 1} / {pool.length}</span></div>
      {stage === 'listen' ? <><button className="listen-prompt" onClick={() => speak(word.en)} aria-label="Listen to the question"><Headphones size={38}/><span>Listen 听一听</span></button><p>Which word did you hear? 你听到了哪个词？</p><button className="hear-hint" onClick={()=>setShowHint(true)}>Can’t hear? Show the word 看单词</button>{showHint&&<p className="translation">{word.en} · {word.zh}</p>}<div className="answers">{choices.map(w => <button key={w.id || w.en} disabled={busy || correct} className={correct && w.en === word.en ? 'answer-correct' : ''} onClick={() => void check(w.en)}>{w.en}</button>)}</div>{correct && <p className="translation">{word.zh}</p>}</>
      : stage === 'spell' ? <><span className="word-emoji">{word.icon}</span><h2 lang="zh-CN">{word.zh}</h2><button className="hear-hint" onClick={() => speak(word.en)}><Volume2 size={20}/>Listen 听一听</button><form onSubmit={e => { e.preventDefault(); void check(typed); }}><label className="spell-label" htmlFor="lesson-spelling">Type the English word or phrase 输入英文</label><input id="lesson-spelling" className="lesson-spelling" value={typed} maxLength={80} disabled={busy || correct} autoComplete="off" autoCapitalize="none" spellCheck={false} onChange={e => setTyped(e.target.value)}/><button className="primary" disabled={busy || correct || !typed.trim()}>Check 检查</button></form></>
      : <><button className="hear-hint" onClick={() => speak(sentence)}><Volume2 size={20}/>Listen to the sentence 听句子</button><button className="hear-hint" onClick={()=>setShowHint(true)}>Show a hint 看提示</button>{showHint&&<p className="translation">{sentence}</p>}<p>Tap the words in order. 点击词语组成句子。</p><div className="sentence-output" aria-live="polite">{used.map(i => tokens[i]).join(' ') || '…'}</div><div className="letters">{tokens.map((token, i) => <button key={i} disabled={used.includes(i) || busy || correct} onClick={() => setUsed(ids => [...ids, i])}>{token}</button>)}</div><div className="sentence-actions"><button disabled={!used.length || busy || correct} onClick={() => setUsed(ids => ids.slice(0, -1))}>Undo 撤销</button><button disabled={!used.length || busy || correct} onClick={() => setUsed([])}>Start again 重组</button><button className="primary" disabled={used.length !== tokens.length || busy || correct} onClick={() => void check(used.map(i => tokens[i]).join(' '))}>Check 检查</button></div></>}
      <p className="feedback" aria-live="polite">{feedback}</p>{correct && <button className="primary" onClick={next}>{round + 1 === pool.length ? 'Next activity 下一项' : 'Next 下一题'}</button>}
    </section>}
  </section>;
}
