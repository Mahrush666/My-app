import starterFriendsRecordings from './pu-starter-u9-lesson4-audio.json';
import starterFarmRecordings from './pu-starter-u9-lesson3-audio.json';
import cityTripStoryRecordings from './act2-u9-lesson4-audio.json';
import cityTripLesson3Recordings from './act2-u9-lesson3-audio.json';
import dungeonRecordings from './dungeon-sports-audio.json';
import play1Recordings from './play1-u5-audio.json';
import cvcRecordings from './act3-cvc-audio.json';
import phonicsRecordings from './smart-phonics2-u4-u6-audio.json';
import recordings from './lesson-audio.json';
import cityTripRecordings from './act2-u9-audio.json';
import aiCourseRecordings from './ai-course-audio.json';
import numberRecordings from './number-audio.json';
import { publicAsset } from './public-runtime';
const clips: Record<string,string> = {...starterFriendsRecordings,...starterFarmRecordings,...cityTripRecordings,...recordings,...numberRecordings,...aiCourseRecordings,...phonicsRecordings,...cvcRecordings,...play1Recordings,...dungeonRecordings,...cityTripLesson3Recordings,...cityTripStoryRecordings};
let player: HTMLAudioElement | undefined;
let utterance: SpeechSynthesisUtterance | undefined;
let generation = 0;
let lifecycleInstalled = false;
let playbackTimer: ReturnType<typeof setTimeout> | undefined;
function clearPlaybackTimer(){if(playbackTimer!==undefined)clearTimeout(playbackTimer);playbackTimer=undefined;}
function installAudioLifecycle(){
 if(lifecycleInstalled||typeof document==='undefined')return;
 lifecycleInstalled=true;
 const interrupt=()=>{
  const src=player&&!player.paused&&!player.ended?player.getAttribute('src')||undefined:undefined;
  const speaking=!!utterance;
  stopSpeaking();stopAnswerSounds();
  // Returning to WeChat must not replay a question without another tap.
  if(src||speaking)report('Audio paused. Tap Listen again to continue. 音频已暂停，请再次点击收听。',src);
 };
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')interrupt();});
 window.addEventListener('pagehide',interrupt);
}
const answerPlayers:Partial<Record<'correct'|'incorrect',HTMLAudioElement>>={};
export function prepareAnswerSounds(){
 if(typeof window==='undefined')return;
 installAudioLifecycle();
 for(const kind of ['correct','incorrect'] as const){const src=publicAsset('answer-sounds/'+kind+'.wav');const audio=answerPlayers[kind]||new Audio();if(audio.getAttribute('src')!==src)audio.src=src;audio.preload='auto';audio.volume=.55;answerPlayers[kind]=audio;}
}
export function stopAnswerSounds(){for(const audio of Object.values(answerPlayers)){audio?.pause();if(audio)audio.currentTime=0;}}
export function playAnswerSound(correct:boolean){
 if(typeof window==='undefined'||document.visibilityState==='hidden')return;
 stopSpeaking();stopAnswerSounds();prepareAnswerSounds();const audio=answerPlayers[correct?'correct':'incorrect'];
 // Play before any saving/network await so mobile browsers retain the tap gesture.
 try{void audio?.play().catch(()=>{});}catch{}
}
export function audioKey(text:string) { return text.trim().toLowerCase().replace(/\s+/g,' ').replace(/[‘’]/g,"'").replace(/[“”]/g,'"'); }
export function recordingPath(text:string){const file=clips[audioKey(text)];return file?'lesson-audio/'+file:undefined}
export function audioSource(text:string) { const path=recordingPath(text);return path?publicAsset(path):undefined; }
function report(message:string,src?:string) { window.dispatchEvent(new CustomEvent('wordquest-audio-error',{detail:{message,src}})); }
export function stopSpeaking() { generation++;clearPlaybackTimer();player?.pause();if(player)player.currentTime=0;window.speechSynthesis?.cancel();utterance=undefined; }
export function speak(text:string, recording?:string) {
 if(typeof window==='undefined')return;
 installAudioLifecycle();
 stopSpeaking();const token=generation;const src=recording?publicAsset(recording):audioSource(text);
 window.dispatchEvent(new CustomEvent('wordquest-audio-clear'));
 if(document.visibilityState==='hidden')return;
 if(src){
  // A fresh element prevents mobile WebViews from replaying a previous option's buffer.
  player?.remove();player=new Audio();player.className='lesson-audio-player';player.hidden=true;
  player.preload='auto';player.src=src;player.volume=1;player.muted=false;document.body.appendChild(player);
  const audio=player;
  const failed=(message:string)=>{
   if(token!==generation)return;
   generation++;clearPlaybackTimer();audio.pause();
   report(message,src);
  };
  audio.addEventListener('error',()=>failed('This recording could not load. Check your connection and tap Listen again. 录音加载失败，请检查网络后再次点击收听。'),{once:true});
  audio.addEventListener('playing',()=>{if(token===generation)clearPlaybackTimer();else audio.pause();});
  audio.addEventListener('ended',()=>{if(token===generation)clearPlaybackTimer();});
  // A mobile WebView can leave play() pending indefinitely on a stalled download.
  playbackTimer=setTimeout(()=>failed('Audio is taking too long to load. Tap Listen to retry. 音频加载较慢，请再次点击收听。'),12000);
  // Start in the click handler; awaiting a fetch first loses mobile playback permission.
  try{void audio.play().catch(()=>failed('Tap the audio player below to listen. 请点击下方播放器。'));}
  catch{failed('Tap the audio player below to listen. 请点击下方播放器。');}
  return;
 }
 if(!window.speechSynthesis){report('No recording for this text yet. 可以先看文字练习。');return;}
 utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.8;
 utterance.voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'))||null;
 let started=false;utterance.onstart=()=>{started=true};
 utterance.onend=()=>{if(token===generation)utterance=undefined;};
 utterance.onerror=()=>{if(token===generation){utterance=undefined;report('Your browser could not read this text aloud. 此文字暂时没有可播放的录音。');}};
 window.speechSynthesis.speak(utterance);
 setTimeout(()=>{if(!started&&token===generation)report('Your browser could not read this text aloud. 此文字暂时没有可播放的录音。');},2500);
}
