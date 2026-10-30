import {useMemo,useState} from 'react';
import {BookHeart,CheckCircle2,ClipboardCheck,HeartHandshake,LockKeyhole,MessageCircleQuestion} from 'lucide-react';
import type {Journey} from '../lib/domain';
import {safeFamilyDigest} from './FamilyIntelligenceV203';
import {readable} from '../lib/domain';
import {useMamaLocale} from '../lib/locale';
const tasks=[
 {id:'support',en:'Identify a trusted support person',sw:'Tambua mtu wa karibu wa kukusaidia'},
 {id:'transport',en:'Discuss practical transport options',sw:'Jadili usafiri unaopatikana'},
 {id:'food',en:'Plan household meals and essential supplies',sw:'Panga chakula na mahitaji ya nyumbani'},
 {id:'help',en:'Share everyday responsibilities with permission',sw:'Gawana majukumu kwa ridhaa'}
] as const;
const followThrough=[
 {id:'questions',en:'Confirm which questions were answered',sw:'Thibitisha maswali yaliyojibiwa'},
 {id:'notes',en:'Write down any instructions in your private journal',sw:'Andika maelekezo kwenye kumbukumbu zako binafsi'},
 {id:'timing',en:'Confirm the next follow-up directly with your provider',sw:'Thibitisha miadi ijayo na mtaalamu wako'}
] as const;
export function storybookPreview(journeys:Journey[]){
 return safeFamilyDigest(journeys).slice(0,12).map(event=>({
  id:event.id,date:event.day,label:event.label,status:event.status,
  month:event.day.slice(0,7)
 }));
}
export function FamilyExperienceV208({journeys,demo}:{journeys:Journey[];demo:boolean}){
 const {locale}=useMamaLocale();
 const [done,setDone]=useState<string[]>([]);
 const story=useMemo(()=>demo?storybookPreview(journeys):[],[demo,journeys]);
 return <section className="mm208-studio" aria-labelledby="mm208-title">
  <div className="mm208-header"><span className="mm208-mark"><HeartHandshake size={22} aria-hidden="true"/></span>
   <div><span className="eyebrow">BETA.8 · FAMILY CONNECTIONS</span><h3 id="mm208-title">{locale==='sw'?'Hadithi na msaada wa familia':'Family Storybook & Support'}</h3>
   <p>{locale==='sw'?'Mpango na matukio ya mfano pekee.':'A gentle look at sample milestones and everyday help. No clinical records are shared.'}</p></div>
  </div>
  {!demo?<p className="mm208-locked"><LockKeyhole size={16} aria-hidden="true"/> Available only in the sample-data demo pending independent privacy review.</p>:
  <div className="mm208-grid">
   <div className="mm208-block"><h4><BookHeart size={18} aria-hidden="true"/>{locale==='sw'?'Matukio ya familia':'Journey Storybook'}</h4>
    {story.length?<ol className="mm208-story">{story.slice(0,6).map(event=><li key={event.id}><time dateTime={event.date}>{readable(event.date)}</time><span>{event.label}</span></li>)}</ol>:<p className="mm208-muted">No sample milestones recorded yet.</p>}
    <p className="mm208-muted">{locale==='sw'?'Tarehe za kumbukumbu pekee.':'Dates and generic event types only. No private notes or medical details.'}</p>
   </div>
   <div className="mm208-block"><h4><ClipboardCheck size={18} aria-hidden="true"/>{locale==='sw'?'Mpango wa msaada':'Everyday support planner'}</h4>
    <p className="mm208-muted">{locale==='sw'?'Chagua kazi za mfano.':'Sample-only tasks. Selections remain in this open view and are never transmitted.'}</p>
    <div className="mm208-progress" role="status">{done.length} / {tasks.length} {locale==='sw'?'zimechaguliwa':'selected'}</div>
    <div className="mm208-tasks">{tasks.map(item=><label key={item.id}><input type="checkbox" checked={done.includes(item.id)} onChange={e=>setDone(old=>e.target.checked?[...old,item.id]:old.filter(id=>id!==item.id))}/><span>{locale==='sw'?item.sw:item.en}</span></label>)}</div>
   </div>
  </div>}
 </section>;
}
export function VisitFollowThroughV208({demo}:{demo:boolean}){
 const {locale}=useMamaLocale();
 const [checked,setChecked]=useState<string[]>([]);
 return <section className="mm208-visit" aria-labelledby="mm208-follow-title">
  <div className="mm208-header"><span className="mm208-mark"><MessageCircleQuestion size={21} aria-hidden="true"/></span>
   <div><h3 id="mm208-follow-title">{locale==='sw'?'Baada ya ziara':'After your journal visit'}</h3>
    <p>{locale==='sw'?'Maswali ya kufuatilia ya jumla.':'A general question-and-organization checklist, not a clinic-approved follow-up plan.'}</p></div>
  </div>
  {!demo?<p className="mm208-locked"><LockKeyhole size={16}/> Sample questions only until privacy approval.</p>:
   <div className="mm208-tasks">{followThrough.map(item=><label key={item.id}><input type="checkbox" checked={checked.includes(item.id)} onChange={e=>setChecked(old=>e.target.checked?[...old,item.id]:old.filter(id=>id!==item.id))}/><span>{locale==='sw'?item.sw:item.en}</span></label>)}</div>}
  <p className="mm208-muted"><CheckCircle2 size={15} aria-hidden="true"/> No appointment confirmations, clinical decisions, or patient-data transfers.</p>
 </section>;
}
