import {useState} from 'react';
import {ArrowDownToLine,BookOpen,ExternalLink,ShieldAlert} from 'lucide-react';
import {useMamaLocale} from '../lib/locale';
import {PUBLIC_LESSONS,publicLessonText} from '../content/publicLessons';
/** Static public lessons only. No private account context, tracking or clinical approval. */
export default function PublicLearningV204(){
 const {locale}=useMamaLocale();
 const [active,setActive]=useState(PUBLIC_LESSONS[0].id);
 const lesson=PUBLIC_LESSONS.find(l=>l.id===active)??PUBLIC_LESSONS[0];
 const i=locale==='sw'?1:0;
 function download(){
  const body=publicLessonText(lesson.id,locale);
  const url=URL.createObjectURL(new Blob([body],{type:'text/plain;charset=utf-8'}));
  const el=document.createElement('a');el.href=url;el.download='mamamwana-public-'+lesson.id+'-'+locale+'.txt';el.click();URL.revokeObjectURL(url);
 }
 return <section className="mm24-learning" aria-labelledby="mm24-title">
  <div className="mm24-head"><span className="mm24-mark"><BookOpen size={23} aria-hidden="true"/></span><div><span className="mm24-eyebrow">PUBLIC LEARNING · NO PERSONAL DATA</span><h3 id="mm24-title">{locale==='sw'?'Mafunzo ya familia':'Family learning studio'}</h3><p>{locale==='sw'?'Masomo mafupi ya jumla yanayopatikana kwa lugha mbili.':'Bite-sized, bilingual public learning prompts for everyday family life.'}</p></div></div>
  <div className="mm24-grid"><div className="mm24-topics" role="group" aria-label="Public learning topics">{PUBLIC_LESSONS.map(l=><button key={l.id} type="button" aria-pressed={l.id===active} onClick={()=>setActive(l.id)}>{l.heading[i]}</button>)}</div><article className="mm24-detail" aria-labelledby="mm24-lesson-title"><h4 id="mm24-lesson-title">{lesson.heading[i]}</h4><p>{lesson.summary[i]}</p><p>{lesson.steps[i]}</p><div className="mm24-warning"><ShieldAlert size={17} aria-hidden="true"/><span>{locale==='sw'?'Mafunzo ya jumla tu. Maudhui haya hayajaidhinishwa kwa matumizi ya kitabibu.':'General learning only. No independent medical or translation approval has been granted.'}</span></div><div className="mm24-actions"><button type="button" onClick={download}><ArrowDownToLine size={17} aria-hidden="true"/> {locale==='sw'?'Pakua somo':'Download public lesson'}</button><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">Source reference <ExternalLink size={15} aria-hidden="true"/></a></div></article></div>
  <a className="mm24-guide" download="mamamwana-public-guide.txt" href="/learning/mamamwana-public-guide-v204.txt"><ArrowDownToLine size={17} aria-hidden="true"/>{locale==='sw'?'Pakua mwongozo wa umma wa EN/SW':'Download complete EN/SW public guide'}</a>
  <p className="mm24-note">Public demo shell and guide are offline-ready after a successful initial load on supported devices. Private records, clinical writes and patient content are never cached.</p>
 </section>;
