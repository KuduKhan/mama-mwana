import {createHash} from 'node:crypto';
export const REQUIRED_GATE_IDS=Object.freeze(['clinical','bilingual','privacy','security','isolation','recovery','erasure','devices','operations','release']);
const hash=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
export function assessV200Acceptance(manifest,matrix,{commit=null,runUrl=null}={}){
 if(!manifest||!matrix||!Array.isArray(manifest.requiredGates)||!Array.isArray(matrix.gates))throw new Error('Malformed v2 evidence documents');
 const a=manifest.requiredGates,b=matrix.gates;
 if(a.length!==10||b.length!==10||a.some((g,i)=>g.id!==REQUIRED_GATE_IDS[i])||
  b.some((g,i)=>g.id!==REQUIRED_GATE_IDS[i])||
  a.some(g=>!['pending','approved'].includes(g.status)))throw new Error('Gate mismatch: fail closed');
 if(manifest.candidate!=='v2.0.0'||matrix.candidate!=='v2.0.0'||
  manifest.status!=='NO_GO'||manifest.productionClinicalAccess!==false||
  matrix.clinicalLaunchAuthorization!=='NONE')throw new Error('Clinical release boundary violation');
 const pending=a.filter(g=>g.status!=='approved'||!g.evidence||!g.reviewer||!g.signedAt).map(g=>g.id);
 return {schema:'mamamwana.v200.technical-readiness.v1',candidate:'v2.0.0',
  decision:'NO_GO',patientDataAccessAllowed:false,realPatientDataUsed:false,
  independentApprovalVerified:false,technicalPacketOnly:true,
  gatesTotal:10,gatesPending:pending.length,pendingGateIds:pending,
  matrixDigestSha256:hash(matrix),manifestDigestSha256:hash(manifest),
  sourceCommit:/^[a-f0-9]{40}$/.test(commit??'')?commit:null,
  githubRunUrl:/^https:\/\/github\.com\/KuduKhan\/mama-mwana\/actions\/runs\/\d+$/.test(runUrl??'')?runUrl:null,
  note:'Engineering metadata and reviewer worklist only; no clinical, legal, penetration, recovery, hardware, DHA or final signoff has been independently verified.'};
}
