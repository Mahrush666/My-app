import {publicAsset} from './public-runtime';
let player:HTMLAudioElement|null=null,lastPlayed=0;
export function prepareCelebration(){
 if(typeof Audio==='undefined'||player)return;
 const audio=new Audio(publicAsset('sounds/celebration.mp3'));player=audio;audio.preload='auto';audio.volume=.6;
 // Unlock this same audio element on the first tap for mobile browsers.
 if(typeof document!=='undefined')document.addEventListener('pointerdown',()=>{audio.muted=true;void audio.play().then(()=>{audio.pause();audio.currentTime=0;audio.muted=false}).catch(()=>{audio.muted=false})},{once:true,capture:true});
}
export function celebrateSound(){prepareCelebration();if(!player||Date.now()-lastPlayed<1000)return;lastPlayed=Date.now();player.muted=false;player.currentTime=0;void player.play().catch(()=>{});}
