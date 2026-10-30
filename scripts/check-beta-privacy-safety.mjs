import {readFileSync} from 'node:fs';
import {assertClinicalReleaseBoundary} from './clinical-release-boundary.mjs';
const read=path=>readFileSync(path,'utf8');
const m=JSON.parse(read('docs/V200_RELEASE_SIGNOFF.json'));
const pkg=JSON.parse(read('package.json'));
const failures=[];
if(pkg.version!=='2.0.0-beta.5')failures.push('Expected beta.5 release');
if(m.status!=='NO_GO'||m.productionClinicalAccess!==false)failures.push('Clinical NO_GO violated');
if(m.requiredGates.length!==10||m.requiredGates.some(g=>g.status!=='pending'||g.signedAt!==null))failures.push('Missing real approvals must stay pending');
const sw=read('public/demo-offline-sw.js');
if(!sw.includes("req.method!=='GET'")||!sw.includes("'/learning/mamamwana-public-guide-v204.txt'")||!sw.includes('mamamwana-public-demo-v2.0.0-beta.5'))failures.push('Public offline caching contract changed');
if(sw.includes('supabase.co')||sw.includes('localStorage')||sw.includes('indexedDB'))failures.push('Private data in offline caching code');
const rights=read('src/components/PrivacyV04.tsx');
if(rights.includes('String(err)')||rights.includes('String(e)'))failures.push('Raw exception leak in privacy UI');
for(const p of ['src/components/SmartHomeV202.tsx','src/components/PublicLearningV204.tsx','src/components/FamilyIntelligenceV203.tsx'])if(read(p).includes('SUPABASE_SERVICE_ROLE_KEY'))failures.push('Privileged key in public feature');
try{assertClinicalReleaseBoundary({VERCEL_ENV:'production',VITE_AUTH_ACCESS_ENABLED:'true'});failures.push('Live clinical build guard bypassed');}
catch(error){if(!String(error?.message).includes('MM_PRODUCTION_CLINICAL_NO_GO'))failures.push('Unexpected guard failure');}
if(failures.length){failures.forEach(x=>console.error('FAIL: '+x));process.exit(1);}
console.log('PASS: beta.5 preview; 10 pending clinical approval gates; privacy-safe errors; public-only offline cache and clinical NO-GO.');