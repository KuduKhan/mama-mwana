/** Explicit no-go guard for MamaMwana clinical-data production builds.
 * The demo release may deploy normally; preview and local test environments can
 * exercise disposable clinical fixtures without ever touching real patients.
 * No secret, token, health data or subscriber identifier is consumed here.
 */
export function assertClinicalReleaseBoundary(env){
 const environment=String(env?.VERCEL_ENV??'').trim().toLowerCase();
 const enabled=String(env?.VITE_AUTH_ACCESS_ENABLED??'').trim().toLowerCase()==='true';
 if(environment==='production'&&enabled){
  throw new Error('MM_PRODUCTION_CLINICAL_NO_GO: The reviewed production demo release cannot enable patient-data access. Complete approved clinical, privacy, restore, security and device signoff first; then change this explicit source-level release gate through reviewed code.');
 }
}
