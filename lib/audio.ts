import recordings from './lesson-audio.json';
import { publicAsset } from './public-runtime';
const clips: Record<string,string> = recordings;
let player: HTMLAudioElement | undefined;
let utterance: SpeechSynthesisUtterance | undefined;
let generation = 0;
export function audioKey(text:string) { return text.trim().toLowerCase().replace(/\s+/g,' ').replace(/[‘’]/g,"'").replace(/[“”]/g,'"'); }
export function audioSource(text:string) { const file=clips[audioKey(text)];return file?publicAsset('lesson-audio/'+file):undefined; }
function report(message:string,src?:string) { window.dispatchEvent(new CustomEvent('wordquest-audio-error',{detail:{message,src}})); }
export function stopSpeaking() { generation++;player?.pause();if(player)player.currentTime=0;window.speechSynthesis?.cancel();utterance=undefined; }
export function speak(text:string) {
 if(typeof window==='undefined')return;
 stopSpeaking();const token=generation;const src=audioSource(text);
 window.dispatchEvent(new CustomEvent('wordquest-audio-clear'));
 if(src){
  if(!player){player=new Audio();player.className='lesson-audio-player';player.hidden=true;document.body.appendChild(player);}player.preload='auto';player.src=src;player.volume=1;player.muted=false;
  // Start in the click handler; awaiting a fetch first loses mobile playback permission.
  void player.play().catch(()=>{if(token===generation)report('Tap the audio player below to listen. 请点击下方播放器。',src);});
  return;
 }
 if(!window.speechSynthesis){report('No recording for this text yet. 可以先看文字练习。');return;}
 utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.8;
 utterance.voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'))||null;
 let started=false;utterance.onstart=()=>{started=true};
 utterance.onerror=()=>{if(token===generation)report('Your browser could not read this text aloud. 此文字暂时没有可播放的录音。');};
 window.speechSynthesis.speak(utterance);
 setTimeout(()=>{if(!started&&token===generation)report('Your browser could not read this text aloud. 此文字暂时没有可播放的录音。');},2500);
}
