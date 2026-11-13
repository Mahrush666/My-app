import {CalendarCheck, Check, Clock, Minus, X} from 'lucide-react';
import type {CampusAttendanceStatus} from '../lib/campus-attendance';
import {useTeacherText} from './teacher-language';
import './attendance-status-buttons.css';

const choices = [
  {status: 'present', label: 'Present 出勤', Icon: Check},
  {status: 'late', label: 'Late 迟到', Icon: Clock},
  {status: 'absent', label: 'Absent 缺席', Icon: X},
  {status: 'excused', label: 'Excused 请假', Icon: CalendarCheck},
  {status: 'unmarked', label: 'Clear 清除', Icon: Minus},
] as const;

export default function AttendanceStatusButtons({name, value, disabled, onChange}: {
  name: string;
  value: string;
  disabled?: boolean;
  onChange: (status: CampusAttendanceStatus) => void;
}) {
  const {t, language} = useTeacherText();
  return <div className="attendance-status-buttons" role="group" aria-label={language === 'zh' ? name + '的出勤' : 'Attendance for ' + name}>
    {choices.map(({status, label, Icon}) => {
      const selected = value === status;
      const title = status === 'unmarked' && selected ? t('Not marked 未记录') : t(label);
      return <button key={status} type="button" data-status={status} aria-pressed={selected}
        aria-label={title} title={title} disabled={disabled}
        onClick={() => { if (!selected) onChange(status); }}>
        <Icon size={17} aria-hidden="true"/>
        <span>{t(label)}</span>
      </button>;
    })}
  </div>;
}
