import {powerUp1Course,powerUp1Unit,powerUp1LessonUnit,type CourseUnitInfo} from '../lib/power-up-1-course';
import {UiText} from './teacher-language';
import './course-info.css';

function UnitContent({unit}:{unit:CourseUnitInfo}){
 return <div className="course-unit-content">
  <p className="course-page"><UiText text="Book page 课本页码"/> {unit.page}</p>
  {unit.mission&&<p className="course-mission"><strong><UiText text="Mission 任务"/>: </strong>{unit.mission}</p>}
  <dl className="course-topics">
   <div><dt><UiText text="Vocabulary 词汇"/></dt><dd><ul>{unit.vocabulary.map(v=><li key={v}>{v}</li>)}</ul></dd></div>
   {unit.sounds&&<div><dt><UiText text="Sounds and spelling 发音与拼写"/></dt><dd className="course-sounds">{unit.sounds.map(sound=><span key={sound}>{sound}</span>)}</dd></div>}
   <div><dt><UiText text="Grammar 语法"/></dt><dd>{unit.grammar.map(g=><section key={g.topic}><h4>{g.topic}</h4><ul>{g.examples.map(e=><li key={e}>{e}</li>)}</ul></section>)}</dd></div>
   {unit.crossCurricular&&<div><dt><UiText text="Cross-curricular 跨学科学习"/></dt><dd><h4>{unit.crossCurricular.title}</h4><p>{unit.crossCurricular.focus}</p></dd></div>}
   {unit.literature&&<div><dt><UiText text="Literature 故事与诗歌"/></dt><dd><h4>{unit.literature.title}</h4><p>{unit.literature.genre}</p><p><strong><UiText text="Social and emotional skill 社交与情感技能"/>: </strong>{unit.literature.socialSkill}</p></dd></div>}
   {unit.assessment&&<div><dt><UiText text="Assessment 测评练习"/></dt><dd><p>Pre A1 Starters</p><ul>{unit.assessment.map(a=><li key={a}>{a}</li>)}</ul></dd></div>}
  </dl>
 </div>;
}
export function UnitInfo({unit}:{unit:CourseUnitInfo}){
 return <details className="course-info course-unit-info"><summary><UiText text="About this unit 单元介绍"/> · {unit.number?`Unit ${unit.number} · `:''}{unit.title}</summary><UnitContent unit={unit}/></details>;
}
export default function CourseInfo({book,unitNumber}:{book:string;unitNumber?:number}){
 if(book!==powerUp1Course.book)return null;
 const unit=unitNumber===undefined?undefined:powerUp1Unit(unitNumber);
 return <aside className="course-reference" aria-label="Power Up 1 course information">
  <details className="course-info course-book-info"><summary><UiText text="About Power Up 1 关于课本"/></summary><div className="course-book-content">
   <h2>{powerUp1Course.title}</h2><p>{powerUp1Course.description}</p><p>{powerUp1Course.assessment}</p>
   <p className="course-outline-note"><UiText text="The full book outline is shown below. Open a unit to see its learning goals. Practice lessons are listed separately in the app. 以下为全书学习内容，展开单元可查看学习目标；练习课程在应用中单独列出。"/></p>
   {powerUp1Course.units.map(u=><div key={u.number}><UnitInfo unit={u}/>{powerUp1Course.reviews.filter(r=>r.after===u.number).map(r=><p key={r.after} className="course-review">{r.title} · <UiText text="Review 复习"/></p>)}</div>)}
   <p className="course-source"><UiText text="Source: the supplied Power Up 1 contents pages. 来源：所提供的 Power Up 1 目录页。"/></p>
  </div></details>
  {unit&&<UnitInfo key={unit.number} unit={unit}/>}
 </aside>;
}
export function LessonCourseInfo({lessonId}:{lessonId?:string}){
 const unit=powerUp1LessonUnit(lessonId);
 return unit?<aside className="course-reference" aria-label="Unit learning goals"><UnitInfo key={unit.number} unit={unit}/></aside>:null;
}
