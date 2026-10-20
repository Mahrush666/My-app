import type {Word} from '../app/words';
export type SentencePractice={id:string;text:string};
export function sentencePracticeWords(sentences:SentencePractice[]):Word[]{return sentences.map(s=>({id:s.id,en:s.text,sentence:s.text,zh:'',icon:'',category:'Sentence reading'}))}
