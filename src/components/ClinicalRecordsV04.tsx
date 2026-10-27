import {useEffect,useState} from 'react';
import {Baby,CalendarDays,CheckCircle2,FileClock,Info,ShieldCheck,Syringe,TrendingUp} from 'lucide-react';
import type {Journey} from '../lib/domain';
import CurrentFeatureHeading from './CurrentFeatureHeading';
import {readable} from '../lib/domain';
import {supabase} from '../lib/supabase';
interface Row {date:string;title:string;description:string;type:'visit'|'growth'|'vaccination'}
interface Props {journey:Journey; isDemo:boolean}
function fallback(j:Journey):Row[]{
 const visits=j.visits.map(v=>({date:v.scheduled_on,title:v.clinic,description:v.attended?'Antenatal visit attended':'Antenatal visit planned',type:'visit' as const}));
 const growth=j.growth.map(g=>({date:g.measured_on,title:'Growth measurement',description:[g.weight_kg!=null?g.weight_kg+' kg':null,g.length_cm!=null?g.length_cm+' cm':null].filter(Boolean).join(' · '),type:'growth' as const}));
 const doses=(j.immunizations??[]).map(v=>({date:v.given_on,title:'Vaccine record: '+v.dose_id,description:v.facility||'Caregiver-entered record',type:'vaccination' as const}));
 return [...visits,...growth,...doses].sort((a,b)=>b.date.localeCompare(a.date));
}
export default function ClinicalRecordsV04({journey,isDemo}:Props){
 const [items,setItems]=useState<Row[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  let active=true;setError('');
  if(isDemo||!supabase){setItems(fallback(journey));return;}
  const client=supabase;setLoading(true);setItems([]);
  void Promise.all([
   client.from('journey_visits').select('scheduled_on,clinic,attended').eq('journey_id',journey.id).order('scheduled_on',{ascending:false}),
   client.from('child_measurements').select('measured_on,weight_kg,length_cm').eq('journey_id',journey.id).order('measured_on',{ascending:false}),
   client.from('child_immunizations').select('given_on,dose_id,facility').eq('journey_id',journey.id).order('given_on',{ascending:false})
  ]).then(([visits,measures,immunizations])=>{
   if(!active)return;
   if(visits.error||measures.error||immunizations.error){
    setError('Clinical timeline records are currently unavailable. Verify your account access and current clinical-read database setup.');
   }else{
    const rows:Row[]=[
     ...(visits.data??[]).map(v=>({date:v.scheduled_on,title:v.clinic,description:v.attended?'Antenatal visit attended':'Antenatal visit planned',type:'visit' as const})),
     ...(measures.data??[]).map(g=>({date:g.measured_on,title:'Growth measurement',description:[g.weight_kg!=null?g.weight_kg+' kg':null,g.length_cm!=null?g.length_cm+' cm':null].filter(Boolean).join(' · '),type:'growth' as const})),
     ...(immunizations.data??[]).map(v=>({date:v.given_on,title:'Vaccine record: '+v.dose_id,description:v.facility||'Caregiver-entered record',type:'vaccination' as const}))
    ];
    setItems(rows.sort((a,b)=>b.date.localeCompare(a.date)));
   }
   setLoading(false);
  }).catch(()=>{if(active){setLoading(false);setError('Unable to load the clinical record timeline.');}});
  return ()=>{active=false;};
 },[journey,isDemo]);
 const visits=items.filter(v=>v.type==='visit').length, growth=items.filter(v=>v.type==='growth').length, doses=items.filter(v=>v.type==='vaccination').length;
 return <div className="page-content v4-page">
  <CurrentFeatureHeading eyebrow="YOUR FAMILY • CARE HISTORY" title="Clinical record timeline" description="A chronological view of recorded pregnancy visits, baby growth and vaccination notes." Icon={FileClock} tone="lilac"/>
  <div className="v4-record-stats"><div><CalendarDays size={20}/><small>Antenatal visits</small><strong>{visits}</strong></div><div><TrendingUp size={20}/><small>Measurements</small><strong>{growth}</strong></div><div><Syringe size={20}/><small>Recorded doses</small><strong>{doses}</strong></div></div>
  <div className="v4-guidance-head"><span><ShieldCheck size={25}/></span><div><strong>A connected health story—not a certified EHR</strong><p>Records are caregiver-entered. In authenticated mode the timeline reads owner-protected normalized database tables synchronized from the existing pregnancy journal. These read models do not replace your clinic's official notes or vaccination card.</p></div></div>
  <section className="panel"><div className="panel-heading"><div><div className="eyebrow">YOUR ENTRIES</div><h3>Care history</h3></div><FileClock size={20}/></div>
   {loading&&<p className="v4-hint">Loading synchronized clinical records…</p>}
   {error&&<p className="v4-error" role="alert">{error}</p>}
   {!loading&&!error&&items.length===0&&<div className="v4-empty"><Baby size={27}/><p>No records yet. Add an antenatal visit, growth measurement or vaccination entry to begin your timeline.</p></div>}
   {!loading&&!error&&<div className="v4-timeline">{items.map((item,i)=><div className="v4-record-row" key={i+'-'+item.type+'-'+item.date}><span className="v4-record-icon">{item.type==='visit'?<CalendarDays size={18}/>:item.type==='growth'?<TrendingUp size={18}/>:<Syringe size={18}/>}</span><div><strong>{item.title}</strong><p>{item.description}</p></div><small>{readable(item.date)}</small></div>)}</div>}
  </section>
  <div className="v4-record-disclaimer"><Info size={17}/><p>This timeline presents caregiver-entered records and read-only synchronized views where available. Other clinical data models may exist separately, but this screen is not a certified electronic health record or proof of treatment. Ask a qualified clinician to verify dates, results, and medical findings.</p></div>
  <p className="v4-hint"><CheckCircle2 size={16}/> All record access remains limited to the signed-in account through database row-level security.</p>
 </div>;
}
