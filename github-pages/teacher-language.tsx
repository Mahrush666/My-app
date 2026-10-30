import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
type Language='en'|'zh'|'both';
const key='wordquest-teacher-language';
const Context=createContext<{language:Language;setLanguage:(language:'en'|'zh')=>void}>({language:'both',setLanguage:()=>{}});
const words:Record<string,string>={'Home':'主页','Students':'学生','Attendance':'出勤','Homework':'作业','Calendar':'日历','Reports':'报告','Assign homework':'布置作业','Good morning':'早上好','Good afternoon':'下午好','Good evening':'晚上好','Classes today':'今日课程','Students active':'在读学生','Homework done':'已完成作业','Last 7 days':'最近七天','Upcoming classes':'接下来的课','Recent homework':'最近作业','Finished':'已完成','Practising':'练习中','Today':'今天','min':'分钟','students':'学生','Book & unit':'课本与单元','Homework title':'作业标题','Teacher account':'教师账号','Choose a class':'选择班级','Saving…':'保存中…','Loading…':'加载中…'};
export function translateUi(text:string,language:Language){
 if(language==='both')return text;
 const leading=text.match(/^\s*/)?.[0]||'',trailing=text.match(/\s*$/)?.[0]||'',value=text.trim(),index=value.search(/[\u3400-\u9fff]/);
 if(index>0){const en=value.slice(0,index).trim().replace(/[·：:]\s*$/,'').trim(),zh=value.slice(index).trim();return leading+(language==='en'?en:zh)+trailing}
 return language==='zh'&&words[value]?leading+words[value]+trailing:text;
}
export function TeacherLanguageScope({enabled=true,children}:{enabled?:boolean;children:ReactNode}){
 const [language,setLanguage]=useState<'en'|'zh'>(()=>{try{return localStorage.getItem(key)==='zh'?'zh':'en'}catch{return 'en'}});
 useEffect(()=>{const changed=(e:StorageEvent)=>{if(e.key===key)setLanguage(e.newValue==='zh'?'zh':'en')};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed)},[]);
 const value=useMemo(()=>({language:enabled?language:'both' as Language,setLanguage:(next:'en'|'zh')=>{setLanguage(next);try{localStorage.setItem(key,next)}catch{}}}),[enabled,language]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTeacherText(){const {language}=useContext(Context);return {language,t:(text:string)=>translateUi(text,language)}}
export function UiText({text}:{text:string}){const {t}=useTeacherText();return <>{t(text)}</>}
export function TeacherLanguageSwitcher(){const {language,setLanguage}=useContext(Context);return <div className="teacher-language" role="group" aria-label="Interface language">{(['en','zh'] as const).map(l=><button key={l} type="button" lang={l==='zh'?'zh-CN':'en'} aria-label={l==='en'?'English':'中文'} aria-pressed={language===l} onClick={()=>setLanguage(l)}>{l==='en'?'EN':'中文'}</button>)}</div>}
