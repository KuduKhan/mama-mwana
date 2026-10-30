import {CheckCircle2,LockKeyhole,ShieldAlert,UserRoundCheck} from 'lucide-react';
export default function PrivacyTrustV205({isDemo}:{isDemo:boolean}){
 return <section className="mm25-trust" aria-labelledby="mm25-trust-title">
  <header><LockKeyhole size={22} aria-hidden="true"/><div><h3 id="mm25-trust-title">Privacy and permission clarity</h3><p>Understand what this preview can and cannot do. A clinical production launch has not been approved.</p></div></header>
  <div className="mm25-trust-grid">
   <div><CheckCircle2 size={19} aria-hidden="true"/><strong>{isDemo?'Sample-only experience':'Restricted account experience'}</strong><small>{isDemo?'Demo entries are in memory and not synced. They can disappear when this page closes.':'A verified account does not mean clinical or caregiver access is cleared for real patient use.'}</small></div>
   <div><UserRoundCheck size={19} aria-hidden="true"/><strong>Caregiver sharing needs consent</strong><small>Access is explicitly scoped, time-limited and revocable; legal guardian authority must be independently verified before clinical release.</small></div>
   <div><ShieldAlert size={19} aria-hidden="true"/><strong>Clinical launch is restricted</strong><small>No unrestricted patient onboarding or approved clinical medical decisions. Independent safety, privacy and security review is pending.</small></div>
  </div>
 </section>;
}