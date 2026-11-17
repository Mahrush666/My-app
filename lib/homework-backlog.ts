import {requiresAnswers} from './homework-completion';
import {countsForHomework,type TeacherAssignment} from './teacher-homework';

type Student = {id:string; group_id:string; name:string; approved:number};
type Report = {child_id:string; assignment_id:string; completed:string};

const threshold = 4;

export function homeworkBacklog(assignments:TeacherAssignment[], students:Student[], reports:Report[]) {
 const studentIds = new Set<string>();
 const groupIds = new Set<string>();
 const roster = new Map<string,Student[]>();
 for (const student of students) {
  if (!student.approved || !countsForHomework(student)) continue;
  if (!roster.has(student.group_id)) roster.set(student.group_id, []);
  roster.get(student.group_id)!.push(student);
 }

 // Combine assignments for the same lesson and order lessons by their latest assignment.
 const groups = new Map<string,Map<string,{id:string; required:string[]}[]>>();
 for (const assignment of [...assignments].sort((a,b) => b.updated_at - a.updated_at)) {
  if (assignment.archived || !roster.has(assignment.group_id)) continue;
  const required = (JSON.parse(assignment.activities) as string[]).filter(requiresAnswers);
  if (!required.length) continue;
  if (!groups.has(assignment.group_id)) groups.set(assignment.group_id, new Map());
  const lessons = groups.get(assignment.group_id)!;
  if (!lessons.has(assignment.unit_id)) lessons.set(assignment.unit_id, []);
  lessons.get(assignment.unit_id)!.push({id:assignment.id, required});
 }

 const completion = new Map<string,Set<string>>();
 for (const report of reports) {
  const activities = JSON.parse(report.completed) as string[];
  if (activities.length) completion.set(report.child_id + ':' + report.assignment_id, new Set(activities));
 }

 for (const [groupId, lessons] of groups) {
  if (lessons.size < threshold) continue;
  const streak = new Map<string,number>();
  let groupStreak = 0;
  for (const assignments of lessons.values()) {
   let everyoneFinished = true;
   for (const student of roster.get(groupId)!) {
    const finished = assignments.every(({id, required}) => {
     const done = completion.get(student.id + ':' + id);
     return done && required.every(activity => done.has(activity));
    });
    const count = finished ? 0 : (streak.get(student.id) ?? 0) + 1;
    streak.set(student.id, count);
    if (!finished) everyoneFinished = false;
    if (count >= threshold) studentIds.add(student.id);
   }
   groupStreak = everyoneFinished ? 0 : groupStreak + 1;
   if (groupStreak >= threshold) groupIds.add(groupId);
  }
 }
 return {studentIds, groupIds};
}
