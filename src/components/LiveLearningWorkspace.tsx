import {lazy,Suspense,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {BookOpen,LockKeyhole,LogOut,ShieldAlert,ShieldCheck,ArrowLeft} from 'lucide-react';
import {Brand,Button,Panel} from '../ui/primitives';
import {useMamaLocale} from '../lib/locale';
import {APP_DISPLAY_VERSION} from '../lib/release';
import {personalTrackerEnabled} from '../lib/supabase';
const PersonalTrackerWorkspace=lazy(()=>import('./PersonalTrackerWorkspace'));

// An operational, public educational experience. No patient data, medical
// profiles, care-provider integrations or clinical backend calls are made here.
const LibraryPage=lazy(()=>import('../features/learning/LibraryPage'));
export default function LiveLearningWorkspace({user=null,onBack,onSignOut}:{
 user?:User|null;onBack?:()=>void;onSignOut?:()=>Promise<void>|void;
}){
 const {locale,setLocale}=useMamaLocale();
 const [emergency,setEmergency]=useState(false);
 const [busy,setBusy]=useState(false);
 const [signOutError,setSignOutError]=useState('');
 async function exit(){
  if(!onSignOut||busy)return;
  setBusy(true);setSignOutError('');
  try{await onSignOut();}catch{setSignOutError('Could not sign out securely. Check your connection and try again.');}finally{setBusy(false);}
 }
 return <div className="mm-live-learning">
  <header className="mm-live-header">
   <Brand/>
   <div className="mm-live-actions">
    <label className="mm-live-language">Language / Lugha
     <select value={locale} onChange={e=>setLocale(e.target.value==='sw'?'sw':'en')} aria-label="Learning language">
      <option value="en">English</option><option value="sw">Kiswahili</option>
     </select>
    </label>
    {user?<Button variant="subtle" disabled={busy} Icon={LogOut} onClick={()=>{void exit();}}>Sign out</Button>
      :<Button variant="subtle" Icon={ArrowLeft} onClick={onBack}>Back</Button>}
   </div>
  </header>
  <main id="main-content" className="mm-live-main">
   <div className="mm-live-intro">
    <div className="mm-live-lead"><span className="eyebrow"><BookOpen size={16} aria-hidden="true"/> PUBLIC EDUCATION · {APP_DISPLAY_VERSION}</span>
     <h1>{user?'Welcome to your learning space':'Explore MamaMwana learning'}</h1>
     <p>Read evidence-linked educational materials, explore topics and take the learning checks without creating a medical record.</p></div>
    <div className="mm-live-trust" role="status"><ShieldCheck size={20} aria-hidden="true"/>
     <div><strong>{user?'Your account session is active':'No account needed'}</strong>
      <span>{user?'You are signed in to a real account. The clinical workspace is not authorized and cannot accept health records.':'Learning is available without signing in. No health profile is saved.'}</span>
     </div></div>
   </div>
   {signOutError&&<p role="alert" className="error">{signOutError}</p>}
   <Panel className="mm-live-care-boundary"><LockKeyhole size={20} aria-hidden="true"/>
    <div><strong>{user&&personalTrackerEnabled?'Clinical care records remain closed':'Private care records remain closed'}</strong>
     <p>{user&&personalTrackerEnabled?'Your personal organizer is separate from clinician records. Clinical diagnosis, professional growth interpretation and provider messaging remain disabled.':'Pregnancy journals, child records, clinical interpretation and provider messaging are disabled until independent clinical, privacy, security and operational approval. Do not enter personal medical details into public learning or sample modes.'}</p></div>
   </Panel>
   {user&&personalTrackerEnabled&&<Suspense fallback={<p className="mm-live-loading" role="status">Opening private organizer…</p>}><PersonalTrackerWorkspace key={user.id} user={user}/></Suspense>}
   <Suspense fallback={<p className="mm-live-loading" role="status">Loading educational resources…</p>}>
    <LibraryPage onEmergency={()=>setEmergency(v=>!v)}/>
   </Suspense>
   {emergency&&<div className="mm-live-emergency" role="alert"><ShieldAlert size={22} aria-hidden="true"/><div>
    <strong>Urgent health concern?</strong>
    <p>If someone has severe symptoms or an immediate danger sign, seek emergency medical care or contact local emergency services. MamaMwana cannot provide emergency clinical assessment.</p>
    <button type="button" onClick={()=>setEmergency(false)}>Close notice</button></div></div>}
  </main>
 </div>;
}
