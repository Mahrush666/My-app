import type {Word} from '../app/words';
export type SentencePractice={id:string;text:string;picture?:string;prompt?:string;hideWritten?:boolean};
export function sentencePracticeWords(sentences:SentencePractice[]):Word[]{return sentences.map(s=>({id:s.id,en:s.text,sentence:s.text,zh:'',icon:'',picture:s.picture,speakingPrompt:s.prompt,hideWritten:s.hideWritten,category:'Sentence reading'}))}
