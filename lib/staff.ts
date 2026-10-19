export const staffPermissions=[['students','Manage students 管理学生'],['attendance','Mark attendance 记录出勤'],['schedule','Manage class schedule 管理排课'],['assignments','Assign homework 布置作业'],['rewards','Give rewards 发放奖励'],['materials','Edit lesson settings 编辑课程设置'],['delete','Delete students and assignments 删除学生与作业']] as const;
export type StaffPermission=typeof staffPermissions[number][0];
export const rolePermissions={teacher:['students','attendance','schedule','assignments','rewards'] as StaffPermission[],assistant:['attendance'] as StaffPermission[]};
export type StaffAccess={owner:boolean;name:string;permissions:StaffPermission[];groups:string[]};
export type StaffMember={id:string;name:string;username:string;role:'teacher'|'assistant';permissions:StaffPermission[];groups:string[];active:number;ready:boolean};
