import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Activity, ArrowLeft, ArrowRight, Baby, BookHeart, CalendarDays,
  Check, CheckCircle2, CircleHelp, ClipboardList,
  Cloud, Droplets, ExternalLink, Footprints, Heart, HeartHandshake, HeartPulse,
  House, Leaf, LockKeyhole, LogOut, Menu, Moon, Plus, ShieldAlert, ShieldCheck, Users, Bell, Download, NotebookPen, ChevronRight,
  Sparkles, Stethoscope, Sun, TrendingUp, Utensils, X, ScrollText, Bot, ListTodo
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { authConfigured, authSupabase, configured, supabase } from './lib/supabase';
import { APP_VERSION } from './lib/release';
import {useMamaLocale} from './lib/locale';
import {Settings2} from 'lucide-react';
import DisplayPreferencesV14 from './components/DisplayPreferencesV14';
import FamilySnapshotV14 from './components/FamilySnapshotV14';
import {applyClinicalMutation,editJourneyClinical,isClinicalConflict,loadCanonicalJourneys,nonClinicalJourneyPayload} from './lib/clinical';
import type {ClinicalKind,ClinicalVersioned} from './lib/clinical';
const GuidanceV04 = lazy(() => import('./components/GuidanceV04'));
const PrivacyV04 = lazy(() => import('./components/PrivacyV04'));
const ClinicalRecordsV04 = lazy(() => import('./components/ClinicalRecordsV04'));
const CarePlannerV07 = lazy(() => import('./components/CarePlannerV07'));
const CareJourneyHubV12 = lazy(() => import('./components/CareJourneyHubV12'));
const FamilyChildrenV09 = lazy(() => import('./components/FamilyChildrenV09'));
import {CaregiverInbox} from './components/CaregiverAccessV10';
import {DEFAULT_PRIVACY,exportFilename} from './lib/privacy';
import {buildCompleteExport,emptyPrivateExportRows,fetchPrivateExportRows} from './lib/privateExport';
import BetaNoticeV10 from './components/BetaNoticeV10';
import type {PrivacyChoices} from './lib/privacy';
const ChildHealthV03 = lazy(() => import('./components/ChildHealthV03'));
import {
  BIRTH_CHECKLIST, addDays, ageInMonths, daysBetween, getPhase, isDate,
  isValidBirthDate, makeJourney, postpartumDay, pregnancyStage, readable, todayISO,
  validateOnboarding
} from './lib/domain';
import type { FeedingMethod, Feeling, Journey, Visit } from './lib/domain';
import { reminderStatus, visitReminders, visitCalendarUrl } from './lib/reminders';
import {
  CARE_TASKS, CHILDHOOD_TASKS, educationForWeek, MILESTONES, POSTPARTUM_TASKS, SOURCES
} from './content/education';

type Tab = 'home'|'family'|'pregnancy'|'care'|'visits'|'birth'|'baby'|'records'|'guidance'|'privacy'|'library'|'planner'|'hub';
type NavItem = {id:Tab; label:string; Icon:LucideIcon};
const NAV:NavItem[]=[
 {id:'home',label:'Overview',Icon:House},
 {id:'family',label:'Family journeys',Icon:Users},
 {id:'pregnancy',label:'My pregnancy',Icon:Heart},
 {id:'care',label:'Daily care',Icon:Leaf},
 {id:'visits',label:'Antenatal visits',Icon:CalendarDays},
 {id:'planner',label:'My care planner',Icon:ListTodo},
 {id:'hub',label:'Care journey hub',Icon:NotebookPen},
 {id:'birth',label:'Birth preparation',Icon:ClipboardList},
 {id:'baby',label:'Baby & growth',Icon:Baby},
 {id:'records',label:'Clinical timeline',Icon:ScrollText},
 {id:'guidance',label:'Care guidance',Icon:Bot},
 {id:'privacy',label:'Privacy & records',Icon:LockKeyhole},
 {id:'library',label:'Health library',Icon:BookHeart}
];
const NAV_GROUPS:readonly {key:string;labelKey:string;label:string;ids:readonly Tab[]}[]=[
 {key:'daily',labelKey:'navGroup.daily',label:'Daily essentials',ids:['home','care','planner','visits']},
 {key:'family',labelKey:'navGroup.family',label:'Family & milestones',ids:['family','pregnancy','hub','birth','baby']},
 {key:'support',labelKey:'navGroup.support',label:'Records & support',ids:['records','guidance','privacy','library']}
];
const TASK_ICONS:Record<string,LucideIcon>={
 droplets:Droplets,utensils:Utensils,footprints:Footprints,moon:Moon,heart:Heart,
 'heart-pulse':HeartPulse,baby:Baby,'hand-heart':HeartHandshake
};
const ANC_WEEKS=[12,20,26,30,34,36,38,40];
const URGENT=[
 'Heavy vaginal bleeding or severe abdominal pain',
 'Severe headache, visual disturbance, seizures or fainting',
 'Trouble breathing, chest pain or severe weakness',
 'Reduced or changed baby movements during pregnancy',
 'Fever with severe illness, or thoughts of self-harm',
 'Newborn breathing problems, poor feeding or unusual unresponsiveness'
];
const uniqueToggle=(a:string[],id:string)=>a.includes(id)?a.filter(v=>v!==id):[...a,id];
const isTab=(value:unknown):value is Tab=>typeof value==='string'&&NAV.some(item=>item.id===value);

/** Keyboard-only modal behavior: trap Tab, support Escape, restore original focus. */
function useModalFocus(open:boolean,onDismiss:()=>void,restoreSelector?:string){
 const dialogRef=useRef<HTMLDivElement|null>(null);
 const dismissRef=useRef(onDismiss);
 dismissRef.current=onDismiss;
 useEffect(()=>{
  if(!open||!dialogRef.current)return;
  const dialog=dialogRef.current;
  const before=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const focusable=()=>Array.from(dialog.querySelectorAll<HTMLElement>(
   'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )).filter(element=>element.getClientRects().length>0);
  (focusable()[0]??dialog).focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissRef.current();return;}
   if(event.key!=='Tab')return;
   const items=focusable();
   if(!items.length){event.preventDefault();dialog.focus();return;}
   const first=items[0],last=items[items.length-1];
   if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){
    event.preventDefault();last.focus();
   }else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){
    event.preventDefault();first.focus();
   }
  };
  document.addEventListener('keydown',onKey,true);
  return ()=>{
   document.removeEventListener('keydown',onKey,true);
   // Some parent sections are recreated on close. Resolve the returned focus
   // target from the new DOM instead of relying on a detached button node.
   if(before?.isConnected)before.focus();
   else if(restoreSelector)queueMicrotask(()=>{
    document.querySelector<HTMLElement>(restoreSelector)?.focus();
   });
  };
 },[open]);
 return dialogRef;
}
function Brand({inverse=false}:{inverse?:boolean}){
 return <div className={'brand '+(inverse?'brand-inverse':'')}>
   <span className="brand-icon"><img src="/icon.svg" width={48} height={48} alt="" aria-hidden="true"/></span>
   <div className="brand-title">mama<span>mwana</span><small>EVERY LITTLE BEGINNING MATTERS</small></div>
 </div>;
}
function Button({children,onClick,type='button',variant='primary',disabled=false,Icon}:{
 children:ReactNode;onClick?:()=>void;type?:'button'|'submit';variant?:'primary'|'secondary'|'subtle'|'danger';disabled?:boolean;Icon?:LucideIcon
}){return <button type={type} onClick={onClick} className={'btn btn-'+variant} disabled={disabled}>{Icon&&<Icon size={17}/>}<span>{children}</span></button>;}
function SectionTitle({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle?:string;action?:ReactNode}){
 return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;
}
function Panel({children,className=''}:{children:ReactNode;className?:string}){return <section className={'panel '+className}>{children}</section>;}
function ProgressBar({value}:{value:number}){return <div className="progress-rail" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:String(Math.min(100,Math.max(0,value)))+'%'}}/></div>;}
function formatAge(months:number){return months<1?'Under 1 month':months<12?months+' month'+(months===1?'':'s'):(Math.floor(months/12)+' year'+(Math.floor(months/12)===1?'':'s')+(months%12?' '+months%12+' mo':''));}
function Notification({message,onClose}:{message:string;onClose:()=>void}){return <div className="toast" role="status">{message}<button aria-label="Dismiss notification" onClick={onClose}><X size={16}/></button></div>;}

