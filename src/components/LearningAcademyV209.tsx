import {useState} from 'react';
import {ArrowDownToLine,BookOpenCheck,CheckCircle2,ExternalLink,WifiOff} from 'lucide-react';
import {ACADEMY_TOPICS,academyAnswer} from '../content/learningAcademyV209';
import {useMamaLocale} from '../lib/locale';
/** General public lessons; progress exists only in component memory, never in account storage. */
export default function LearningAcademyV209(){
 const {locale}=useMamaLocale();
 const [active,setActive]=useState(ACADEMY_TOPICS[0].id);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [textOnly,setTextOnly]=useState(false);
 const index=locale==='sw'?1:0;
 const topic=ACADEMY_TOPICS.find(t=>t.id===active)??ACADEMY_TOPICS[0];
 const choice=answers[topic.id],answer=choice===undefined?null:academyAnswer(topic.id,choice);
 const finished=ACADEMY_TOPICS.filter(t=>answers[t.id]===t.correct).length;
 return <section className={'mm209-academy '+(textOnly?'mm209-text-only':'')} aria-labelledby="mm209-title">
  <header className="mm209-head"><span className="mm209-icon"><BookOpenCheck size={22} aria-hidden="true"/></span><div>
    <span className="eyebrow">BETA.9 · PUBLIC LEARNING</span><h3 id="mm209-title">{locale==='sw'?'Akademia ya familia':'Family Learning Academy'}</h3>
    <p>{locale==='sw'?'Jaribu maswali ya jumla kwa Kiswahili au Kiingereza.':'Short, general knowledge checks in English or Kiswahili. Not approved medical training.'}</p>
   </div></header>
  <div className="mm209-toolbar"><span role="status">{finished} / {ACADEMY_TOPICS.length} {locale==='sw'?'mada zimeeleweka':'topics completed in this view'}</span>
   <label className="mm209-low-data"><input type="checkbox" checked={textOnly} onChange={e=>setTextOnly(e.target.checked)}/><WifiOff size={16} aria-hidden="true"/>{locale==='sw'?'Muonekano wa maandishi':'Text-first display'}</label>
  </div>
  <div className="mm209-layout"><div className="mm209-topics" role="group" aria-label="Learning Academy topics">
   {ACADEMY_TOPICS.map(t=><button type="button" key={t.id} aria-pressed={active===t.id} onClick={()=>setActive(t.id)}>
    <span>{t.heading[index]}</span>{answers[t.id]===t.correct&&<CheckCircle2 size={15} aria-label="Completed in this view"/>}</button>)}
  </div><article className="mm209-lesson">
   <small>{locale==='sw'?'Maudhui ya jumla hayajakaguliwa':'GENERAL CONTENT · UNREVIEWED'}</small>
   <h4>{topic.heading[index]}</h4><fieldset><legend>{topic.prompt[index]}</legend>
    {topic.answers[index].map((option,i)=><label key={option}><input type="radio" name={'mm209-'+topic.id} checked={choice===i} onChange={()=>setAnswers(v=>({...v,[topic.id]:i}))}/><span>{option}</span></label>)}
   </fieldset>
   {answer&&<p className="mm209-feedback" role="status"><strong>{answer.correct?(locale==='sw'?'Sahihi':'Correct'):(locale==='sw'?'Jaribu tena':'Try again')}.</strong> {answer.explanation[index]}</p>}
   <p className="mm209-source">{locale==='sw'?'Hali: Haijapitiwa na wataalamu':'Status: General, not independently reviewed'} · <a href={topic.source} target="_blank" rel="noopener noreferrer">{locale==='sw'?'Chanzo cha kusoma':'Source reference'} <ExternalLink size={13} aria-hidden="true"/></a></p>
  </article></div>
  <a className="mm209-pack" href="/learning/mamamwana-learning-essentials-v209.txt" download="mamamwana-public-learning-essentials-en-sw.txt"><ArrowDownToLine size={17} aria-hidden="true"/>{locale==='sw'?'Pakua masomo ya umma':'Download bilingual public learning pack'}</a>
  <p className="mm209-footnote">{locale==='sw'?'Hakuna taarifa binafsi zinazohifadhiwa.':'Public offline material only. Answers and progress reset when this view is closed; no private records are cached.'}</p>
 </section>;
}
