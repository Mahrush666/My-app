import {useEffect,useRef,useState} from 'react';
import {lessons} from './lessons';
import {publicAsset} from '../lib/public-runtime';
import {speak,stopSpeaking} from '../lib/audio';
import {speechMatches,speechSamples,speechAudible} from '../lib/local-speech';
const defaultWords=lessons.find(l=>l.id==='pu-starter-u7-lesson1')!.words;
type Status='off'|'download'|'initializing'|'ready'|'recording'|'checking'|'saving';
export default function LocalSpeechTrial({vocabulary=defaultWords,embedded=false,assigned=false,onAnswer}:{vocabulary?:typeof defaultWords;embedded?:boolean;assigned?:boolean;onAnswer?:(word:typeof defaultWords[number],correct:boolean,transcript:string)=>Promise<void>}){
 const words=vocabulary.filter(w=>w.sentence?.trim().split(/\s+/).length>1);
 const [status,setStatus]=useState<Status>('off'),[index,setIndex]=useState(0),[message,setMessage]=useState(''),[transcript,setTranscript]=useState(''),[seconds,setSeconds]=useState<number|null>(null),[percent,setPercent]=useState(0),[size,setSize]=useState(0),[cached,setCached]=useState<boolean|null>(null);
 const worker=useRef<Worker|null>(null),capture=useRef<{stream:MediaStream;ctx:AudioContext;source:MediaStreamAudioSourceNode;node:ScriptProcessorNode;gain:GainNode;chunks:Float32Array[]}|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),recordTimer=useRef<ReturnType<typeof setTimeout>|null>(null),alive=useRef(true),generation=useRef(0),pendingStream=useRef<MediaStream|null>(null);
 const word=words[index%words.length];
 const [passed,setPassed]=useState<string[]>([]),[pending,setPending]=useState<{word:typeof defaultWords[number];correct:boolean;text:string}|null>(null);
 const answerRef=useRef(onAnswer);answerRef.current=onAnswer;const currentWord=useRef(word);currentWord.current=word;
 async function saveResult(result:{word:typeof defaultWords[number];correct:boolean;text:string}){setStatus('saving');setPending(null);try{await answerRef.current?.(result.word,result.correct,result.text);if(!alive.current)return;if(result.correct)setPassed(ids=>[...new Set([...ids,result.word.id||result.word.en])]);setMessage(result.correct?'⭐ Correct! Good job! 答对了！':'Let’s try again. The checker may have misheard you. 再试一次，系统可能没听清。');}catch{if(alive.current){setPending(result);setMessage('Could not save. Tap Retry save. 暂未保存，请重试。')}}finally{if(alive.current)setStatus('ready')}}
 function release(){if(recordTimer.current)clearTimeout(recordTimer.current);pendingStream.current?.getTracks().forEach(t=>t.stop());pendingStream.current=null;const c=capture.current;capture.current=null;if(c){c.node.onaudioprocess=null;c.node.disconnect();c.source.disconnect();c.gain.disconnect();c.stream.getTracks().forEach(t=>t.stop());void c.ctx.close();}}
 function reset(){generation.current++;release();worker.current?.terminate();worker.current=null;if(timer.current)clearTimeout(timer.current);setStatus('off');}
 useEffect(()=>{alive.current=true;fetch(publicAsset('local-speech/manifest.json')).then(r=>r.json()).then(m=>{if(alive.current)setSize((m as {totalBytes:number}).totalBytes)}).catch(()=>{});return()=>{alive.current=false;generation.current++;release();worker.current?.terminate();if(timer.current)clearTimeout(timer.current);stopSpeaking()}},[]);
 function deadline(ms:number){if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{reset();setMessage('This device is taking too long. Please retry, or open this link in Chrome/Safari. 处理时间过长，请重试或换浏览器。')},ms)}
 function enable(){
 reset();setMessage('');setPercent(0);setCached(null);
 if(!window.Worker||!window.WebAssembly){setMessage('This browser cannot run the trial. Please try Chrome or Safari.');return;}
 setStatus('download');
 try{
 const w=new Worker(publicAsset('local-speech/worker.js'),{type:'module'});worker.current=w;deadline(240000);
 w.onerror=()=>{reset();setMessage('Could not start local speech checking in this browser. Please try Chrome or Safari. 此浏览器无法启动，请尝试其他浏览器。')};
 w.onmessage=({data})=>{if(!alive.current)return;
 if(data.type==='download'){setPercent(Math.min(100,Math.round(data.loaded/data.total*100)));setSize(data.total);deadline(240000)}
 if(data.type==='initializing'){setStatus('initializing');deadline(90000)}
 if(data.type==='ready'){if(timer.current)clearTimeout(timer.current);setStatus('ready');setCached(data.cached);setMessage('Ready! 准备好了！')}
 if(data.type==='result'){if(timer.current)clearTimeout(timer.current);setTranscript(data.text.trim());setSeconds(data.seconds);void saveResult({word:currentWord.current,correct:speechMatches(data.text,wordRef.current),text:data.text.trim()})}
 if(data.type==='error'){reset();setMessage('Could not check on this device. '+data.message+' · Please retry. 请重试。')}
 };
 w.postMessage({type:'prepare'});
 }catch{reset();setMessage('Local speech checking could not start. Please try another browser.')}
 }
 // Use a ref so the worker checks the current card, not the card selected during download.
 const wordRef=useRef(word?.sentence||'');wordRef.current=word?.sentence||'';

 function stop(){
 const c=capture.current;if(!c)return;const audio=speechSamples(c.chunks,c.ctx.sampleRate);release();
 if(!speechAudible(audio)){setStatus('ready');setMessage('I couldn’t hear clearly. Speak a little louder and try again. 没听清，请大声一点。');return;}
 setStatus('checking');setMessage('Checking on this device… 正在本机识别…');deadline(45000);
 worker.current?.postMessage({type:'transcribe',audio},[audio.buffer]);
 }
 async function record(){
 stopSpeaking();setMessage('');setTranscript('');setSeconds(null);
 if(!navigator.mediaDevices?.getUserMedia){setMessage('Microphone recording is unavailable here. Please try Chrome or Safari.');return;}
 const gen=++generation.current;setStatus('recording');let ctx:AudioContext|null=null;
 try{
 ctx=new AudioContext();await ctx.resume();
 const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
 if(!alive.current||generation.current!==gen){stream.getTracks().forEach(t=>t.stop());void ctx.close();return;}
 pendingStream.current=stream;
 const source=ctx.createMediaStreamSource(stream),node=ctx.createScriptProcessor(4096,1,1),gain=ctx.createGain();gain.gain.value=0;
 const chunks:Float32Array[]=[];node.onaudioprocess=e=>chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
 source.connect(node);node.connect(gain);gain.connect(ctx.destination);capture.current={ctx,stream,source,node,gain,chunks};
 setMessage('Say the whole sentence, then tap Stop. 说完整句子，然后点停止。');recordTimer.current=setTimeout(stop,10000);
 }catch{release();if(ctx&&ctx.state!=='closed')void ctx.close();if(alive.current){setStatus('ready');setMessage('Please allow microphone access, then try again. 请允许使用麦克风后重试。')}}
 }
 const busy=status!=='off'&&status!=='ready';
 if(!word)return <p>No sentences to practise yet. 暂无句子。</p>;
 return <section className={embedded?"sentence-speaking":"app"}>{!embedded&&<div className="section-heading"><h1>Say the sentence 说句子</h1><a href={location.pathname}>← App 返回</a></div>}<section className="panel"><p>Parent setup 家长设置：download the English model to this browser{size?' (about '+Math.ceil(size/1048576)+' MB)':''}. Recordings stay on this device. {assigned?'Say every assigned sentence to finish. 完成所有指定句子。':'Optional speaking practice. 可选口语练习。'}</p>
 {status==='off'&&<button className="primary" onClick={enable}>Enable speaking practice 启用口语练习</button>}
 {(status==='download'||status==='initializing')&&<><p role="status">{status==='download'?'Downloading 下载 '+percent+'%':'Preparing model 准备模型…'}</p><progress value={percent} max={100} style={{width:'100%'}}/></>}
 {cached!==null&&<p className="small-note">{cached?'Model saved in this browser for next time. 浏览器已保存模型。':'This browser could not keep the download. It may download again next time. 浏览器无法保存，下次可能需要重新下载。'}</p>}
 {busy&&status!=='saving'&&<button onClick={()=>{reset();setMessage('Cancelled 已取消。')}}>Cancel 取消</button>}
 </section><section className="panel"><div className="teacher-presets">{words.map((w,i)=><button key={w.en} disabled={busy||Boolean(pending)} aria-pressed={i===index} onClick={()=>{setIndex(i);setMessage('');setTranscript('');setSeconds(null)}}>{i+1}{passed.includes(w.id||w.en)?' ✓':''}</button>)}</div><div className="picture-prompt">{word.picture?<img src={publicAsset(word.picture)} alt={word.en}/>:word.icon}</div><p className="example">{word.sentence}</p><button disabled={busy} onClick={()=>speak(word.sentence)}>🔊 Listen 听一听</button><div style={{marginTop:16}}>{status==='recording'?<button className="primary" disabled={!capture.current} onClick={stop}>■ Stop & check 停止并检查</button>:<button className="primary" disabled={status!=='ready'||Boolean(pending)} onClick={()=>void record()}>🎤 Record 录音</button>}</div><p role="status" className="feedback">{status==='saving'?'Saving… 保存中…':message}</p>{pending&&<button className="primary" onClick={()=>void saveResult(pending)}>Retry save 重试保存</button>}{passed.length===words.length&&<p role="status">⭐ All sentences practised! 所有句子已完成！</p>}{transcript&&<p>Heard 听到：<strong>{transcript}</strong></p>}{seconds!==null&&<p>Checked in 识别耗时 {seconds.toFixed(1)} seconds 秒</p>}</section>
 {!embedded&&<details className="panel"><summary>Test details 测试信息</summary><p>Try all five sentences without VPN, close and reopen this page, and check whether the download is reused. Recognition is experimental, not a pronunciation score.</p><p>{navigator.userAgent}</p><p>Model: Whisper tiny.en, quantized · CPU / WebAssembly · Transformers.js 3.8.1</p><a href={publicAsset('local-speech/models/whisper-tiny.en/README.md')}>Model information</a></details>}</section>
}