function AuthGate({onDemo}:{onDemo:()=>void}){
 const {locale,setLocale,t}=useMamaLocale();
 const [mode,setMode]=useState<'signin'|'signup'>('signup');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 async function submit(e:FormEvent){
  e.preventDefault();if(!authSupabase)return;
  setBusy(true);setMessage('');
  try{
   const result=mode==='signup'
    ?await authSupabase.auth.signUp({email:email.trim(),password})
    :await authSupabase.auth.signInWithPassword({email:email.trim(),password});
   if(result.error)setMessage(result.error.message);
   else if(mode==='signup')setMessage('Check your email for an account verification link, if confirmation is enabled. Do not add personal health details until the care workspace is approved.');
   else if(!configured)setMessage('Account sign-in verified. The private health-data workspace is still restricted; explore the sample-data demo.');
  }catch{setMessage('Account service temporarily unavailable. Please try again.');}
  finally{setBusy(false);}
 }
 return <div className="auth-layout">
   <div className="auth-story"><Brand inverse/><div className="auth-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-center"><Heart size={76} strokeWidth={1.15}/><span className="art-small-dot"/></div><Sparkles className="art-spark-one"/><Sparkles className="art-spark-two"/></div>
     <div className="auth-story-copy"><div className="eyebrow pale">A GENTLER WAY TO GROW</div><h1>Every beginning<br/>deserves <em className="handwritten-accent">care.</em></h1><p>From the first exciting weeks through your baby’s earliest milestones—one thoughtful place for your whole journey.</p><div className="auth-micro"><span><CheckCircle2 size={16}/> Pregnancy to parenthood</span><span><ShieldCheck size={16}/> Private by design</span></div></div>
   </div>
   <div className="auth-form-side"><div className="locale-auth"><label htmlFor="mamamwana-auth-locale">{t('app.language')}</label><select id="mamamwana-auth-locale" aria-label="Language / Lugha" value={locale} onChange={e=>setLocale(e.target.value==='sw'?'sw':'en')}><option value="en">English</option><option value="sw">Kiswahili</option></select></div><div className="auth-mobile-brand"><Brand/></div><div className="auth-panel">
   <div className="badge-soft"><Sparkles size={14}/> {t('auth.welcome')}</div>
   <h2>{authConfigured?(mode==='signup'?t('auth.begin'):t('auth.return')):'Explore the MamaMwana preview'}</h2>
   <p className="muted">{authConfigured?'Use a verified account for authentication. Private health records stay restricted until separately approved.':'Explore all journeys in an interactive demo without saving real personal information.'}</p>
   {authConfigured&&<><div className="auth-switch"><button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('');}}>{t('auth.signup')}</button><button className={mode==='signin'?'active':''} onClick={()=>{setMode('signin');setMessage('');}}>{t('auth.signin')}</button></div>
     <form onSubmit={submit} className="stack-form"><label>{t('auth.email')}<input type="email" required autoComplete="email" placeholder="mama@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t('auth.password')}<input type="password" required minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)}/></label>
     {message&&<div className="inline-note" role="status">{message}</div>}
     <Button type="submit" disabled={busy}>{busy?'Please wait...':mode==='signup'?'Create my account':'Sign in'} <ArrowRight size={16}/></Button></form></>}
   <div className="demo-divider">{authConfigured?'OR TRY THE DEMO':'INTERACTIVE PRODUCT PREVIEW'}</div>
   <button className="demo-button" onClick={onDemo}><span className="demo-symbol"><Sparkles size={19}/></span><span><strong>{t('auth.demo')}</strong><small>{t('auth.demoDetails')}</small></span><ArrowRight size={18}/></button>
   <p className="footnote"><LockKeyhole size={14}/> Medical information should only be entered after your private database is connected. This app supports—not replaces—professional care.</p>
   </div></div>
 </div>;
}
function Onboarding({onCreate,isDemo,onCancel}:{onCreate:(j:Journey)=>void;isDemo:boolean;onCancel?:()=>void}){
 const [name,setName]=useState(isDemo?'Amina':'');
 const [due,setDue]=useState(addDays(todayISO(),112));
 const [error,setError]=useState('');
 function submit(e:FormEvent){e.preventDefault();const validation=validateOnboarding(name,due);if(validation){setError(validation);return;}onCreate(makeJourney(name,due));}
 return <div className="onboarding">
   <div className="onboarding-top"><Brand/><div className="onboarding-top-actions">{onCancel&&<Button variant="subtle" Icon={ArrowLeft} onClick={onCancel}>Back to family</Button>}<span className="mini-pill">{isDemo?'Preview mode':'Private profile setup'}</span></div></div>
   <div className="onboarding-grid"><div className="onboarding-intro"><div className="badge-soft"><Heart size={14}/> First things first</div><h1>Tell us a little<br/>about <em className="handwritten-accent">your journey.</em></h1><p>We’ll use your estimated due date to help you discover pregnancy stages, suggested learning and gentle everyday reminders.</p>
     <div className="setup-benefits"><span><CheckCircle2/> Week-by-week guidance</span><span><CheckCircle2/> Personal appointment journal</span><span><CheckCircle2/> One continuous baby journey</span></div>
     <div className="onboard-decoration"><Heart size={72} strokeWidth={1}/></div></div>
   <Panel className="onboard-form"><h2>Create your pregnancy profile</h2><p className="muted">You can adjust your plan with advice from your healthcare professional.</p>
   <form onSubmit={submit} className="stack-form"><label>What should we call you?<input maxLength={80} required placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)}/></label>
   <label>Your estimated due date<input type="date" required value={due} onChange={e=>setDue(e.target.value)}/></label>
   <div className="inline-note"><CircleHelp size={17}/> Use a due date given by your midwife, doctor or ultrasound report if available. The app does not establish gestational age.</div>
   {error&&<div className="error" role="alert">{error}</div>}
   <Button type="submit">Create my journey <ArrowRight size={16}/></Button></form></Panel></div>
 </div>;
}
function NewVisitForm({onSave,onCancel}:{onSave:(v:Visit)=>void;onCancel:()=>void}){
 const [date,setDate]=useState(addDays(todayISO(),7)),[clinic,setClinic]=useState(''),[notes,setNotes]=useState('');
 function submit(e:FormEvent){e.preventDefault();if(!isDate(date)||!clinic.trim())return;onSave({id:crypto.randomUUID(),scheduled_on:date,clinic:clinic.trim().slice(0,100),notes:notes.trim().slice(0,500),attended:false});}
 return <form className="inline-form" onSubmit={submit}><div className="form-row"><label>Visit date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label><label>Facility / contact<input required maxLength={100} placeholder="Clinic or midwife" value={clinic} onChange={e=>setClinic(e.target.value)}/></label></div><label>Questions or notes (optional)<textarea maxLength={500} rows={2} placeholder="What would you like to ask?" value={notes} onChange={e=>setNotes(e.target.value)}/></label><div className="button-row"><Button type="submit" Icon={Plus}>Save visit</Button><Button variant="subtle" onClick={onCancel}>Cancel</Button></div></form>;
}
function BirthModal({onClose,onBirth,dueDate}:{onClose:()=>void;onBirth:(date:string,name:string)=>void;dueDate:string}){
 const [date,setDate]=useState(todayISO()),[name,setName]=useState(''),[error,setError]=useState('');
 const dialogRef=useModalFocus(true,onClose,'.baby-locked .btn');
 function submit(e:FormEvent){e.preventDefault();if(!isValidBirthDate(date,dueDate)){setError('Please enter a valid birth date. Contact your care provider if your dates need correcting.');return;}if(name.trim().length<1||name.trim().length>80){setError('Enter your baby’s name (up to 80 characters).');return;}onBirth(date,name.trim());}
 return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="birth-title"><button className="modal-close" aria-label="Close" onClick={onClose}><X size={20}/></button><div className="modal-mark"><Baby size={26}/></div><h2 id="birth-title">Hello, little one! <span aria-hidden="true">♡</span></h2><p className="muted">This special moment connects your pregnancy journal with your baby’s growth tracker and your postpartum recovery guidance.</p><form className="stack-form" onSubmit={submit}><label>Baby’s name<input value={name} maxLength={80} required placeholder="Your baby’s name" onChange={e=>setName(e.target.value)}/></label><label>Date of birth<input type="date" required max={todayISO()} value={date} onChange={e=>setDate(e.target.value)}/></label><div className="inline-note">Birth and recovery information should be confirmed with your maternity care team. This does not replace medical discharge instructions.</div>{error&&<div role="alert" className="error">{error}</div>}<Button type="submit">Begin our next chapter <ArrowRight size={16}/></Button></form></div></div>;
}
function WarningCard({onOpen}:{onOpen:()=>void}){return <button className="warning-card" onClick={onOpen}><span className="warning-icon"><ShieldAlert size={20}/></span><span><strong>Know when to get help</strong><small>Important signs for mother and baby</small></span><ArrowRight size={18}/></button>;}
function SourcesSmall(){return <div className="source-row">Sources: {SOURCES.slice(0,3).map((s,i)=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{i>0?' · ':''}{s.title.replace(' recommendations','')}</a>)}</div>;}

