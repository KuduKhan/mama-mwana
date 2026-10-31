import {useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowLeft,ArrowRight,Baby,CheckCircle2,CircleHelp,Heart,LockKeyhole,Plus,ShieldCheck,Sparkles,X} from 'lucide-react';
import {authConfigured,authSupabase,configured} from '../lib/supabase';
import {useMamaLocale} from '../lib/locale';
import {addDays,isDate,isValidBirthDate,makeJourney,todayISO,validateOnboarding} from '../lib/domain';
import type {Journey,Visit} from '../lib/domain';
import {Brand,Button,Panel} from '../ui/primitives';
import {useModalFocus} from '../ui/useModalFocus';
import {APP_DISPLAY_VERSION} from '../lib/release';
export function AuthGate({onDemo,onLearn}:{onDemo:()=>void;onLearn:()=>void}){
 const {locale,setLocale,t}=useMamaLocale();
 const [mode,setMode]=useState<'signin'|'signup'|'recover'>('signup');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 async function submit(e:FormEvent){
  e.preventDefault();if(!authSupabase)return;
  setBusy(true);setMessage('');
  try{
   const result=mode==='recover'
    ?await authSupabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin})
    :mode==='signup'
    ?await authSupabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}})
    :await authSupabase.auth.signInWithPassword({email:email.trim(),password});
   if(result.error)setMessage(result.error.message);
   else if(mode==='recover')setMessage('If this account exists, check its email for a password recovery link.');
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
   <div className="badge-soft"><Sparkles size={14}/> {t('auth.welcome')}</div><div className="mm20-auth-edition">{APP_DISPLAY_VERSION} <span aria-hidden="true">·</span> Public learning</div>
   <h2>{authConfigured?(mode==='signup'?t('auth.begin'):mode==='recover'?'Recover your account':t('auth.return')):'Welcome to MamaMwana'}</h2>
   <p className="muted">{authConfigured?'Use a verified account for authentication. Private health records stay restricted until separately approved.':'Use the public bilingual learning library without an account. A separate sample-data journey is available for exploration only.'}</p>
   {authConfigured&&<><div className="auth-switch"><button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('');}}>{t('auth.signup')}</button><button className={mode==='signin'?'active':''} onClick={()=>{setMode('signin');setMessage('');}}>{t('auth.signin')}</button></div>
     <form onSubmit={submit} className="stack-form"><label>{t('auth.email')}<input type="email" required autoComplete="email" placeholder="mama@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=='recover'&&<label>{t('auth.password')}<input type="password" required minLength={12} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder="At least 12 characters" value={password} onChange={e=>setPassword(e.target.value)}/></label>}
     {message&&<div className="inline-note" role="status">{message}</div>}
     <Button type="submit" disabled={busy}>{busy?'Please wait...':mode==='recover'?'Send recovery link':mode==='signup'?'Create my account':'Sign in'} <ArrowRight size={16}/></Button>
     {mode==='signin'&&<button type="button" className="mm-account-link" onClick={()=>{setMode('recover');setMessage('');}}>Forgot password?</button>}
     {mode==='recover'&&<button type="button" className="mm-account-link" onClick={()=>{setMode('signin');setMessage('');}}>Return to sign in</button>}
     </form></>}
   <div className="mm-live-open"><Button type="button" Icon={ArrowRight} onClick={onLearn}>Open learning library — no account required</Button><p>Read general family-learning resources and try educational quizzes. No sample pregnancy profile or medical information needed.</p></div>
   <div className="demo-divider">{authConfigured?'OPTIONAL SAMPLE EXPERIENCE':'OPTIONAL SAMPLE-DATA EXPERIENCE'}</div>
   <button className="demo-button" onClick={onDemo}><span className="demo-symbol"><Sparkles size={19}/></span><span><strong>{t('auth.demo')}</strong><small>{t('auth.demoDetails')}</small></span><ArrowRight size={18}/></button>
   <p className="footnote"><LockKeyhole size={14}/> Medical information should only be entered after your private database is connected. This app supports—not replaces—professional care.</p>
   </div></div>
 </div>;
}
export function Onboarding({onCreate,isDemo,onCancel}:{onCreate:(j:Journey)=>void;isDemo:boolean;onCancel?:()=>void}){
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
export function NewVisitForm({onSave,onCancel}:{onSave:(v:Visit)=>void;onCancel:()=>void}){
 const [date,setDate]=useState(addDays(todayISO(),7)),[clinic,setClinic]=useState(''),[notes,setNotes]=useState('');
 function submit(e:FormEvent){e.preventDefault();if(!isDate(date)||!clinic.trim())return;onSave({id:crypto.randomUUID(),scheduled_on:date,clinic:clinic.trim().slice(0,100),notes:notes.trim().slice(0,500),attended:false});}
 return <form className="inline-form" onSubmit={submit}><div className="form-row"><label>Visit date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label><label>Facility / contact<input required maxLength={100} placeholder="Clinic or midwife" value={clinic} onChange={e=>setClinic(e.target.value)}/></label></div><label>Questions or notes (optional)<textarea maxLength={500} rows={2} placeholder="What would you like to ask?" value={notes} onChange={e=>setNotes(e.target.value)}/></label><div className="button-row"><Button type="submit" Icon={Plus}>Save visit</Button><Button variant="subtle" onClick={onCancel}>Cancel</Button></div></form>;
}
export function BirthModal({onClose,onBirth,dueDate}:{onClose:()=>void;onBirth:(date:string,name:string)=>void;dueDate:string}){
 const [date,setDate]=useState(todayISO()),[name,setName]=useState(''),[error,setError]=useState('');
 const dialogRef=useModalFocus(true,onClose,'.baby-locked .btn');
 function submit(e:FormEvent){e.preventDefault();if(!isValidBirthDate(date,dueDate)){setError('Please enter a valid birth date. Contact your care provider if your dates need correcting.');return;}if(name.trim().length<1||name.trim().length>80){setError('Enter your baby’s name (up to 80 characters).');return;}onBirth(date,name.trim());}
 return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="birth-title"><button className="modal-close" aria-label="Close" onClick={onClose}><X size={20}/></button><div className="modal-mark"><Baby size={26}/></div><h2 id="birth-title">Hello, little one! <span aria-hidden="true">♡</span></h2><p className="muted">This special moment connects your pregnancy journal with your baby’s growth tracker and your postpartum recovery guidance.</p><form className="stack-form" onSubmit={submit}><label>Baby’s name<input value={name} maxLength={80} required placeholder="Your baby’s name" onChange={e=>setName(e.target.value)}/></label><label>Date of birth<input type="date" required max={todayISO()} value={date} onChange={e=>setDate(e.target.value)}/></label><div className="inline-note">Birth and recovery information should be confirmed with your maternity care team. This does not replace medical discharge instructions.</div>{error&&<div role="alert" className="error">{error}</div>}<Button type="submit">Begin our next chapter <ArrowRight size={16}/></Button></form></div></div>;
}
