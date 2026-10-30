import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {auditV21Boundary,currentV21Boundary} from './audit-v21-locked-boundary.mjs';
const baseline=()=>currentV21Boundary();
const audit=(mutate)=>{const b=baseline();mutate(b);return auditV21Boundary(b);};
describe('MamaMwana RC.1 immutable clinical release boundary',()=>{
 it('accepts only the locked architecture and pending independent gates',()=>{
  assert.deepEqual(auditV21Boundary(baseline()),[]);
 });
 it('rejects any unlocked service contract or catalogue status',()=>{
  assert.ok(audit(b=>{b.contracts=b.contracts.replace("state:'LOCKED'","state:'READY'");}).includes('CONTRACT_UNLOCKED'));
  assert.ok(audit(b=>{b.catalog=b.catalog.replace("status:'LOCKED'","status:'ACTIVE'");}).includes('CATALOG_UNLOCKED'));
 });
 it('rejects added patient-data service adapters and browser credentials',()=>{
  assert.ok(audit(b=>{b.preview+="\nfetch('/api/patient');";}).includes('UNREVIEWED_RUNTIME_PATH_PREVIEW'));
  assert.ok(audit(b=>{b.contracts+="\nconst x=SUPABASE_SERVICE_ROLE_KEY;";}).includes('UNREVIEWED_RUNTIME_PATH_CONTRACTS'));
 });
 it('rejects fake activation paths or removed fail-closed controls',()=>{
  assert.ok(audit(b=>{b.catalog=b.catalog.replace("throw new Error('MM_V21_CLINICAL_NO_GO:","return 'ok'; // ");}).includes('REQUIRED_DENY_MISSING'));
  assert.ok(audit(b=>{b.releaseGuard='';}).includes('PRODUCTION_BOUNDARY_DRIFT'));
 });
 it('rejects clinical signoff claims without separate evidence procedure',()=>{
  assert.ok(audit(b=>{b.manifest.status='GO';}).includes('RELEASE_GATE_DRIFT'));
  assert.ok(audit(b=>{b.matrix.clinicalLaunchAuthorization='GRANTED';}).includes('REVIEW_MATRIX_DRIFT'));
  assert.ok(audit(b=>{b.worklist.gates[0].status='approved';}).includes('INDEPENDENT_EVIDENCE_DRIFT'));
  assert.ok(audit(b=>{b.worklist.hostedMigration12='APPLIED';}).includes('INDEPENDENT_EVIDENCE_DRIFT'));
  assert.ok(audit(b=>{b.pkg.version='2.0.0';}).includes('UNAUTHORIZED_VERSION_CHANGE'));
 });
 it('rejects removal or substitution of any of five services or ten acceptance gates',()=>{
  assert.ok(audit(b=>{b.contracts=b.contracts.replace("clinician:{id:'clinician'","other:{id:'clinician'");}).includes('CONTRACT_IDS_DRIFT'));
  assert.ok(audit(b=>{b.worklist.gates.pop();}).includes('INDEPENDENT_EVIDENCE_DRIFT'));
 });
});
