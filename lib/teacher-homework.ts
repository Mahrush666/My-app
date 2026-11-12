import type {HomeworkProgress} from './student-homework-progress';
export type TeacherAssignment={id:string;group_id:string;unit_id:string;title:string;activities:string;word_ids:string;due_date:string;updated_at:number;archived?:boolean};
export type AssignmentStudent={id:string;name:string;lastSeen:number|null;progress:HomeworkProgress};
export type AssignmentOverview={id:string;students:AssignmentStudent[];finished:number;totalStudents:number;percent:number};

export function countsForHomework(student:{name:string}){
 return !student.name.toLowerCase().includes('test');
}
