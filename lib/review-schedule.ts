import type { Progress, Word } from '@/app/words';

export const REVIEW_DELAYS = [600_000, 86_400_000, 259_200_000, 604_800_000, 1_209_600_000];
// Corrections help practice, but do not immediately erase a mistake or advance a word repeatedly.
export function nextReview(previous: Progress[string] | undefined, correct: boolean, now: number): Progress[string] {
  if (!correct) return { step: 0, due: now + REVIEW_DELAYS[0] };
  if (previous && previous.due > now) return previous;
  const step = Math.min((previous?.step || 0) + 1, 4);
  return { step, due: now + REVIEW_DELAYS[step] };
}

export function lessonWords(vocabulary: Word[], progress: Progress, now: number, limit = 6): Word[] {
  const ranked = vocabulary.map((word, position) => {
    const review = progress[word.id || word.en];
    const priority = review?.step === 0 ? 0 : review && review.due <= now ? 1 : !review ? 2 : 3;
    return { word, position, priority, due: review?.due || 0 };
  }).sort((a, b) => a.priority - b.priority || a.due - b.due || a.position - b.position);
  const picked = ranked.slice(0, limit);
  const unseen = ranked.find(item => item.priority === 2 && !picked.includes(item));
  if (unseen && picked.length === limit && limit > 1) picked[picked.length - 1] = unseen;
  return picked.map(item => item.word);
}

export function sentenceTokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}
export function answerKey(text: string): string {
  return text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '');
}
