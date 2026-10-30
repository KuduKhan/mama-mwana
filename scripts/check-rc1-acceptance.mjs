import {readFileSync} from 'node:fs';
import {assessV200Acceptance,REQUIRED_GATE_IDS} from './v200-acceptance-core.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const pkg=read('package.json'),manifest=read('docs/V200_RELEASE_SIGNOFF.json');
const matrix=read('docs/V200_ACCEPTANCE_MATRIX.json'),worklist=read('docs/RC1_EXTERNAL_ACCEPTANCE.json');
const packet=assessV200Acceptance(manifest,matrix);
const valid= pkg.version==='2.0.0-rc.1'&&worklist.candidate===pkg.version&&
 manifest.status==='NO_GO'&&manifest.productionClinicalAccess===false&&
 packet.decision==='NO_GO'&&packet.independentApprovalVerified===false&&
 worklist.clinicalRelease==='NO_GO'&&worklist.independentApprovalVerified===false&&
 worklist.actualHostedRecoveryVerified===false&&worklist.regulatoryCertificationVerified===false&&
 worklist.hostedMigration12==='NOT_APPLIED'&&
 worklist.gates.length===10&&worklist.gates.every((g,i)=>
  g.id===REQUIRED_GATE_IDS[i]&&g.status==='pending'&&
  g.owner===null&&g.evidenceVaultReference===null&&g.independentReviewer===null&&
  g.approvedAt===null);
if(!valid){console.error('RC1_ACCEPTANCE_INVALID: gate, staged migration or source version drift');process.exit(1);}
if(process.argv.includes('--require-clinical-go')){
 console.error('MM_RC1_CLINICAL_NO_GO: source CI and review planning are not independent authorization.');
 process.exit(1);
}
console.log('PASS RC.1 acceptance worklist integrity. Clinical release NO_GO: 10 independent gates pending.');
console.log('Host v12 account-erasure FK not applied; hosted recovery and official review not verified.');
