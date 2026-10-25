/** Privacy-safe, deterministic release checks. Never send user records to CI logs. */
export type CheckState='pass'|'block'|'review';
export interface ReleaseCheck {id:string;label:string;state:CheckState;detail:string}
export function evaluateReleaseChecks(input:{
 migrationsApplied:boolean;isolationVerified:boolean;clinicalApproval:boolean;
 privacyApproval:boolean;backupRestoreVerified:boolean;productionSmokeVerified:boolean
}):ReleaseCheck[]{
 return [
  {id:'db',label:'Database schema',state:input.migrationsApplied?'pass':'block',detail:'Migrations must be applied and verified in order.'},
  {id:'rls',label:'Two-account privacy isolation',state:input.isolationVerified?'pass':'block',detail:'RLS must be tested using separate, disposable signed-in users.'},
  {id:'clinical',label:'Clinical content approval',state:input.clinicalApproval?'pass':'block',detail:'Approval requires a qualified human reviewer.'},
  {id:'privacy',label:'Privacy and legal review',state:input.privacyApproval?'pass':'block',detail:'Kenyan health/child-data obligations and retention require signed review.'},
  {id:'recovery',label:'Backup recovery exercise',state:input.backupRestoreVerified?'pass':'block',detail:'A restorable, access-controlled backup must be tested.'},
  {id:'smoke',label:'Production smoke tests',state:input.productionSmokeVerified?'pass':'block',detail:'Verify real sign-in, saving, journeys, and permission boundaries.'}
 ];
}
export function isReleaseReady(checks:readonly ReleaseCheck[]):boolean{
 return checks.length>0 && checks.every(c=>c.state==='pass');
}
