import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const source=read('src/ui/navigation.ts'),ui=read('src/components/TrustQualityV210.tsx');
const main=read('src/main.tsx'),learning=read('src/components/LearningAcademyV209.tsx');
const story=read('src/components/FamilyExperienceV208.tsx');
const css=read('src/experience-v210.css'),sw=read('public/demo-offline-sw.js');
const p=JSON.parse(read('package.json')),m=JSON.parse(read('docs/V200_RELEASE_SIGNOFF.json'));
const pass=[
 ['beta.10 is an unapproved preview',p.version==='2.0.0-beta.10'&&m.status==='NO_GO'&&m.productionClinicalAccess===false],
 ['ten independent approvals are not self-issued',m.requiredGates.length===10&&m.requiredGates.every(g=>g.status==='pending')],
 ['five primary destinations preserved',/label:'Home'/.test(source)&&/label:'Journey'/.test(source)&&/label:'Planner'/.test(source)&&/label:'Learn'/.test(source)&&/label:'Me'/.test(source)],
 ['all clinical and family navigation sections remain',/id:'records'/.test(source)&&/id:'baby'/.test(source)&&/id:'visits'/.test(source)],
 ['four sequential styles applied in order',/experience-v207\.css[\s\S]*experience-v208\.css[\s\S]*experience-v209\.css[\s\S]*experience-v210\.css/.test(main)],
 ['learning is only public and resettable',!/(?:\.from\(|localStorage|indexedDB|fetch\()/.test(learning)],
 ['new family journal is demo restricted',story.includes('!demo')&&!/(?:localStorage|indexedDB|fetch\()/.test(story)],
 ['public offline cache excludes sensitive sources',sw.includes("req.method!=='GET'")&&!/supabase\.co|indexedDB|localStorage/.test(sw)],
 ['new trust surface states NO_GO',ui.includes('NO-GO')&&!ui.includes('APPROVED FOR CLINICAL')],
 ['motion opt-out is explicit',css.includes('prefers-reduced-motion')&&css.includes('data-mm-motion')],
];
const errors=pass.filter(x=>!x[1]).map(x=>x[0]);
if(errors.length){errors.forEach(x=>console.error('EXPERIENCE_FAIL: '+x));process.exit(1);}
console.log('PASS '+pass.length+' source-level experience/privacy contracts. Physical-device signoff and clinical release remain NO_GO.');
