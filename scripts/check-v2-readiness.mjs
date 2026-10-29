import fs from 'node:fs';
import path from 'node:path';
const manifest=JSON.parse(fs.readFileSync(path.resolve('docs/V200_RELEASE_SIGNOFF.json'),'utf8'));
const allowed=new Set(['pending','approved']);
const unique=new Set(manifest.requiredGates?.map(g=>g.id));
if(manifest.candidate!=='v2.0.0'||manifest.status!=='NO_GO'||manifest.productionClinicalAccess!==false||
 !Array.isArray(manifest.requiredGates)||manifest.requiredGates.length!==10||unique.size!==10||
 !manifest.requiredGates.every(g=>allowed.has(g.status))){
 console.error('Invalid v2.0 readiness manifest; fail closed.');
 process.exit(1);
}
const missing=manifest.requiredGates.filter(g=>g.status!=='approved'||!g.evidence||!g.reviewer||!g.signedAt);
console.log('MamaMwana v2.0.0 clinical release: NO-GO.');
console.log('Pending independent evidence: '+missing.length+'/'+manifest.requiredGates.length+'.');
for(const g of missing)console.log(' - '+g.id+': '+g.label);
if(process.argv.includes('--require-go')){
 console.error('Patient-data release is not authorized by a repository manifest or passing CI. A separate independently reviewed clinical-release PR and written approvals are required; production Vite build gate remains active.');
 process.exit(1);
}
if(missing.length===0){
 console.error('All fields have entries, but signed evidence must still be independently validated and reviewed in a separate clinical-release PR.');
}