export default function App(){
 const {locale,setLocale,t}=useMamaLocale();
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(configured);
 const [demo,setDemo]=useState(false);
 const [journey,setJourney]=useState<Journey|null>(null);
 const [journeys,setJourneys]=useState<Journey[]>([]);
 const [creatingJourney,setCreatingJourney]=useState(false);
 const [privacy,setPrivacy]=useState<PrivacyChoices>(DEFAULT_PRIVACY);
 const current=useRef<Journey|null>(null);
 const writeQueue=useRef<Record<string,Promise<void>>>({});
 const persistedIds=useRef<Set<string>>(new Set());
 const [dataError,setDataError]=useState('');
 const [saveStatus,setSaveStatus]=useState<'saved'|'saving'|'error'>('saved');
 const [loadingJourney,setLoadingJourney]=useState(false);
 const [tab,setTab]=useState<Tab>('home');
 // History records only a public page name; never include a patient or journey identifier.
 useEffect(()=>{
  const existing=window.history.state;
  const safe=(typeof existing==='object'&&existing!==null?existing:{}) as Record<string,unknown>;
  window.history.replaceState({...safe,mmPage:'home'},'');
  const onPop=(event:PopStateEvent)=>{
   setTab(isTab(event.state?.mmPage)?event.state.mmPage:'home');
   setMenuOpen(false);
  };
  window.addEventListener('popstate',onPop);
  return()=>window.removeEventListener('popstate',onPop);
 },[]);
 const [menuOpen,setMenuOpen]=useState(false);
 const [isNarrow,setIsNarrow]=useState(()=>window.matchMedia('(max-width:760px)').matches);
 const sidebarRef=useRef<HTMLElement|null>(null);
 const hamburgerRef=useRef<HTMLButtonElement|null>(null);
 const closeDrawerRef=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{
  const media=window.matchMedia('(max-width:760px)');
  const onResize=()=>{setIsNarrow(media.matches);if(!media.matches)setMenuOpen(false);};
  onResize();media.addEventListener('change',onResize);
  return()=>media.removeEventListener('change',onResize);
 },[]);
 // Treat the mobile drawer as a temporary focus-contained surface; off-screen links
 // are inert while closed, and keyboard focus returns to the invoking control.
 useEffect(()=>{
  if(!menuOpen||!isNarrow)return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  closeDrawerRef.current?.focus();
  const onDrawerKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    event.preventDefault();event.stopPropagation();setMenuOpen(false);return;
   }
   if(event.key!=='Tab')return;
   const root=sidebarRef.current;
   if(!root)return;
   const focusable=Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
   )).filter(el=>el.getClientRects().length>0);
   if(!focusable.length){event.preventDefault();closeDrawerRef.current?.focus();return;}
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){
    event.preventDefault();last.focus();
   }else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){
    event.preventDefault();first.focus();
   }
  };
  document.addEventListener('keydown',onDrawerKey,true);
  return()=>{
   document.removeEventListener('keydown',onDrawerKey,true);
   if(previous?.isConnected)previous.focus();else hamburgerRef.current?.focus();
  };
 },[menuOpen,isNarrow]);
 const [toast,setToast]=useState('');
 const [warningOpen,setWarningOpen]=useState(false);
 const warningDialogRef=useModalFocus(warningOpen,()=>setWarningOpen(false));
 const [displayOpen,setDisplayOpen]=useState(false);
 const displayDialogRef=useModalFocus(displayOpen,()=>setDisplayOpen(false),'[aria-label="Display preferences"]');
 const [birthOpen,setBirthOpen]=useState(false);
 const [weekView,setWeekView]=useState<number|null>(null);
 const [newVisit,setNewVisit]=useState(false);
 const [growthOpen,setGrowthOpen]=useState(false);
 const [growthDate,setGrowthDate]=useState(todayISO());
 const [growthWeight,setGrowthWeight]=useState('');
 const [growthLength,setGrowthLength]=useState('');
 const [milestoneFilter,setMilestoneFilter]=useState<number|null>(null);
 const [feedingMethod,setFeedingMethod]=useState<FeedingMethod>('breast');
 const [feeling,setFeeling]=useState<Feeling>('okay');
 const [wellbeingNote,setWellbeingNote]=useState('');

 useEffect(()=>{
  if(!supabase){setChecking(false);return;}
  const client=supabase;let active=true;
  client.auth.getUser().then(({data:{user},error})=>{if(active){setUser(error?null:user);setChecking(false);}}).catch(()=>{if(active)setChecking(false);});
  const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{if(active){setUser(session?.user??null);setChecking(false);}});
  return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if(!user||demo||!supabase){if(!user&&!demo){current.current=null;setJourney(null);setJourneys([]);persistedIds.current.clear();setDataError('');}return;}
  const client=supabase;let active=true;
  setLoadingJourney(true);
  Promise.resolve(client.from('journeys').select('id,mother_name,due_date,baby_birth_date,baby_name,visits,daily_checks,birth_checks,growth,milestones,feeding_logs,wellbeing_entries,baby_sex,gestation_at_birth_weeks,immunizations,created_at').eq('owner_id',user.id).order('created_at',{ascending:false}))
   .then(async ({data,error})=>{
    if(!active)return;
    if(error)throw new Error('Database unavailable. Check your Supabase migration history. '+error.message);
    const items=(data??[]).map(raw=>({...raw,feeding_logs:raw.feeding_logs??[],wellbeing_entries:raw.wellbeing_entries??[],immunizations:raw.immunizations??[],baby_sex:raw.baby_sex??null,gestation_at_birth_weeks:raw.gestation_at_birth_weeks??null})) as Journey[];
    const authoritative=await loadCanonicalJourneys(client,items);
    if(!active)return;
    persistedIds.current=new Set(authoritative.map(j=>j.id));setDataError('');
    setJourneys(authoritative);const selected=authoritative[0]??null;
    current.current=selected;setJourney(selected);setCreatingJourney(false);
    setLoadingJourney(false);
   }).catch((err:Error)=>{
    if(!active)return;
    setToast(err.message);setDataError(err.message);
    setJourneys([]);current.current=null;setJourney(null);setLoadingJourney(false);
   });
  return ()=>{active=false;};
 },[user?.id,demo]);
 useEffect(()=>{
  if(demo||!user||!supabase){setPrivacy(DEFAULT_PRIVACY);return;}
  let active=true;
  const client=supabase;
  void client.from('privacy_preferences').select('in_app_reminders,guidance_context')
    .eq('owner_id',user.id).maybeSingle().then(({data,error})=>{
      if(!active)return;
      if(error){setToast('Privacy settings are temporarily unavailable. Ask the service administrator to verify the current database setup and access policies.');return;}
      if(data)setPrivacy({in_app_reminders:data.in_app_reminders,guidance_context:data.guidance_context});
      else setPrivacy(DEFAULT_PRIVACY);
    });
  return ()=>{active=false;};
 },[user?.id,demo]);
 const persist=useCallback((j:Journey)=>{
  current.current=j;setJourney(j);setJourneys(previous=>[j,...previous.filter(item=>item.id!==j.id)]);
  if(demo||!user||!supabase){setSaveStatus('saved');return;}
  const client=supabase;const owner_id=user.id;setSaveStatus('saving');
  const previous=writeQueue.current[j.id]??Promise.resolve();
  const next=previous.catch(()=>{}).then(async()=>{
   const payload=nonClinicalJourneyPayload(j,owner_id);
   if(persistedIds.current.has(j.id)){
    const {data,error}=await client.from('journeys').update(payload).eq('id',j.id).eq('owner_id',owner_id).select('id').single();
    if(error||!data)throw error??new Error('Journey was not found');
   }else{
    const {error}=await client.from('journeys').insert(payload);
    if(error)throw error;
    persistedIds.current.add(j.id);
   }
  });
  writeQueue.current[j.id]=next;
  next.then(()=>{if(current.current?.id===j.id)setSaveStatus('saved');})
    .catch((e:Error)=>{if(current.current?.id===j.id)setSaveStatus('error');setToast('Save failed: '+e.message+'. Check your connection and confirm that current account and database access are configured correctly.');});
 },[demo,user]);
 async function changeClinical(kind:ClinicalKind,entry:ClinicalVersioned,remove=false):Promise<boolean>{
  const selected=current.current;
  if(!selected)return false;
  if(demo||!user||!supabase){
   const updated=editJourneyClinical(selected,kind,entry,remove);
   current.current=updated;setJourney(updated);
   setJourneys(previous=>previous.map(j=>j.id===updated.id?updated:j));
   return true;
  }
  setSaveStatus('saving');
  try{
   const result=await applyClinicalMutation(supabase,{kind,journeyId:selected.id,entry,remove});
   const fresh=current.current;
   if(fresh?.id===selected.id){
    const updated=editJourneyClinical(fresh,kind,result??entry,remove);
    current.current=updated;setJourney(updated);
    setJourneys(previous=>previous.map(j=>j.id===updated.id?updated:j));
   }else{
    const prior=journeys.find(j=>j.id===selected.id);
    if(prior)setJourneys(previous=>previous.map(j=>j.id===selected.id?editJourneyClinical(j,kind,result??entry,remove):j));
   }
   setSaveStatus('saved');
   return true;
  }catch(err){
   setSaveStatus('error');
   if(isClinicalConflict(err)){
    try{
     const fresh=current.current;
     const matching=journeys.find(j=>j.id===selected.id);
     const latest=await loadCanonicalJourneys(supabase,matching?[matching]:[selected]);
     if(latest[0]){
      setJourneys(previous=>previous.map(j=>j.id===selected.id?latest[0]:j));
      if(fresh?.id===selected.id){current.current=latest[0];setJourney(latest[0]);}
     }
    }catch{setToast('Concurrent record edit detected, but reload failed. Refresh before continuing.');return false;}
    setToast('Another session changed this record. Latest clinical data loaded; review it before retrying.');
   }else setToast('Clinical record could not be saved: '+(err instanceof Error?err.message:'Network or database error'));
   return false;
  }
 }
 async function savePrivacy(next:PrivacyChoices){
  if(!demo&&user&&supabase){
    const {error}=await supabase.from('privacy_preferences').upsert({owner_id:user.id,...next,updated_at:new Date().toISOString()},{onConflict:'owner_id'});
    if(error)throw error;
  }
  setPrivacy(next);
 }
 async function exportAllData(){
  let extra=emptyPrivateExportRows();
  let records:Journey[]=journeys;
  if(!demo&&user&&supabase){
    await Promise.all(Object.values(writeQueue.current).map(p=>p.catch(()=>{})));
    const {data,error}=await supabase.from('journeys').select('id,mother_name,due_date,baby_birth_date,baby_name,visits,daily_checks,birth_checks,growth,milestones,feeding_logs,wellbeing_entries,baby_sex,gestation_at_birth_weeks,immunizations').eq('owner_id',user.id);
    if(error)throw error;
    records=await loadCanonicalJourneys(supabase,(data??[]) as Journey[]);
    extra=await fetchPrivateExportRows(supabase,user.id);
  }
  const blob=new Blob([JSON.stringify(buildCompleteExport(records,privacy,extra),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=exportFilename();document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),10000);
 }
 async function deleteJourney(id:string):Promise<boolean>{
  const selected=journeys.find(j=>j.id===id);if(!selected)return false;
  if(!demo&&user&&supabase){
    const queued=writeQueue.current[id];if(queued)await queued;
    const {data,error}=await supabase.from('journeys').delete().eq('id',id).eq('owner_id',user.id).select('id');
    if(error)throw error;
    if(!data||data.length!==1)return false;
  }
  persistedIds.current.delete(id);
  const remaining=journeys.filter(j=>j.id!==id);
  const next=current.current?.id===id?(remaining[0]??null):current.current;
  setJourneys(remaining);setJourney(next);current.current=next;
  if(!next){setTab('home');window.history.replaceState({...window.history.state,mmPage:'home'},'');}
  return true;
 }
 function modify(fn:(j:Journey)=>Journey){const active=current.current;if(active)persist(fn(active));}
 function toggleDaily(id:string){modify(j=>({...j,daily_checks:{...j.daily_checks,[todayISO()]:uniqueToggle(j.daily_checks[todayISO()]||[],id)}}));}
 function toggleBirth(key:string){modify(j=>({...j,birth_checks:uniqueToggle(j.birth_checks,key)}));}
 function enterTab(next:Tab){
  if(tab!==next)window.history.pushState({...window.history.state,mmPage:next},'');
  setTab(next);setMenuOpen(false);
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 function selectJourney(selected:Journey){current.current=selected;setJourney(selected);setCreatingJourney(false);setWeekView(null);setMilestoneFilter(null);setSaveStatus('saved');enterTab('home');}
 function createAnotherJourney(){setCreatingJourney(true);setWeekView(null);setMenuOpen(false);}
 function signOut(){if(demo)setDemo(false);else void supabase?.auth.signOut();setJourneys([]);setJourney(null);current.current=null;persistedIds.current.clear();setDataError('');setCreatingJourney(false);setTab('home');window.history.replaceState({...window.history.state,mmPage:'home'},'');}
 function markBirth(date:string,name:string){modify(j=>({...j,baby_birth_date:date,baby_name:name}));setBirthOpen(false);enterTab('baby');setToast('Welcome, '+name+'! Your pregnancy journey remains connected.');}
 async function saveGrowth(e:FormEvent){e.preventDefault();const weight=growthWeight===''?null:Number(growthWeight),length=growthLength===''?null:Number(growthLength);
  if(!isDate(growthDate)||!journey?.baby_birth_date||daysBetween(journey.baby_birth_date,growthDate)<0||daysBetween(growthDate,todayISO())<0){setToast('Choose a valid measurement date after your baby’s birth.');return;}
  if(weight===null&&length===null){setToast('Enter a weight or length measurement.');return;}
  if((weight!==null&&(!Number.isFinite(weight)||weight<=0||weight>60))||(length!==null&&(!Number.isFinite(length)||length<=0||length>180))){setToast('Please enter realistic measurements and confirm them with a healthcare professional.');return;}
  const saved=await changeClinical('growth',{id:crypto.randomUUID(),measured_on:growthDate,weight_kg:weight,length_cm:length});
  if(saved){setGrowthOpen(false);setGrowthWeight('');setGrowthLength('');setToast('Measurement recorded. Your clinician should interpret growth trends.');}
 }
 if(!demo&&dataError)return <div className="loading-screen" role="alert"><div className="loading-icon"><ShieldAlert size={28}/></div><h2>Records are temporarily unavailable</h2><p>{dataError}</p><p>Your existing journey has not been deleted. The current database schema and your account permissions must be checked before continuing.</p><Button onClick={()=>window.location.reload()}>Retry securely</Button></div>;
 if(checking||loadingJourney)return <div className="loading-screen"><div className="loading-icon"><Heart size={28}/></div><p>Preparing your MamaMwana space…</p></div>;
 if(!demo&&!user)return <AuthGate onDemo={()=>{setDemo(true);setJourney(null);setJourneys([]);current.current=null;}}/>;
 if(!journey||creatingJourney)return <><CaregiverInbox userId={user?.id??null} demo={demo}/><Onboarding isDemo={demo} onCancel={journey?()=>{setCreatingJourney(false);enterTab('family');}:undefined} onCreate={j=>{setCreatingJourney(false);persist(j);enterTab('home');}}/></>;
 const activeJourney:Journey = journey;
 const phase=getPhase(journey),preg=pregnancyStage(activeJourney.due_date,activeJourney.baby_birth_date??todayISO());
 const isBorn=Boolean(activeJourney.baby_birth_date);
 const babyMonths=activeJourney.baby_birth_date?ageInMonths(activeJourney.baby_birth_date):0;
 const pDays=activeJourney.baby_birth_date?postpartumDay(activeJourney.baby_birth_date):0;
 const tasks=phase==='pregnancy'?CARE_TASKS:phase==='postpartum'?POSTPARTUM_TASKS:CHILDHOOD_TASKS;
 const doneToday=activeJourney.daily_checks[todayISO()]||[];
 const completedToday=tasks.filter(t=>doneToday.includes(t.id)).length;
 const edu=educationForWeek(weekView??preg.week);
 const upcoming=activeJourney.visits.filter(v=>!v.attended&&v.scheduled_on>=todayISO()).sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on));
 const nextVisit=upcoming[0];
 const reminders=privacy.in_app_reminders?visitReminders(activeJourney.visits):[];
 const checkCount=BIRTH_CHECKLIST.filter(c=>activeJourney.birth_checks.includes(c.key)).length;
 const displayName=activeJourney.mother_name.split(' ')[0];
 const topLabel=phase==='pregnancy'?'YOUR PREGNANCY JOURNEY':phase==='postpartum'?'THE FOURTH TRIMESTER':'GROWING TOGETHER';

 function Home(){
 return <div className="page-content mm13-home">
   {journeys.length>1&&<div className="mm14-home-family" aria-label={t('family.quick','Family quick switch')}><span>{t('family.quick','Family quick switch')}</span><div>{journeys.map(j=><button key={j.id} type="button" aria-pressed={j.id===activeJourney.id} onClick={()=>selectJourney(j)}>{j.baby_birth_date?(j.baby_name||t('family.baby','Baby')):t('family.pregnancy','Pregnancy journey')}{j.id===activeJourney.id?' · '+t('family.current','Current'):''}</button>)}</div></div>}
  <section className="mm13-today" aria-labelledby="mm13-today-heading">
   <div className="mm13-today-head"><div><span className="eyebrow">{t('home.todayEyebrow','YOUR DAILY FOCUS')}</span><h2 id="mm13-today-heading">{t('home.todayTitle','Your day at a glance')}</h2><p>{t('home.todaySubtitle','Pick up where you left off. Personal reminders, not medical advice.')}</p></div><span className="mm13-today-date"><Sun size={16} aria-hidden="true"/>{readable(todayISO())}</span></div>
   <div className="mm13-action-grid" aria-label="Suggested next steps">
    <button type="button" className="mm13-action-card" onClick={()=>enterTab('care')} aria-label="Continue daily care"><span className="mm13-action-icon sage"><Heart size={19} aria-hidden="true"/></span><span className="mm13-action-copy"><span className="mm13-action-label">{t('home.careAction','Continue daily care')}</span><strong>{completedToday} / {tasks.length} {t('home.checked','checked')}</strong><small>{t('home.careDetail','Your personal daily checklist')}</small></span><ArrowRight size={18} aria-hidden="true"/></button>
    <button type="button" className="mm13-action-card" onClick={()=>enterTab('visits')} aria-label="Review planned visits"><span className="mm13-action-icon coral"><CalendarDays size={19} aria-hidden="true"/></span><span className="mm13-action-copy"><span className="mm13-action-label">{t('home.visitsAction','Review planned visits')}</span><strong>{nextVisit?readable(nextVisit.scheduled_on):t('home.nonePlanned','No visit entered')}</strong><small>{nextVisit?t('home.confirmVisit','Planned in your journal · confirm with clinic'):t('home.addVisit','Add a visit to your personal journal')}</small></span><ArrowRight size={18} aria-hidden="true"/></button>
    <button type="button" className="mm13-action-card" onClick={()=>enterTab('hub')} aria-label="Open care journey"><span className="mm13-action-icon lilac"><NotebookPen size={19} aria-hidden="true"/></span><span className="mm13-action-copy"><span className="mm13-action-label">{t('home.journeyAction','Explore care journey')}</span><strong>{activeJourney.visits.length} {t('home.visitsRecorded','visit entries')}</strong><small>{t('home.journeyDetail','Your recorded moments, in one place')}</small></span><ArrowRight size={18} aria-hidden="true"/></button>
   </div>
  </section>
   <div className="hero-card">
    <div className="hero-warmth" aria-hidden="true"/>
    <div className="hero-copy"><span className="hero-eyebrow"><Sparkles size={14}/> {topLabel}</span>
      <h2>{phase==='pregnancy'?'A beautiful chapter,':phase==='postpartum'?'A new kind of love,':'Every tiny milestone,'}<br/><em className="handwritten-accent">{phase==='pregnancy'?'one day at a time.':phase==='postpartum'?'a brand-new chapter.':'a wonderful big step.'}</em></h2>
      <p>{phase==='pregnancy'?'Your baby is growing, and so are you. Let’s make room for little moments of care each day.':phase==='postpartum'?'Gentle support for your recovery and your newborn’s earliest days.':'Celebrate '+(activeJourney.baby_name||'your little one')+'’s discoveries and keep growing together.'}</p>
      <Button variant="secondary" onClick={()=>enterTab(phase==='pregnancy'?'pregnancy':'baby')}>Explore your journey <ArrowRight size={16}/></Button>
    </div>
    <div className="hero-visual" aria-hidden="true"><div className="hero-halo halo-outer"/><div className="hero-halo halo-middle"/><div className="hero-halo halo-inner"/><div className="hero-emblem"><Heart size={66} strokeWidth={1.35}/><Baby size={38} strokeWidth={1.65}/></div><span className="hero-stardust star-one">✦</span><span className="hero-stardust star-two">✧</span><span className="hero-stardust star-three">✧</span></div>
    <div className="hero-floating">{phase==='pregnancy'?<><strong>Week {preg.week}</strong><small>of your journey</small></>:<><strong>{formatAge(babyMonths)}</strong><small>growing together</small></>}</div>
   </div>
   <div className="metrics-grid">
     <div className="metric-card"><span className="metric-icon peach"><CalendarDays size={20}/></span><span className="metric-label">{isBorn?'Baby arrived':'Estimated due date'}</span><strong>{readable(isBorn?activeJourney.baby_birth_date!:activeJourney.due_date)}</strong><span className="metric-foot">{isBorn?'A day to remember':preg.daysLeft>0?preg.daysLeft+' days until the estimate':'Your estimated date has passed'}</span></div>
     <div className="metric-card"><span className="metric-icon mint"><CheckCircle2 size={20}/></span><span className="metric-label">Today’s care</span><strong>{completedToday} <span className="metric-denom">/ {tasks.length}</span></strong><ProgressBar value={completedToday/tasks.length*100}/></div>
     <div className="metric-card"><span className="metric-icon lilac">{isBorn?<Baby size={20}/>:<Stethoscope size={20}/>}</span><span className="metric-label">{isBorn?'Baby’s age':'Next antenatal visit'}</span><strong>{isBorn?formatAge(babyMonths):(nextVisit?readable(nextVisit.scheduled_on):'Not booked')}</strong><span className="metric-foot">{isBorn?'Your growing little one':nextVisit?nextVisit.clinic:'Add your next clinic visit'}</span></div>
   </div>
   {reminders.length>0&&<button className="reminder-banner" onClick={()=>enterTab('visits')}><Bell size={19}/><span><strong>{reminders.length} appointment{reminders.length===1?' needs':'s need'} your attention</strong><small>{reminders.some(v=>reminderStatus(v)==='overdue')?'A visit date has passed. Confirm the outcome with your care team.':'You have an upcoming visit within seven days.'}</small></span><ArrowRight size={18}/></button>}
   <button type="button" className="m12-dashboard-link" onClick={()=>enterTab('hub')}><span className="m12-dashboard-mark"><NotebookPen size={20} aria-hidden="true"/></span><span><strong>See your care journey in one place</strong><small>Recorded visits, baby moments and visit preparation notes</small></span><ArrowRight size={19} aria-hidden="true"/></button>
   <div className="dashboard-grid">
     <Panel className="today-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR DAILY RHYTHM</div><h3>A little care, every day</h3></div><div className="date-tag"><Sun size={16}/>{readable(todayISO())}</div></div>
       <p className="muted">Thoughtful reminders, not a medical prescription.</p>
       <div className="task-list">{tasks.slice(0,4).map(t=>{const Icon=TASK_ICONS[t.icon]||Heart;return <button key={t.id} className={'task-row '+(doneToday.includes(t.id)?'task-complete':'')} onClick={()=>toggleDaily(t.id)}><span className="task-icon"><Icon size={19}/></span><span className="task-description"><strong>{t.title}</strong><small>{t.description}</small></span><span className="task-checkbox">{doneToday.includes(t.id)&&<Check size={15}/>}</span></button>;})}</div>
       <button className="text-link" onClick={()=>enterTab('care')}>Open full daily care plan <ArrowRight size={15}/></button>
     </Panel>
     <div className="aside-stack"><Panel className="journey-card"><div className="eyebrow">{isBorn?'AFTER HELLO':'GROWING TOGETHER'}</div><div className="journey-card-icon"><Baby size={27}/></div><h3>{isBorn?'Welcome, '+(activeJourney.baby_name||'little one')+'!':'Your baby, this week'}</h3><p className="muted">{isBorn?'Your baby’s story now continues in the growth and milestones journal.':educationForWeek(preg.week).baby}</p><button className="text-link" onClick={()=>enterTab(isBorn?'baby':'pregnancy')}>Find out more <ArrowRight size={15}/></button></Panel>
       <WarningCard onOpen={()=>setWarningOpen(true)}/></div>
   </div>
   {phase!=='pregnancy'&&<Panel className="postpartum-banner"><div className="postpartum-illustration"><HeartHandshake size={32}/></div><div><div className="eyebrow">YOUR RECOVERY IS IMPORTANT</div><h3>{phase==='postpartum'?'Day '+pDays+' postpartum':'Mother’s wellbeing still matters'}</h3><p>Physical recovery and emotional wellbeing deserve attention too. Follow your postnatal check-up plan and ask for help when you need it.</p></div><Button variant="subtle" onClick={()=>enterTab('care')}>Recovery guide <ArrowRight size={15}/></Button></Panel>}
   <SourcesSmall/>
 </div>;
 }
 function Family(){
  return <div className="page-content"><SectionTitle eyebrow="YOUR CONNECTED STORY" title="Family journeys" subtitle="Switch between your recorded pregnancies and children. Each journey stays private." action={<Button Icon={Plus} onClick={createAnotherJourney}>New pregnancy</Button>}/>
   <Panel className="family-intro"><span className="small-round mint"><Users size={21}/></span><div><h3>Every chapter has its place</h3><p>Starting another journey does not erase your previous pregnancy, birth or baby records. Distinct child profiles can include twins and multiples. Legacy charts remain linked to the original journey.</p></div></Panel>
   <FamilySnapshotV14 journeys={journeys} activeId={activeJourney.id} onSelect={selectJourney}/>
    <div className="family-list">{journeys.map(j=>{const born=Boolean(j.baby_birth_date);return <button key={j.id} className={'family-journey '+(j.id===activeJourney.id?'current':'')} onClick={()=>selectJourney(j)}>
     <span className="family-avatar">{born?<Baby size={25}/>:<Heart size={25}/>}</span><span className="family-journey-copy"><strong>{born?j.baby_name+'’s journey':'Pregnancy journey'}</strong><small>{born?'Born '+readable(j.baby_birth_date!):'Estimated due '+readable(j.due_date)} · {j.mother_name}</small></span><span className="family-tag">{j.id===activeJourney.id?t('family.current','Current'):t('family.switch','Open')}</span><ChevronRight size={18}/></button>;})}</div>
   <FamilyChildrenV09 journey={activeJourney} isDemo={demo} userId={user?.id??null}/>
   <CaregiverInbox userId={user?.id??null} demo={demo}/>
    <p className="footnote">Profiles belong to the signed-in account, and are not automatically shared with healthcare providers.</p>
  </div>;
 }
 function Pregnancy(){
 return <div className="page-content"><SectionTitle eyebrow="YOUR PREGNANCY STORY" title="Inside your pregnancy" subtitle="A week-by-week learning companion alongside your antenatal care." action={<span className="tag-green">{isBorn?'Archived pregnancy':'Trimester '+preg.trimester}</span>}/>
  <div className="pregnancy-grid">
    <Panel className="week-explorer"><div className="week-explorer-head"><span className="eyebrow">GROWTH TIMELINE</span><span className="soft-label">Estimated due {readable(activeJourney.due_date)}</span></div><div className="week-center"><div className="week-orbit"><div className="week-inner"><Baby size={45} strokeWidth={1.45}/><span className="tiny-spark">✦</span></div></div><h3>Week {weekView??preg.week}</h3><span className="muted">Explore your baby’s progress</span></div>
      <div className="week-selector"><button disabled={(weekView??preg.week)<=4} aria-label="Previous week" onClick={()=>setWeekView(Math.max(4,(weekView??preg.week)-1))}><ArrowLeft size={17}/></button><input aria-label="Choose a pregnancy week" type="range" min={4} max={42} value={Math.max(4,weekView??preg.week)} onChange={e=>setWeekView(Number(e.target.value))}/><button disabled={(weekView??preg.week)>=42} aria-label="Next week" onClick={()=>setWeekView(Math.min(42,(weekView??preg.week)+1))}><ArrowRight size={17}/></button></div><div className="week-bottom"><span>Week 4</span><button onClick={()=>setWeekView(null)}>My current week</button><span>Week 42</span></div>
    </Panel>
    <div className="education-stack"><Panel className="education-primary"><span className="eyebrow">{edu.summary}</span><h3>{edu.title}</h3><div className="education-item"><span className="education-icon"><Baby size={19}/></span><div><strong>What’s happening with baby</strong><p>{edu.baby}</p></div></div><div className="education-item"><span className="education-icon"><Heart size={19}/></span><div><strong>What you might notice</strong><p>{edu.mother}</p></div></div><div className="education-item"><span className="education-icon"><Stethoscope size={19}/></span><div><strong>A helpful focus</strong><p>{edu.focus}</p></div></div></Panel>
     <Panel className="tip-panel"><div className="tip-top"><Sparkles size={20}/><strong>Gentle reminder</strong></div><p>Developmental timing is approximate. Your midwife or doctor can explain your baby’s individual growth, scan findings and any pregnancy concerns.</p></Panel></div>
  </div>
  <Panel className="trimester-overview"><div className="panel-heading"><div><div className="eyebrow">YOUR JOURNEY AT A GLANCE</div><h3>The three trimesters</h3></div></div><div className="trimester-grid">{[{n:1,weeks:'Weeks 1–13',detail:'The foundations'},{n:2,weeks:'Weeks 14–27',detail:'Growing and changing'},{n:3,weeks:'Week 28 to birth',detail:'Preparing to meet'}].map(t=><div className={'trimester-piece '+(preg.trimester===t.n?'current':'')} key={t.n}><span>0{t.n}</span><strong>{t.weeks}</strong><small>{t.detail}</small>{preg.trimester===t.n&&<span className="current-dot">Current</span>}</div>)}</div></Panel>
  <SourcesSmall/>
 </div>;
 }
 function Care(){
 return <div className="page-content"><SectionTitle eyebrow="WELLBEING FIRST" title={isBorn?'Your recovery & daily care':'Your daily care plan'} subtitle="Small, supportive practices for your current stage. Adapt these with your health professional’s advice." action={<span className="mini-pill">{readable(todayISO())}</span>}/>
  <div className="care-summary"><div><span className="eyebrow">TODAY’S PROGRESS</span><h3>{completedToday} of {tasks.length} gentle reminders</h3><p>You are more than a checklist. Take each day at your own pace.</p></div><div className="care-score">{Math.round(completedToday/tasks.length*100)}<small>%</small></div></div>
  <Panel className="wellbeing-panel"><div className="panel-heading"><div><div className="eyebrow">MOTHER'S WELLBEING</div><h3>How are you feeling today?</h3></div><span className="small-round lilac"><NotebookPen size={19}/></span></div>
    <p className="muted">Optional private check-in, not a mental-health assessment. Share persistent distress or serious concerns with your care team.</p>
    <form onSubmit={e=>{e.preventDefault();modify(j=>({...j,wellbeing_entries:[...(j.wellbeing_entries??[]).filter(v=>v.recorded_on!==todayISO()),{id:crypto.randomUUID(),recorded_on:todayISO(),feeling,note:wellbeingNote.trim().slice(0,400)}]}));setToast('Daily wellbeing check-in saved.');}}>
     <div className="mood-options" role="group" aria-label="How are you feeling">{([['good','Good'],['okay','Okay'],['tired','Tired'],['anxious','Worried'],['low','Low']] as [Feeling,string][]).map(([value,label])=><button key={value} type="button" aria-pressed={feeling===value} className={feeling===value?'active':''} onClick={()=>setFeeling(value)}>{label}</button>)}</div>
     <label className="wellbeing-label">A note for yourself (optional)<textarea maxLength={400} rows={2} value={wellbeingNote} onChange={e=>setWellbeingNote(e.target.value)} placeholder="Anything you want to remember or discuss with your care team?"/></label>
     <div className="button-row"><Button type="submit" Icon={CheckCircle2}>Save check-in</Button><span className="wellbeing-last">{activeJourney.wellbeing_entries?.some(v=>v.recorded_on===todayISO())?'Today’s check-in recorded':''}</span></div>
    </form>
   </Panel>
   <div className="care-list">{tasks.map(t=>{const Icon=TASK_ICONS[t.icon]||Heart;const complete=doneToday.includes(t.id);return <button key={t.id} onClick={()=>toggleDaily(t.id)} className={'care-item '+(complete?'is-checked':'')}><span className="care-item-icon"><Icon size={23}/></span><span><strong>{t.title}</strong><small>{t.description}</small></span><span className="care-check">{complete?<Check size={20}/>:<Plus size={19}/>}</span></button>;})}</div>
  <div className="two-columns"><Panel className="info-card"><span className="small-round mint"><Utensils size={19}/></span><h3>{isBorn?'Recovery and feeding':'Everyday food choices'}</h3><p>{isBorn?'Eat varied meals, rest and follow the feeding support plan suitable for your baby. Ask for help with pain or feeding difficulties.':'Enjoy varied meals that include safely cooked protein, vegetables, fruits and sufficient nourishment. Avoid alcohol and discuss supplements with your provider.'}</p></Panel><Panel className="info-card"><span className="small-round peach"><Moon size={19}/></span><h3>{isBorn?'Safe sleep for baby':'Comfortable rest'}</h3><p>{isBorn?'Always place your baby on their back, in their own firm, flat and clear sleep space. Avoid pillows, loose bedding and soft objects.':'Side-sleeping is recommended when going to sleep from 28 weeks of pregnancy. Ask your provider about pain, dizziness or positioning concerns.'}</p></Panel></div>
  <WarningCard onOpen={()=>setWarningOpen(true)}/><SourcesSmall/>
 </div>;
 }
 function Visits(){
 return <div className="page-content"><SectionTitle eyebrow="CARE CONNECTIONS" title="Antenatal visits" subtitle="Your own appointment journal. The schedule is always set with your healthcare team." action={<Button Icon={Plus} onClick={()=>setNewVisit(true)}>Add visit</Button>}/>
  <Panel className="anc-intro"><div className="anc-icon"><Stethoscope size={28}/></div><div><h3>Stay connected with your care team</h3><p>WHO describes a model with at least eight antenatal contacts across pregnancy. These weeks are general educational reference points—not appointments booked for you.</p></div></Panel>
  <Panel className="anc-timeline"><div className="panel-heading"><div><div className="eyebrow">REFERENCE TIMELINE</div><h3>Eight WHO contact points</h3></div><span className="soft-label">Illustrative only</span></div><div className="weeks-strip">{ANC_WEEKS.map((w,i)=><div key={w} className={'week-chip '+(w<=preg.week?'passed':'')}><small>{i+1}</small><strong>{w===12?'≤12':String(w)}</strong><span>wks</span></div>)}</div><p className="footnote">Ask your clinic which contact dates, examinations and follow-ups are right for your pregnancy.</p></Panel>
  {newVisit&&<Panel className="form-panel"><h3>Plan an appointment</h3><NewVisitForm onSave={v=>{void changeClinical('visit',v).then(ok=>{if(ok){setNewVisit(false);setToast('Visit added to your personal journal.');}});}} onCancel={()=>setNewVisit(false)}/></Panel>}
  {reminders.length>0&&<Panel className="reminders-panel"><div className="panel-heading"><div><div className="eyebrow">APPOINTMENT REMINDERS</div><h3>Dates to follow up</h3></div><Bell size={20}/></div><p className="muted">In-app reminders appear when you open MamaMwana. For an external reminder, add a visit to your own calendar.</p><div className="reminder-items">{reminders.map(v=><div key={v.id} className="reminder-item"><span className={'reminder-signal '+(reminderStatus(v)==='overdue'?'overdue':'')}/><span><strong>{v.clinic}</strong><small>{readable(v.scheduled_on)} · {reminderStatus(v)==='overdue'?'Date passed — confirm with clinic':reminderStatus(v)==='today'?'Today':'Within seven days'}</small></span></div>)}</div></Panel>}
   <Panel className="appointment-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR VISITS</div><h3>Appointment journal</h3></div><span className="count-label">{activeJourney.visits.length} visits</span></div>
   {activeJourney.visits.length===0?<div className="empty-state"><CalendarDays size={32}/><h4>No visits yet</h4><p>Once you book with your clinic, add the appointment here so it stays part of your journey.</p><Button variant="secondary" Icon={Plus} onClick={()=>setNewVisit(true)}>Add your first visit</Button></div>:
   <div className="appointments">{[...activeJourney.visits].sort((a,b)=>a.scheduled_on.localeCompare(b.scheduled_on)).map(v=><div className="appointment-row" key={v.id}><div className="appointment-date"><strong>{new Date(v.scheduled_on+'T12:00:00Z').getUTCDate()}</strong><small>{new Intl.DateTimeFormat('en-KE',{month:'short',timeZone:'UTC'}).format(new Date(v.scheduled_on+'T12:00:00Z'))}</small></div><div className="appointment-info"><strong>{v.clinic}</strong><small>{v.notes||'No notes added'}</small><span className={'status-inline '+(v.attended?'done':'')}>{v.attended?'Attended':v.scheduled_on<todayISO()?'Date passed — confirm status':'Upcoming / planned'}</span></div><div className="appointment-actions"><button onClick={()=>{void changeClinical('visit',{...v,attended:!v.attended});}}>{v.attended?'Mark planned':'Mark attended'}</button>{!v.attended&&<a className="calendar-link" href={visitCalendarUrl(v)} download={'mamamwana-visit-'+v.scheduled_on+'.ics'} title="Export to calendar; external calendars may store visit details"><Download size={14}/> Calendar</a>}<button aria-label={'Remove visit '+v.clinic} onClick={()=>{if(window.confirm('Remove this visit record?'))void changeClinical('visit',v,true);}}><X size={16}/></button></div></div>)}</div>}
  </Panel><SourcesSmall/>
 </div>;
 }
 function Birth(){
 return <div className="page-content"><SectionTitle eyebrow="GETTING READY" title="Your birth preparation" subtitle="Practical steps to help you feel prepared and supported." action={isBorn?<span className="tag-green"><Check size={15}/> Baby arrived</span>:undefined}/>
  <div className="birth-hero"><div><span className="eyebrow">ONE SPECIAL DAY</span><h3>When the moment comes,<br/><em>you’ll have a plan.</em></h3><p>Build a simple, flexible plan with your care team and trusted people. Birth rarely follows a perfect checklist—and that’s okay.</p></div><HeartHandshake size={100} strokeWidth={1}/></div>
  <div className="birth-layout"><Panel className="birth-list-panel"><div className="panel-heading"><div><div className="eyebrow">PREPARATION LIST</div><h3>Little things, big peace of mind</h3></div><span className="count-label">{checkCount}/{BIRTH_CHECKLIST.length}</span></div><ProgressBar value={checkCount/BIRTH_CHECKLIST.length*100}/><div className="birth-list">{BIRTH_CHECKLIST.map(c=><button key={c.key} className="birth-check-row" onClick={()=>toggleBirth(c.key)}><span className={'birth-check '+(activeJourney.birth_checks.includes(c.key)?'checked':'')}>{activeJourney.birth_checks.includes(c.key)&&<Check size={14}/>}</span><span>{c.label}</span></button>)}</div></Panel>
   <div className="birth-side"><Panel className="birth-milestone-card"><div className="birth-milestone-icon"><Baby size={28}/></div><span className="eyebrow">CONTINUE TO THE NEXT CHAPTER</span><h3>{isBorn?'Your baby’s story is here':'Your baby’s arrival'}</h3><p>{isBorn?'Your pregnancy record is connected to your baby’s milestones and your recovery care.':'After delivery, record the baby’s birth date to open postpartum recovery and newborn development features.'}</p><Button onClick={()=>isBorn?enterTab('baby'):setBirthOpen(true)}>{isBorn?'Open baby’s journey':'Record baby’s arrival'} <ArrowRight size={15}/></Button></Panel><Panel className="tip-panel"><div className="tip-top"><ShieldCheck size={19}/><strong>Plan for safety</strong></div><p>Know your facility’s emergency contact number, referral destination and transport plan. Seek urgent help for danger signs; don’t wait for an app reminder.</p></Panel></div></div>
 </div>;
 }
 function BabyPage(){
 if(!isBorn)return <div className="page-content"><SectionTitle eyebrow="THE NEXT CHAPTER" title="Your baby’s story" subtitle="This space opens when you record your baby’s arrival."/><Panel className="baby-locked"><div className="baby-locked-orb"><Baby size={54} strokeWidth={1.35}/></div><h3>One journey, from bump to baby</h3><p>After birth, you’ll find newborn care guidance, growth measurements and a flexible milestone journal here—all connected to your pregnancy story.</p><Button onClick={()=>setBirthOpen(true)}>Record baby’s arrival <ArrowRight size={16}/></Button></Panel></div>;
 const displayMilestones=MILESTONES.filter(m=>m.age===(milestoneFilter??[2,4,6,9,12,18,24,36,48,60].find(x=>x>=babyMonths)??60));
 const latestGrowth=activeJourney.growth[0];
 return <div className="page-content"><SectionTitle eyebrow="GROWING TOGETHER" title={(activeJourney.baby_name||'Baby')+'’s little world'} subtitle="A continuous story from pregnancy through these early years." action={<span className="tag-green">{formatAge(babyMonths)}</span>}/>
  <div className="baby-hero"><div className="baby-hero-circle"><Baby size={48} strokeWidth={1.4}/></div><div><span className="eyebrow">YOUR LITTLE ONE</span><h3>Hello, {activeJourney.baby_name}!</h3><p>Born {readable(activeJourney.baby_birth_date!)} • {formatAge(babyMonths)} old</p><span className="baby-hero-note"><Heart size={13}/> Your pregnancy history remains here too.</span></div></div>
  <div className="baby-stats"><div><span className="metric-label">Latest recorded weight</span><strong>{latestGrowth?.weight_kg!=null?latestGrowth.weight_kg+' kg':'Not recorded'}</strong></div><div><span className="metric-label">Latest recorded length</span><strong>{latestGrowth?.length_cm!=null?latestGrowth.length_cm+' cm':'Not recorded'}</strong></div><div><span className="metric-label">Milestones recorded</span><strong>{activeJourney.milestones.length} achieved</strong></div></div>
  <Panel className="growth-panel"><div className="panel-heading"><div><div className="eyebrow">GROWTH JOURNAL</div><h3>One little step at a time</h3></div><Button variant="secondary" Icon={Plus} onClick={()=>setGrowthOpen(v=>!v)}>Add measurement</Button></div>
   <p className="muted">Log clinic measurements. A provider should interpret growth using age, sex, gestational age at birth and WHO growth standards—numbers alone do not determine health.</p>
   {growthOpen&&<form className="inline-form" onSubmit={saveGrowth}><div className="form-row three"><label>Measurement date<input type="date" required min={activeJourney.baby_birth_date!} max={todayISO()} value={growthDate} onChange={e=>setGrowthDate(e.target.value)}/></label><label>Weight (kg)<input type="number" min="0.1" max="60" step="0.01" value={growthWeight} onChange={e=>setGrowthWeight(e.target.value)} placeholder="e.g. 3.4"/></label><label>Length (cm)<input type="number" min="1" max="180" step="0.1" value={growthLength} onChange={e=>setGrowthLength(e.target.value)} placeholder="e.g. 50"/></label></div><div className="button-row"><Button type="submit">Save measurement</Button><Button variant="subtle" onClick={()=>setGrowthOpen(false)}>Cancel</Button></div></form>}
   {activeJourney.growth.length===0?<div className="empty-state compact"><TrendingUp size={30}/><h4>No measurements recorded yet</h4><p>Add measurements from your baby’s health visits.</p></div>:<div className="growth-table" role="table"><div className="growth-th" role="row"><span>Date</span><span>Weight</span><span>Length</span></div>{activeJourney.growth.map(g=><div className="growth-tr" role="row" key={g.id}><span>{readable(g.measured_on)}</span><span>{g.weight_kg!=null?g.weight_kg+' kg':'—'}</span><span>{g.length_cm!=null?g.length_cm+' cm':'—'}</span></div>)}</div>}
  </Panel>
  <ChildHealthV03 journey={activeJourney} update={persist} onRecordDose={dose=>changeClinical('immunization',dose)} onRemoveDose={dose=>changeClinical('immunization',dose,true)}/>
   {babyMonths<=12&&<Panel className="feeding-panel"><div className="panel-heading"><div><div className="eyebrow">NEWBORN CARE JOURNAL</div><h3>Feeding moments</h3></div><span className="soft-label">Optional log</span></div>
    <p className="muted">Record feeding type for your own reference. This does not prescribe feeding times or quantities. Contact your health provider for feeding difficulties.</p>
    <div className="feeding-entry"><label>Feeding type<select value={feedingMethod} onChange={e=>setFeedingMethod(e.target.value as FeedingMethod)}><option value="breast">Breastfeeding</option><option value="expressed">Expressed milk</option><option value="formula">Formula</option><option value="other">Other / mixed feeding</option></select></label><Button Icon={Plus} onClick={()=>modify(j=>({...j,feeding_logs:[{id:crypto.randomUUID(),recorded_at:new Date().toISOString(),method:feedingMethod},...(j.feeding_logs??[])].slice(0,200)}))}>Log feeding now</Button></div>
    {(activeJourney.feeding_logs??[]).length>0&&<div className="feed-list">{activeJourney.feeding_logs.slice(0,5).map(v=><div key={v.id}><span><strong>{v.method==='breast'?'Breastfeeding':v.method==='expressed'?'Expressed milk':v.method==='formula'?'Formula':'Other / mixed feeding'}</strong><small>{new Date(v.recorded_at).toLocaleString('en-KE',{dateStyle:'medium',timeStyle:'short'})}</small></span><button aria-label="Remove feeding entry" onClick={()=>modify(j=>({...j,feeding_logs:j.feeding_logs.filter(x=>x.id!==v.id)}))}><X size={16}/></button></div>)}</div>}
   </Panel>}
   <Panel className="milestones-panel"><div className="panel-heading"><div><div className="eyebrow">DISCOVER & CELEBRATE</div><h3>Developmental milestones</h3></div><span className="soft-label">Illustrative CDC milestones</span></div>
   <p className="muted">Every child develops differently. Use these as conversation starters, not diagnostic tests. If you have concerns or a child loses a skill, ask a health professional promptly. Premature babies may need corrected-age assessment.</p>
   <div className="milestone-tabs" role="group" aria-label="Choose milestone age">{[2,4,6,9,12,18,24,36,48,60].map(m=><button key={m} className={(milestoneFilter??([2,4,6,9,12,18,24,36,48,60].find(x=>x>=babyMonths)??60))===m?'active':''} onClick={()=>setMilestoneFilter(m)}>{m<12?m+' mo':m/12+' yr'}</button>)}</div>
   <div className="milestone-items">{displayMilestones.map(m=><button className={'milestone-item '+(activeJourney.milestones.includes(m.key)?'reached':'')} key={m.key} onClick={()=>modify(j=>({...j,milestones:uniqueToggle(j.milestones,m.key)}))}><span className="milestone-status">{activeJourney.milestones.includes(m.key)?<Check size={16}/>:<Plus size={15}/>}</span><span><small>{m.area}</small><strong>{m.label}</strong></span></button>)}</div>
   <a className="text-link" href="https://www.cdc.gov/act-early/milestones/index.html" target="_blank" rel="noreferrer">See full CDC age-specific milestone checklists <ExternalLink size={14}/></a>
  </Panel>
  <Panel className="postpartum-banner"><div className="postpartum-illustration"><HeartPulse size={32}/></div><div><div className="eyebrow">MOTHER MATTERS TOO</div><h3>{pDays<=42?'Your postpartum recovery':'Your wellbeing continues'}</h3><p>{pDays<=42?'You are '+pDays+' days postpartum. Keep your postnatal follow-up plan and ask for support with healing and feelings.':'You deserve ongoing care, rest, and attention to your physical and emotional health.'}</p></div><Button variant="subtle" onClick={()=>enterTab('care')}>Care plan <ArrowRight size={15}/></Button></Panel>
 </div>;
 }
 function Library(){
 return <div className="page-content"><SectionTitle eyebrow="KNOWLEDGE WITH CARE" title="Health & learning library" subtitle="Practical education grounded in trusted health organizations. Always follow your own care team’s advice."/>
  <div className="library-grid"><Panel className="library-card"><span className="small-round mint"><Utensils size={22}/></span><h3>Food and hydration</h3><p>Eat varied, nutritious and safely prepared foods. Wash produce, cook meat and eggs thoroughly, avoid unpasteurized dairy, and discuss supplements and any special dietary needs with your care team.</p></Panel><Panel className="library-card"><span className="small-round peach"><Activity size={22}/></span><h3>Movement and comfort</h3><p>With an uncomplicated pregnancy and medical clearance, gentle movement can be beneficial. Stop if you experience concerning symptoms and seek professional advice. From 28 weeks, go to sleep on your side.</p></Panel><Panel className="library-card"><span className="small-round lilac"><Baby size={22}/></span><h3>After baby arrives</h3><p>Newborns need safe sleep on their backs, feeding support and routine newborn checks. Mothers need postnatal assessments, pain and wound support, and attention to emotional wellbeing.</p></Panel><Panel className="library-card"><span className="small-round sand"><Stethoscope size={22}/></span><h3>Health appointments</h3><p>Use your country’s current maternal and child health handbook and clinician-provided schedule for visits, immunizations and investigations. MamaMwana does not automatically prescribe them.</p></Panel></div>
  <Panel className="resources-panel"><div className="eyebrow">EVIDENCE & REFERENCES</div><h3>Learn from trusted sources</h3><div className="resource-links">{SOURCES.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><span><BookHeart size={18}/>{s.title}</span><ExternalLink size={17}/></a>)}</div><p className="footnote">General education content • Initial review October 2026 • Requires professional clinical review before use in a live health service. Not a medical device, diagnosis or individualized treatment plan.</p></Panel>
  <WarningCard onOpen={()=>setWarningOpen(true)}/>
 </div>;
 }
 return <div className="app-shell"><a className="ui-skip-link" href="#mamamwana-main">Skip to main content</a>
  <aside ref={sidebarRef} id="mamamwana-primary-navigation" className={'sidebar '+(menuOpen?'sidebar-open':'')} inert={isNarrow&&!menuOpen} aria-label="Primary navigation panel">
   <div className="sidebar-header"><Brand/><button ref={closeDrawerRef} className="mobile-close" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}><X size={20}/></button></div>
   <div className="sidebar-intro"><span className="eyebrow">{t('app.space')}</span><div className="sidebar-greeting">{t('app.growing')} <Heart size={17} strokeWidth={1.8} aria-hidden="true"/></div></div>
   <div className="nav-heading">{t('app.journey')}</div>
   <nav className="sidebar-nav" aria-label="Primary navigation">{NAV_GROUPS.map(group=><div key={group.key} className="mm13-nav-group" role="group" aria-labelledby={'mm13-group-'+group.key}><div id={'mm13-group-'+group.key} className="mm13-nav-group-label">{t(group.labelKey,group.label)}</div>{NAV.filter(item=>group.ids.includes(item.id)).map(({id,label,Icon})=><button key={id} onClick={()=>enterTab(id)} className={'nav-item '+(tab===id?'selected':'')} aria-current={tab===id?'page':undefined}><Icon size={19} strokeWidth={1.9} aria-hidden="true"/>{t('nav.'+id,label)}{tab===id&&<span className="nav-active-dot"/>}</button>)}</div>)}</nav>
   <div className="sidebar-spacer"/>
   <div className="sidebar-support"><span className="sidebar-support-icon"><ShieldCheck size={21}/></span><strong>Your health matters</strong><p>Medical concerns always deserve a real healthcare professional.</p><button onClick={()=>{setMenuOpen(false);setWarningOpen(true);}}>When to seek help <ArrowRight size={14}/></button></div>
   <div className="sidebar-footer mm-sidebar-footer"><button onClick={signOut}><LogOut size={17}/>{demo?t('app.demoExit'):t('app.logout')}</button><div className="mm-sidebar-signature"><img src="/icon.svg" width={26} height={26} alt="" aria-hidden="true"/><span><strong>MamaMwana</strong><small>© {new Date().getFullYear()} · v{APP_VERSION}</small></span></div></div>
  </aside>
  {menuOpen&&<button className="drawer-backdrop" aria-label="Close menu" onClick={()=>setMenuOpen(false)}/>}
  <div className="app-main">
   <header className="topbar"><div className="topbar-left"><button ref={hamburgerRef} className="hamburger" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mamamwana-primary-navigation" onClick={()=>setMenuOpen(true)}><Menu size={22}/></button><span className="mm-mobile-brand" aria-label="MamaMwana"><img src="/icon.svg" alt="" width={34} height={34} aria-hidden="true"/></span><span className="mm-mobile-wordmark" aria-hidden="true">mama<strong>mwana</strong></span><div className="topbar-context"><div className="topbar-hello">{t('app.hello')}, {displayName} <Sparkles className="topbar-spark" size={18} strokeWidth={1.8} aria-hidden="true"/></div><div className="topbar-subtitle"><span className="topbar-current-page">{t('nav.'+tab,NAV.find(item=>item.id===tab)?.label??'Your journey')}</span><span className="topbar-subtitle-divider" aria-hidden="true">•</span> Growing with care</div></div></div><div className="topbar-actions">
     {demo?<span className="env-label"><Cloud size={15}/> {t('app.demo')}</span>:<span className={'env-label '+(saveStatus==='error'?'env-error':'')}><CheckCircle2 size={15}/>{saveStatus==='saving'?t('app.saving'):saveStatus==='error'?t('app.saved'):t('app.private')}</span>}
     <label className="locale-switch"><span className="sr-only">{t('app.language')}</span><select aria-label="Language / Lugha" value={locale} onChange={e=>setLocale(e.target.value==='sw'?'sw':'en')}><option value="en">EN</option><option value="sw">SW</option></select></label><button type="button" className="mm14-topbar" aria-label="Display preferences" aria-haspopup="dialog" onClick={()=>{setWarningOpen(false);setDisplayOpen(true);}} title={t('a11y.heading','Display and accessibility')}><Settings2 size={18} aria-hidden="true"/></button><button className="topbar-family" aria-label="Family journeys" onClick={()=>enterTab('family')}><Users size={16}/> {t('app.family')} ({journeys.length})</button><button aria-label="Health warning signs" className="topbar-icon" onClick={()=>setWarningOpen(true)}><ShieldAlert size={19}/></button><span className="avatar">{displayName.slice(0,1).toUpperCase()}</span>
   </div>
   <div className="mm-phone-pagebar">
    <div className="mm-phone-page-label"><span>{t('app.journey','YOUR JOURNEY')}</span><strong>{t('nav.'+tab,NAV.find(item=>item.id===tab)?.label??'Your journey')}</strong></div>
    <div className="mm-phone-page-tools">
     <span className="mm-phone-mode"><span className="mm-phone-mode-dot" aria-hidden="true"/>{demo?(locale==='sw'?'Onyesho':'Preview'):saveStatus==='saving'?t('app.saving','Saving'):saveStatus==='error'?'Save issue':t('app.private','Private')}</span>
     <button type="button" className="mm-phone-urgent" aria-label="Health warning signs" onClick={()=>setWarningOpen(true)}><ShieldAlert size={19} aria-hidden="true"/><span>Safety</span></button>
    </div>
   </div></header>
   {!demo&&<BetaNoticeV10/>}
    {demo&&<div className="demo-banner"><Sparkles size={16}/><span><strong>Interactive preview:</strong> use sample details only. Changes disappear when you leave this page.</span><button onClick={signOut}>Exit <ArrowRight size={14}/></button></div>}
   {locale==='sw'&&<p className="locale-clinical-review" role="status">{t('app.review')}</p>}
    <main id="mamamwana-main" tabIndex={-1}><Suspense fallback={<div className="mm-section-loading" role="status" aria-live="polite">Loading this section…</div>}>{tab==='home'?<Home/>:tab==='family'?<Family/>:tab==='pregnancy'?<Pregnancy/>:tab==='care'?<Care/>:tab==='visits'?<Visits/>:tab==='birth'?<Birth/>:tab==='baby'?<BabyPage/>:tab==='planner'?<CarePlannerV07 journey={activeJourney} isDemo={demo} userId={user?.id??null}/>:tab==='hub'?<CareJourneyHubV12 journey={activeJourney} isDemo={demo}/>:tab==='records'?<ClinicalRecordsV04 journey={activeJourney} isDemo={demo}/>:tab==='guidance'?<GuidanceV04 stage={phase} allowStageContext={privacy.guidance_context} userId={user?.id??null} isDemo={demo}/>:tab==='privacy'?<PrivacyV04 journeys={journeys} selectedId={activeJourney.id} choices={privacy} isDemo={demo} userId={user?.id??null} onChange={savePrivacy} onExport={exportAllData} onDelete={deleteJourney}/>:<Library/>}</Suspense></main>
   <footer className="app-footer mm-app-footer">
    <div className="mm-footer-top">
     <div className="mm-footer-identity"><Brand/><p>Thoughtful support from pregnancy to early childhood. Education and your own notes, never a substitute for a healthcare professional.</p></div>
     <div className="mm-footer-links" aria-label="Footer navigation">
      <strong>Explore MamaMwana</strong>
      <button type="button" onClick={()=>enterTab('family')}><Users size={15} aria-hidden="true"/> Family journeys</button>
      <button type="button" onClick={()=>enterTab('guidance')}><BookHeart size={15} aria-hidden="true"/> Care guidance</button>
      <button type="button" onClick={()=>enterTab('privacy')}><ShieldCheck size={15} aria-hidden="true"/> Privacy & records</button>
     </div>
     <div className="mm-footer-trust"><strong><LockKeyhole size={16} aria-hidden="true"/> Privacy & trust</strong><p>Preview features use sample data. Controlled account sign-in does not authorize clinical data collection or caregiver access.</p><span><ShieldCheck size={15} aria-hidden="true"/> Safety-first experience</span></div>
    </div>
    <div className="mm-footer-bottom"><span>© {new Date().getFullYear()} MamaMwana · v{APP_VERSION}</span><span>{t('app.educational')}</span></div>
   </footer>
  </div>
  <nav className="mobile-tabs" aria-label="Quick navigation">{[{id:'home' as Tab,label:'Home',Icon:House},{id:'care' as Tab,label:'Today',Icon:Heart},{id:'planner' as Tab,label:'Planner',Icon:ListTodo},{id:'visits' as Tab,label:'Visits',Icon:CalendarDays},{id:'baby' as Tab,label:'Baby',Icon:Baby}].map(({id,label,Icon})=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>enterTab(id)}><Icon size={21} strokeWidth={1.85} aria-hidden="true"/><span>{label}</span></button>)}</nav>
  {displayOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDisplayOpen(false);}}><div className="modal mm14-dialog" ref={displayDialogRef} role="dialog" aria-modal="true" aria-labelledby="mm14-preferences-title" tabIndex={-1}><button type="button" className="modal-close" aria-label={t('a11y.close','Close display preferences')} onClick={()=>setDisplayOpen(false)}><X size={20}/></button><DisplayPreferencesV14/></div></div>}
   {warningOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setWarningOpen(false);}}><div className="modal warning-modal" ref={warningDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="urgent-title"><button className="modal-close" aria-label="Close" onClick={()=>setWarningOpen(false)}><X size={20}/></button><div className="modal-mark danger"><ShieldAlert size={26}/></div><h2 id="urgent-title">When to seek urgent help</h2><p className="muted">If you or your baby has any of these concerns, seek immediate in-person medical assessment or contact local emergency services. Do not wait for an app response.</p><ul className="urgent-list">{URGENT.map(t=><li key={t}><span className="urgent-dot"/>{t}</li>)}</ul><p className="footnote">This is not an exhaustive list. If something feels seriously wrong, get checked promptly. For urgent warning signs, follow your local emergency care instructions.</p><Button onClick={()=>setWarningOpen(false)}>I understand</Button></div></div>}
  {birthOpen&&<BirthModal dueDate={activeJourney.due_date} onClose={()=>setBirthOpen(false)} onBirth={markBirth}/>}
  {toast&&<Notification message={toast} onClose={()=>setToast('')}/>}
 </div>;
}
