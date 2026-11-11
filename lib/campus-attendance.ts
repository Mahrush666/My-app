export const campusAttendanceStatuses=['unmarked','present','late','absent','excused'] as const;
export type CampusAttendanceStatus=typeof campusAttendanceStatuses[number];
export type CampusAttendanceMark={childId:string;status:CampusAttendanceStatus;lessons:string};
export type CampusAttendanceRow=CampusAttendanceMark & {name:string;groupName:string};
export const campusLessonsLimit=200;

export function isHtCampus(name:string){
 return /^ht(?:$|[\s._(（-]|校区)/i.test(name.trim());
}
