import {useState} from 'react';
import type {FormEvent} from 'react';
import {LockKeyhole,ShieldCheck} from 'lucide-react';
import {authSupabase} from '../lib/supabase';
import {Brand,Button,Panel} from '../ui/primitives';

/** Supabase PASSWORD_RECOVERY event only; does not access patient data. */
export default function AccountPasswordReset({onComplete}:{onComplete:()=>void}){
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();setError('');
  if(!authSupabase){setError('Account service is not configured.');return;}
  if(password.length<12){setError('Choose a password with at least 12 characters.');return;}
  if(password!==confirm){setError('Passwords do not match.');return;}
  setBusy(true);
  try{
   const {error:updateError}=await authSupabase.auth.updateUser({password});
   if(updateError)throw updateError;
   const {error:signOutError}=await authSupabase.auth.signOut();
   if(signOutError)throw signOutError;
   onComplete();
  }catch{setError('Password update or secure sign-out failed. Please verify the recovery link and try again.');}
  finally{setBusy(false);}
 }
 return <main className="auth-layout mm-account-recovery">
  <div className="auth-story"><Brand inverse/><div className="auth-story-copy"><h1>Secure account recovery</h1><p>Choose a new password for your MamaMwana account. This does not activate any clinical service.</p></div></div>
  <div className="auth-form-side"><Panel className="auth-panel"><div className="badge-soft"><ShieldCheck size={16}/> Account security</div><h2>Set your new password</h2>
   <form className="stack-form" onSubmit={submit}>
    <label>New password<input type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label>Confirm new password<input type="password" required minLength={12} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
    {error&&<p role="alert" className="error">{error}</p>}
    <Button type="submit" disabled={busy} Icon={LockKeyhole}>{busy?'Updating…':'Update password and sign out'}</Button>
   </form><p className="footnote">After resetting your password, sign in again. No patient records are accessed by this form.</p>
  </Panel></div>
 </main>;
}
