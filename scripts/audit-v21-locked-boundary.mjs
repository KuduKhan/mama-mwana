/**
 * RC.1 fail-closed source audit. This is a regression control, not a clinical,
 * legal, privacy or integration approval. No patient records or secrets read.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
export const REQUIRED_SERVICES=Object.freeze(['clinician','growth','reminders','coordination','interop']);
export const REQUIRED_GATES=Object.freeze(['clinical','bilingual','privacy','security','isolation','recovery','erasure','devices','operations','release']);
const text=path=>readFileSync(resolve(path),'utf8');
const json=path=>JSON.parse(text(path));
const same=(actual,expected)=>actual.length===expected.length&&actual.every((id,i)=>id===expected[i]);

/** Pure audit with injectable synthetic fixtures for regression tests. */
export function auditV21Boundary({contracts,catalog,preview,releaseGuard,pkg,manifest,matrix,worklist}){
 const violations=[];
 const fail=(code)=>violations.push(code);
 const contractIds=[...contracts.matchAll(/^\s*([a-z]+):\{id:'([^']+)'/gm)].map(m=>m[1]===m[2]?m[1]:'MISMATCH');
 const catalogIds=[...catalog.matchAll(/\{id:'([^']+)',title:/g)].map(m=>m[1]);
 if(!same(contractIds,REQUIRED_SERVICES))fail('CONTRACT_IDS_DRIFT');
 if(!same(catalogIds,REQUIRED_SERVICES))fail('CATALOG_IDS_DRIFT');
 if((contracts.match(/state:'LOCKED',backendRequired:true/g)||[]).length!==5)fail('CONTRACT_UNLOCKED');
 if((catalog.match(/status:'LOCKED'/g)||[]).length!==5)fail('CATALOG_UNLOCKED');
 if(!/export function requireConnectedCareAuthorization\([^)]*\):never\s*\{\s*throw new Error\('MM_V21_CLINICAL_NO_GO:/.test(catalog))fail('REQUIRED_DENY_MISSING');
 if(!/export function invokeConnectedCare\(\):never\s*\{return requireConnectedCareAuthorization\(\);\}/.test(contracts))fail('INVOKE_DENY_MISSING');
 if(!preview.includes('NOT AUTHORIZED')||!preview.includes('All clinical capabilities are locked'))fail('PUBLIC_WARNING_MISSING');
 // Catch accidental service adapters, credentials or network primitives in public v2.1 files.
 const forbidden=/\b(?:fetch|createClient|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(|\b(?:SUPABASE_SERVICE_ROLE_KEY|service_role|VITE_CONNECTED_CARE_ENABLED)\b|\b(?:axios|navigator|window)\s*\./;
 for(const [file,source] of Object.entries({contracts,catalog,preview})){
  if(forbidden.test(source))fail('UNREVIEWED_RUNTIME_PATH_'+file.toUpperCase());
 }
 if(pkg?.version!=='2.0.0-rc.1')fail('UNAUTHORIZED_VERSION_CHANGE');
 if(manifest?.status!=='NO_GO'||manifest?.productionClinicalAccess!==false||
    !same((manifest?.requiredGates||[]).map(g=>g.id),REQUIRED_GATES)||
    !manifest.requiredGates.every(g=>g.status==='pending'&&g.evidence===null&&g.reviewer===null&&g.signedAt===null))
  fail('RELEASE_GATE_DRIFT');
 if(matrix?.clinicalLaunchAuthorization!=='NONE'||
    !same((matrix?.gates||[]).map(g=>g.id),REQUIRED_GATES)||
    !matrix.gates.every(g=>g.status==='awaiting-independent-review'))
  fail('REVIEW_MATRIX_DRIFT');
 if(worklist?.clinicalRelease!=='NO_GO'||worklist?.independentApprovalVerified!==false||
    worklist?.actualHostedRecoveryVerified!==false||worklist?.regulatoryCertificationVerified!==false||
    worklist?.hostedMigration12!=='NOT_APPLIED'||
    !same((worklist?.gates||[]).map(g=>g.id),REQUIRED_GATES)||
    !worklist.gates.every(g=>g.status==='pending'&&g.owner===null&&g.evidenceVaultReference===null&&
      g.independentReviewer===null&&g.reviewedCommit===null&&g.approvedAt===null))
  fail('INDEPENDENT_EVIDENCE_DRIFT');
 if(!releaseGuard.includes("environment==='production'&&enabled")||
    !releaseGuard.includes('MM_PRODUCTION_CLINICAL_NO_GO'))
  fail('PRODUCTION_BOUNDARY_DRIFT');
 return violations;
}
export function currentV21Boundary(){
 return {
  contracts:text('src/lib/connectedCareContractsV21.ts'),
  catalog:text('src/lib/connectedServicesV21.ts'),
  preview:text('src/components/ConnectedServicesReadinessV21.tsx'),
  releaseGuard:text('scripts/clinical-release-boundary.mjs'),
  pkg:json('package.json'),
  manifest:json('docs/V200_RELEASE_SIGNOFF.json'),
  matrix:json('docs/V200_ACCEPTANCE_MATRIX.json'),
  worklist:json('docs/RC1_EXTERNAL_ACCEPTANCE.json')
 };
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 const issues=auditV21Boundary(currentV21Boundary());
 if(issues.length){console.error('MM_V21_BOUNDARY_AUDIT_FAILED: '+issues.join(', '));process.exitCode=1;}
 else console.log('PASS v2.1 five services LOCKED; ten RC.1 gates PENDING; no activation or provider adapter in reviewed files.');
}
