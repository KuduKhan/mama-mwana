import { useState } from 'react';
import type { FormEvent } from 'react';
import { Activity, Check, CircleHelp, ClipboardCheck, ExternalLink, Info, Plus, Ruler, ShieldCheck, Syringe, TrendingUp, X } from 'lucide-react';
import type { ChildSex, ImmunizationRecord, Journey } from '../lib/domain';
import { daysBetween, readable, todayISO } from '../lib/domain';
import { CLINICAL_REFERENCES, growthTrend, KENYA_IMMUNIZATIONS, referenceDate, referenceForSex, referenceStage, recordImmunization, validateImmunization } from '../lib/childHealth';
import type { GrowthMetric, TrendPoint, VaccineDose } from '../lib/childHealth';

interface Props { journey:Journey; update:(j:Journey)=>void }
const CHART_WIDTH=680, CHART_HEIGHT=210;
const MARGINS={left:45,right:18,top:16,bottom:34};
function TrendChart({points,metric}:{points:TrendPoint[];metric:GrowthMetric}){
 const title=metric==='weight'?'Weight (kg)':'Length (cm)';
 if(points.length<2)return <div className="ch-empty"><TrendingUp size={29}/><strong>More measurements make a trend</strong><span>Record at least two clinic measurements to draw a personal timeline.</span></div>;
 const plotW=CHART_WIDTH-MARGINS.left-MARGINS.right,plotH=CHART_HEIGHT-MARGINS.top-MARGINS.bottom;
 const lowX=Math.min(...points.map(p=>p.x)), highX=Math.max(...points.map(p=>p.x));
 const lowY=Math.min(...points.map(p=>p.y)),highY=Math.max(...points.map(p=>p.y));
 const padding=Math.max((highY-lowY)*.15,metric==='weight'?.2:1);
 const minY=Math.max(0,lowY-padding),maxY=highY+padding;
 const x=(v:number)=>MARGINS.left+((v-lowX)/Math.max(1,highX-lowX))*plotW;
 const y=(v:number)=>MARGINS.top+plotH-((v-minY)/Math.max(.01,maxY-minY))*plotH;
 const polyline=points.map(p=>x(p.x)+','+y(p.y)).join(' ');
 return <div className="ch-chart-wrap"><svg viewBox={'0 0 '+CHART_WIDTH+' '+CHART_HEIGHT} role="img" aria-label={'Personal '+title+' trend from '+readable(points[0].date)+' to '+readable(points[points.length-1].date)+'; not a WHO centile chart'}>
   {[0,.25,.5,.75,1].map(f=><g key={f}><line x1={MARGINS.left} x2={CHART_WIDTH-MARGINS.right} y1={MARGINS.top+plotH*f} y2={MARGINS.top+plotH*f} stroke="#e5eee5" strokeWidth="1"/><text x={MARGINS.left-9} y={MARGINS.top+plotH*f+4} textAnchor="end" fontSize="11" fill="#79927f">{(maxY-(maxY-minY)*f).toFixed(1)}</text></g>)}
   <polyline points={polyline} stroke="#377b5a" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   {points.map((p,i)=><circle key={i} cx={x(p.x)} cy={y(p.y)} r="5" fill="#377b5a" stroke="white" strokeWidth="2"><title>{readable(p.date)}: {p.y} {metric==='weight'?'kg':'cm'}</title></circle>)}
   <text x={MARGINS.left} y={CHART_HEIGHT-6} fontSize="11" fill="#79927f">{readable(points[0].date)}</text>
   <text x={CHART_WIDTH-MARGINS.right} y={CHART_HEIGHT-6} textAnchor="end" fontSize="11" fill="#79927f">{readable(points[points.length-1].date)}</text>
 </svg><p className="ch-chart-caption">{points.length} measurements • Personal trend only; a clinician should assess growth against appropriate WHO standards.</p></div>;
}
function NeonatalGuide({ageDays}:{ageDays:number}){
 const steps=ageDays<28?[
 {title:'Feeding and hydration',text:'Ask your care team about effective feeding, milk transfer, and any concerns with a baby who is not feeding well. Do not give water to newborns unless a clinician specifically directs it.'},
 {title:'Safe sleep every time',text:'Place your baby on their back in a clear, flat, firm sleep space, without loose bedding or pillows.'},
 {title:'Jaundice and newborn checks',text:'Attend recommended newborn reviews. Seek professional assessment for worsening jaundice, lethargy, poor feeding or fever.'},
 {title:'Caring for the cord and skin',text:'Follow your maternity team’s cord-care instructions and keep the area clean. Seek help for spreading redness, pus or fever.'}
 ]:ageDays<183?[
 {title:'Feeding support',text:'Milk feeding is central in early infancy. Ask your clinic about breastfeeding, expressed milk or safely prepared formula and any feeding difficulties.'},
 {title:'Tummy time when awake',text:'Offer supervised, awake play and age-appropriate interaction. Always use back sleeping for rest.'},
 {title:'Development conversations',text:'Notice smiles, sounds and movement. Discuss concerns or loss of skills with a clinician rather than relying on a checklist alone.'},
 {title:'Immunization follow-up',text:'Bring your child health handbook to each clinic visit and confirm which routine doses are due or have been administered.'}
 ]:[
 {title:'Complementary foods',text:'Around six months, introduce safe, age-appropriate complementary foods while continuing milk feeds as advised by your healthcare team.'},
 {title:'Explore and connect',text:'Talk, sing, read and play with your child, and adapt activities to their development and abilities.'},
 {title:'Prevent choking and injuries',text:'Supervise eating, use age-appropriate food textures, and check the safety of sleeping and play spaces.'},
 {title:'Growth and routine care',text:'Continue scheduled child-welfare reviews and bring concerns about feeding, growth, hearing or development to your clinician.'}
 ];
 return <section className="ch-card ch-guide"><div className="ch-section-head"><span className="ch-kicker">EARLY CHILDHOOD COMPANION</span><h3>Care for this stage</h3><p>Educational guidance only, not a diagnosis or prescription.</p></div><div className="ch-guide-grid">{steps.map((step,i)=><div className="ch-tip" key={step.title}><span className="ch-tip-number">0{i+1}</span><strong>{step.title}</strong><p>{step.text}</p></div>)}</div>
 <div className="ch-clinical-note"><ShieldCheck size={18}/><p>Urgent warning signs—including difficulty breathing, convulsions, unusual unresponsiveness, serious fever, or poor feeding in a newborn—require immediate medical assessment. This app cannot determine if a child is safe.</p></div>
 </section>;
}
export default function ChildHealthV03({journey,update}:Props){
 const birth=journey.baby_birth_date;
 const [sex,setSex]=useState<ChildSex>(journey.baby_sex??'unknown');
 const [gestation,setGestation]=useState(journey.gestation_at_birth_weeks==null?'':String(journey.gestation_at_birth_weeks));
 const [profileMessage,setProfileMessage]=useState('');
 const [metric,setMetric]=useState<GrowthMetric>('weight');
 const [selectedDose,setSelectedDose]=useState<VaccineDose|null>(null);
 const [givenDate,setGivenDate]=useState(todayISO());
 const [facility,setFacility]=useState('');
 const [note,setNote]=useState('');
 const [doseError,setDoseError]=useState('');
 if(!birth)return null;
 const records=journey.immunizations??[];
 const ageDays=Math.max(0,daysBetween(birth,todayISO()));
 const chart=referenceForSex(journey.baby_sex);
 const recordedCount=KENYA_IMMUNIZATIONS.filter(d=>records.some(r=>r.dose_id===d.id)).length;
 const plot=growthTrend(journey.growth,birth,metric);
 const existing=selectedDose?records.find(r=>r.dose_id===selectedDose.id):undefined;
 function saveProfile(e:FormEvent){
  e.preventDefault();
  const weeks=gestation.trim()===''?null:Number(gestation);
  if(weeks!==null&&(!Number.isFinite(weeks)||weeks<22||weeks>44)){setProfileMessage('Use a clinician-reported gestation between 22 and 44 weeks, or leave it blank.');return;}
  update({...journey,baby_sex:sex,gestation_at_birth_weeks:weeks});
  setProfileMessage('Birth details saved. These details do not produce a diagnosis.');
 }
 function openDose(d:VaccineDose){
  setSelectedDose(d);setDoseError('');
  const previous=records.find(r=>r.dose_id===d.id);
  setGivenDate(previous?.given_on??todayISO());setFacility(previous?.facility??'');setNote(previous?.note??'');
 }
 function saveDose(e:FormEvent){
  e.preventDefault();if(!selectedDose)return;
  const err=validateImmunization(givenDate,birth!,facility);
  if(err){setDoseError(err);return;}
  const previous=records.find(v=>v.dose_id===selectedDose.id);
  const next:ImmunizationRecord={id:previous?.id??crypto.randomUUID(),dose_id:selectedDose.id,given_on:givenDate,facility:facility.trim().slice(0,100),note:note.trim().slice(0,200)};
  update({...journey,immunizations:recordImmunization(records,next)});
  setSelectedDose(null);
 }
 function removeDose(){
  if(!selectedDose||!existing)return;
  if(!window.confirm('Remove this caregiver-entered vaccination record? Your clinic handbook is unaffected.'))return;
  update({...journey,immunizations:records.filter(r=>r.dose_id!==selectedDose.id)});
  setSelectedDose(null);
 }
 return <div className="ch-stack">
  <section className="ch-card">
   <div className="ch-section-head"><span className="ch-kicker">CHILD HEALTH PROFILE</span><h3>Details for appropriate reference charts</h3><p>Optional information from your child health handbook or clinician. The app does not infer sex or prematurity.</p></div>
   <form className="ch-profile-form" onSubmit={saveProfile}>
    <label>Sex for WHO growth references<select aria-label="Sex for growth references" value={sex} onChange={e=>setSex(e.target.value as ChildSex)}><option value="unknown">Not recorded / prefer not to say</option><option value="female">Female — WHO girls reference</option><option value="male">Male — WHO boys reference</option></select></label>
    <label>Gestational age at birth (weeks, optional)<input type="number" min="22" max="44" step=".1" value={gestation} onChange={e=>setGestation(e.target.value)} placeholder="From your clinical records"/></label>
    <button type="submit" className="ch-primary"><Check size={16}/> Save birth details</button>
   </form>
   {profileMessage&&<p className="ch-inline-message" role="status">{profileMessage}</p>}
   {(journey.gestation_at_birth_weeks??40)<37&&journey.gestation_at_birth_weeks!=null&&<p className="ch-warning-text">Your records indicate a preterm birth. Growth and developmental assessment may use corrected age; consult your pediatric clinician.</p>}
  </section>
  <section className="ch-card">
   <div className="ch-section-head"><span className="ch-kicker">YOUR RECORDED GROWTH</span><h3><TrendingUp size={21}/> Growth timeline</h3><p>Plots your entered measurements against elapsed days after birth. This is <strong>not</strong> a calculated WHO percentile or z-score.</p></div>
   <div className="ch-toggle" role="group" aria-label="Select growth measure"><button type="button" className={metric==='weight'?'active':''} onClick={()=>setMetric('weight')}><Activity size={16}/> Weight</button><button type="button" className={metric==='length'?'active':''} onClick={()=>setMetric('length')}><Ruler size={16}/> Length</button></div>
   <TrendChart metric={metric} points={plot}/>
   <div className="ch-reference"><div><span className="ch-kicker">OFFICIAL WHO CHILD GROWTH STANDARDS</span><h4>Open the clinical reference charts</h4><p>Use these published reference charts with your healthcare provider. Sex-specific charts and corrected-age considerations may be necessary. No growth classification is calculated here.</p></div>
    {chart?<div className="ch-reference-links"><a target="_blank" rel="noreferrer" href={chart.weight}>WHO weight-for-age <ExternalLink size={15}/></a><a target="_blank" rel="noreferrer" href={chart.length}>WHO length/height-for-age <ExternalLink size={15}/></a></div>:<p className="ch-chart-placeholder"><Info size={17}/> Save sex in the child health profile to choose the correct official chart, or <a href={CLINICAL_REFERENCES.whoIntroduction} target="_blank" rel="noreferrer">browse all WHO references</a>.</p>}
   </div>
  </section>
  <section className="ch-card">
   <div className="ch-section-head"><span className="ch-kicker">KENYA • CLINIC REFERENCE AGES</span><h3><Syringe size={21}/> Immunization diary</h3><p>Compare caregiver-entered vaccination records with common Kenya routine clinic contact ages. <strong>This is not a live vaccine eligibility, catch-up or availability determination.</strong> Your child's official handbook and immunization clinic take priority.</p></div>
   <div className="ch-vaccine-summary"><div><span className="ch-kicker">RECORDED FROM THIS REFERENCE LIST</span><strong>{recordedCount} <small>of {KENYA_IMMUNIZATIONS.length}</small></strong></div><div><ClipboardCheck size={23}/><span>Always confirm dates, extra doses, regional vaccines and catch-up plans with your clinic.</span></div></div>
   <div className="ch-vaccine-list">{KENYA_IMMUNIZATIONS.map(d=>{
    const recorded=records.find(r=>r.dose_id===d.id);
    const stage=referenceStage(birth,d,records);
    return <div key={d.id} className="ch-dose"><div className="ch-dose-main"><div className={'ch-dose-icon '+(recorded?'recorded':'')}><Syringe size={18}/></div><div><strong>{d.title}</strong><small>{d.dose} · {d.atDays!==undefined?(d.atDays===0?'At birth':d.atDays/7+' weeks'):(d.atMonths??0)+' months'}</small></div></div><div className="ch-dose-right"><div className="ch-dose-status"><strong className={recorded?'recorded':stage==='ask-clinic'?'check':''}>{recorded?'Recorded':stage==='ask-clinic'?'Ask clinic':'Future reference'}</strong><small>{recorded?readable(recorded.given_on):'Typical age: '+readable(referenceDate(birth,d))}</small></div><button type="button" onClick={()=>openDose(d)}>{recorded?'Edit entry':'Record given'} <Plus size={14}/></button></div></div>;
   })}</div>
   <p className="ch-source-note"><CircleHelp size={17}/> Source: <a href={CLINICAL_REFERENCES.kenya} target="_blank" rel="noreferrer">Kenya Ministry of Health community clinical guidance</a>. For Hepatitis B birth dose, malaria, yellow fever, county-specific additions, supply changes and catch-up schedules, consult the current child health clinic. Never assume a missed vaccine should be skipped.</p>
  </section>
  <NeonatalGuide ageDays={ageDays}/>
  {selectedDose&&<div className="ch-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedDose(null);}} role="presentation"><div className="ch-modal" role="dialog" aria-modal="true" aria-labelledby="ch-dose-modal-title">
   <button type="button" className="ch-modal-close" onClick={()=>setSelectedDose(null)} aria-label="Close vaccination form"><X size={21}/></button>
   <span className="ch-modal-icon"><Syringe size={22}/></span><h3 id="ch-dose-modal-title">{selectedDose.title} • {selectedDose.dose}</h3><p>Enter an actual documented dose, not a planned appointment. Verify the information from your child's official record.</p>
   <form onSubmit={saveDose}>
    <label>Date vaccine was given<input type="date" required min={birth} max={todayISO()} value={givenDate} onChange={e=>setGivenDate(e.target.value)}/></label>
    <label>Clinic or health facility (optional)<input maxLength={100} value={facility} onChange={e=>setFacility(e.target.value)} placeholder="Clinic or recorded location"/></label>
    <label>Private note (optional)<textarea maxLength={200} rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Reference from child's handbook"/></label>
    {doseError&&<p role="alert" className="ch-error">{doseError}</p>}
    <div className="ch-modal-actions"><button type="submit" className="ch-primary"><Check size={16}/> Save record</button>{existing&&<button type="button" className="ch-remove" onClick={removeDose}>Remove entry</button>}</div>
   </form>
   <small>This is a caregiver diary, not a certified electronic vaccination record.</small>
  </div></div>}
 </div>;
}
