import {progressTone} from '../lib/weekly-homework-report';
import type {HomeworkProgress} from '../lib/student-homework-progress';
export default function HomeworkMeter({value}:{value?:HomeworkProgress}){if(!value||!value.total)return null;return <div><div className="homework-progress-label"><span>{value.done} / {value.total} steps 步骤</span><strong>{value.percent}%</strong></div><progress className={'homework-progress tone-'+progressTone(value.percent)} max={value.total} value={value.done} aria-label="Homework progress"/></div>}
