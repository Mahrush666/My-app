// Only exercises with checked answers count toward automatic homework completion.
export const answerActivities = ['picture-listen','word-choice','sound-picture','yes-no','match','spell','reactor','ward','sprint','lesson'];
export const requiresAnswers = (activity:string) => answerActivities.includes(activity);
export function homeworkFinished(assignment:{id:string;activities:string},completed:{assignment_id:string;activity:string}[]){
 const required=(JSON.parse(assignment.activities) as string[]).filter(requiresAnswers);
 return required.every(activity=>completed.some(c=>c.assignment_id===assignment.id&&c.activity===activity));
}
