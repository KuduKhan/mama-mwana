import {useEffect,useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {Baby,Plus,RefreshCw,ShieldCheck,TrendingUp,CalendarCheck} from 'lucide-react';
import {supabase} from '../lib/supabase';
import LegacyAttributionV10 from './LegacyAttributionV10';
import {CaregiverOwnerPanel} from './CaregiverAccessV10';
import {readable,todayISO} from '../lib/domain';
import type {Journey} from '../lib/domain';
import {nextBirthOrder,validateChildDraft,validateGrowthDraft,validateVaccineDraft} from '../lib/family';
import type {FamilyChild,FamilyGrowth,FamilyVaccine,FamilySex} from '../lib/family';

interface Props{journey:Journey;isDemo:boolean;userId:string|null}
export default function FamilyChildrenV09({journey,isDemo,userId}:Props){
 const demo=isDemo||!userId;
 const [children,setChildren]=useState<FamilyChild[]>([]);
 const [growth,setGrowth]=useState<FamilyGrowth[]>([]);
 const [vaccines,setVaccines]=useState<FamilyVaccine[]>([]);
 const [selected,setSelected]=useState('');
 const [childName,setChildName]=useState('');
 const [born,setBorn]=useState(journey.baby_birth_date??todayISO());
 const [sex,setSex]=useState<FamilySex>('unknown');
 const [measuredOn,setMeasuredOn]=useState(todayISO());
 const [weight,setWeight]=useState('');
 const [length,setLength]=useState('');
 const [dose,setDose]=useState('');
 const [givenOn,setGivenOn]=useState(todayISO());
 const [facility,setFacility]=useState('');
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [loadFailed,setLoadFailed]=useState(false);
 const [reload,setReload]=useState(0);
 useEffect(()=>{
  let alive=true;
  setChildren([]);setGrowth([]);setVaccines([]);setSelected('');setError('');setNotice('');setLoadFailed(false);
  if(demo){
   if(journey.baby_birth_date&&journey.baby_name){
    const primary:FamilyChild={id:'sample-'+journey.id,journey_id:journey.id,owner_id:'demo',birth_order:1,display_name:journey.baby_name,born_on:journey.baby_birth_date,sex:journey.baby_sex??'unknown',version:1};
    setChildren([primary]);setSelected(primary.id);
   }
   return;
  }
  const client=supabase;
  if(!client){setError('A private database connection is required.');setLoadFailed(true);return;}
  setLoading(true);
  void (async()=>{
   try{
    const c=await client.from('family_children').select('id,journey_id,owner_id,birth_order,display_name,born_on,sex,version')
       .eq('journey_id',journey.id).order('birth_order',{ascending:true}).limit(8);
    if(c.error)throw c.error;
    const rows=(c.data??[]) as FamilyChild[],ids=rows.map(x=>x.id);
    const [g,v]=ids.length?await Promise.all([
      client.from('family_growth_entries').select('id,child_id,owner_id,measured_on,weight_kg,length_cm').in('child_id',ids).order('measured_on',{ascending:false}).limit(300),
      client.from('family_vaccine_entries').select('id,child_id,owner_id,vaccine_label,given_on,facility').in('child_id',ids).order('given_on',{ascending:false}).limit(300)
    ]):[{data:[],error:null},{data:[],error:null}];
    if(g.error||v.error)throw g.error??v.error;
    if(alive){setChildren(rows);setGrowth((g.data??[]) as FamilyGrowth[]);setVaccines((v.data??[]) as FamilyVaccine[]);setSelected(rows[0]?.id??'');setLoading(false);}
   }catch{if(alive){setError('Family records are unavailable. Verify the v0.9 migration and your account permissions.');setLoadFailed(true);setLoading(false);}}
  })();
  return ()=>{alive=false;};
 },[demo,journey.id,userId,reload]);
 const child=useMemo(()=>children.find(x=>x.id===selected),[children,selected]);
 const canSave=!busy&&!loading&&!loadFailed;
 async function addChild(e:FormEvent){
  e.preventDefault();setError('');setNotice('');
  const problem=validateChildDraft(childName,born,journey.due_date);
  if(problem){setError(problem);return;}
  const birthOrder=nextBirthOrder(children);
  if(birthOrder>8){setError('Up to eight child profiles may be associated with a pregnancy.');return;}
  const values={journey_id:journey.id,owner_id:userId??'demo',birth_order:birthOrder,display_name:childName.trim(),born_on:born,sex,version:1};
  if(demo){const item={...values,id:crypto.randomUUID()};setChildren(rows=>[...rows,item]);setSelected(item.id);setChildName('');setNotice('Sample child added to this screen only.');return;}
  const client=supabase;if(!client||!userId||!canSave)return;setBusy(true);
  try{
   const {data,error:saveError}=await client.from('family_children').insert(values)
    .select('id,journey_id,owner_id,birth_order,display_name,born_on,sex,version').single();
   if(saveError||!data)throw new Error('Failed to insert child');
   setChildren(rows=>[...rows,data as FamilyChild]);setSelected(data.id);setChildName('');setNotice('Private child profile saved.');
  }catch{setError('Unable to save the child profile. Review your details and try again.');}finally{setBusy(false);}
 }
 async function addGrowth(e:FormEvent){
  e.preventDefault();setError('');setNotice('');if(!child)return;
  const w=weight.trim()?Number(weight):null,l=length.trim()?Number(length):null;
  const problem=validateGrowthDraft(measuredOn,child.born_on,w,l);
  if(problem){setError(problem);return;}
  const values={child_id:child.id,owner_id:userId??'demo',measured_on:measuredOn,weight_kg:w,length_cm:l,version:1};
  if(demo){setGrowth(rows=>[{...values,id:crypto.randomUUID()},...rows]);setWeight('');setLength('');setNotice('Unsaved demo measurement.');return;}
  const client=supabase;if(!client||!userId||!canSave)return;setBusy(true);
  try{
   const {data,error:saveError}=await client.from('family_growth_entries').insert(values)
    .select('id,child_id,owner_id,measured_on,weight_kg,length_cm').single();
   if(saveError||!data)throw new Error('Failed to insert measurement');
   setGrowth(rows=>[data as FamilyGrowth,...rows]);setWeight('');setLength('');setNotice('Measurement saved; clinical interpretation is not provided.');
  }catch{setError('Unable to save the child measurement.');}finally{setBusy(false);}
 }
 async function addVaccine(e:FormEvent){
  e.preventDefault();setError('');setNotice('');if(!child)return;
  const problem=validateVaccineDraft(dose,givenOn,child.born_on);
  if(problem){setError(problem);return;}
  const values={child_id:child.id,owner_id:userId??'demo',vaccine_label:dose.trim(),given_on:givenOn,facility:facility.trim().slice(0,100),version:1};
  if(demo){setVaccines(rows=>[{...values,id:crypto.randomUUID()},...rows]);setDose('');setNotice('Unsaved demo vaccination note.');return;}
  const client=supabase;if(!client||!userId||!canSave)return;setBusy(true);
  try{
   const {data,error:saveError}=await client.from('family_vaccine_entries').insert(values)
     .select('id,child_id,owner_id,vaccine_label,given_on,facility').single();
   if(saveError||!data)throw new Error('Failed to insert vaccination');
   setVaccines(rows=>[data as FamilyVaccine,...rows]);setDose('');setNotice('Caregiver-entered vaccination note saved.');
  }catch{setError('Unable to save the vaccination note.');}finally{setBusy(false);}
 }
 return <section className="family09 panel" aria-label="Separate child profiles">
  <div className="family09-header"><div><span className="eyebrow">MAMAMWANA • SEPARATE CHILD HEALTH JOURNALS</span><h3>Children in this pregnancy</h3><p>Distinct personal profiles for single births, twins and multiples.</p></div>
   <button type="button" onClick={()=>setReload(v=>v+1)} aria-label="Refresh children" disabled={!canSave}><RefreshCw size={19}/></button></div>
  <p className="family09-private"><ShieldCheck size={18}/> Only the signed-in owner can see these entries. Sharing with other caregivers is not yet enabled. Original legacy child records remain with the first journey, not automatically reassigned.</p>
  {loading&&<p role="status">Loading child profiles securely…</p>}
  {error&&<p role="alert" className="family09-error">{error}</p>}
  {notice&&<p role="status" className="family09-ok">{notice}</p>}
  {!loading&&!loadFailed&&<>
   {children.length>0?<div className="family09-profiles" role="group" aria-label="Select a child">
     {children.map(c=><button type="button" key={c.id} className={selected===c.id?'chosen':''} onClick={()=>setSelected(c.id)}><Baby size={20}/><span><strong>{c.display_name}</strong><small>Child {c.birth_order} · {readable(c.born_on)}</small></span></button>)}
    </div>:<p className="muted">No child profile yet. Recording a birth will also create the first profile.</p>}
   <form className="family09-form" onSubmit={e=>{void addChild(e)}}>
    <h4>Add another child to this pregnancy</h4>
    <div className="family09-grid">
     <label>Name<input value={childName} required maxLength={80} onChange={e=>setChildName(e.target.value)}/></label>
     <label>Birth date<input type="date" required max={todayISO()} value={born} onChange={e=>setBorn(e.target.value)}/></label>
     <label>Sex for chart references<select value={sex} onChange={e=>setSex(e.target.value as FamilySex)}><option value="unknown">Not recorded</option><option value="female">Female</option><option value="male">Male</option></select></label>
    </div><button type="submit" disabled={!canSave}><Plus size={17}/> Add child profile</button>
   </form>
   {child&&<div className="family09-records">
    <h4>{child.display_name}'s separate care journal</h4>
    <p className="muted">Personal notes only. A healthcare professional must interpret measurements and verify immunization records.</p>
    <div className="family09-columns">
     <div><form className="family09-form" onSubmit={e=>{void addGrowth(e)}}>
      <h4><TrendingUp size={17}/> Growth measurement</h4>
      <label>Measured on<input type="date" min={child.born_on} max={todayISO()} required value={measuredOn} onChange={e=>setMeasuredOn(e.target.value)}/></label>
      <label>Weight (kg, optional)<input type="number" min="0.1" max="70" step="0.01" inputMode="decimal" value={weight} onChange={e=>setWeight(e.target.value)}/></label>
      <label>Length (cm, optional)<input type="number" min="20" max="180" step="0.1" inputMode="decimal" value={length} onChange={e=>setLength(e.target.value)}/></label>
      <button type="submit" disabled={!canSave}>Save measurement</button>
     </form><ul className="family09-history">{growth.filter(v=>v.child_id===child.id).slice(0,25).map(v=><li key={v.id}><strong>{readable(v.measured_on)}</strong> · {v.weight_kg??'—'} kg · {v.length_cm??'—'} cm</li>)}</ul></div>
     <div><form className="family09-form" onSubmit={e=>{void addVaccine(e)}}>
      <h4><CalendarCheck size={17}/> Recorded immunization</h4>
      <label>Vaccine name or dose<input value={dose} required maxLength={100} onChange={e=>setDose(e.target.value)}/></label>
      <label>Given on<input type="date" min={child.born_on} max={todayISO()} required value={givenOn} onChange={e=>setGivenOn(e.target.value)}/></label>
      <label>Clinic (optional)<input value={facility} maxLength={100} onChange={e=>setFacility(e.target.value)}/></label>
      <button type="submit" disabled={!canSave}>Save recorded dose</button>
     </form><ul className="family09-history">{vaccines.filter(v=>v.child_id===child.id).slice(0,25).map(v=><li key={v.id}><strong>{v.vaccine_label}</strong> · {readable(v.given_on)}{v.facility?' · '+v.facility:''}</li>)}</ul></div>
    </div>
   </div>}
  </>}
  <LegacyAttributionV10 journey={journey} child={child??null} userId={userId} isDemo={demo}/>
  <CaregiverOwnerPanel child={child??null} userId={userId} demo={demo}/>
  {demo&&<p className="muted">Demo entries are temporary and not saved.</p>}
 </section>;
}
