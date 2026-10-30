import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {assessV200Acceptance} from './v200-acceptance-core.mjs';
if(process.argv.some(x=>['--approve','--enable','--go','--release'].includes(x))){
 console.error('NO_GO: acceptance evidence cannot authorize clinical release.');process.exit(1);
}
try{
 const m=JSON.parse(readFileSync('docs/V200_RELEASE_SIGNOFF.json','utf8'));
 const x=JSON.parse(readFileSync('docs/V200_ACCEPTANCE_MATRIX.json','utf8'));
 const commit=process.env.GITHUB_REPOSITORY==='KuduKhan/mama-mwana'?process.env.GITHUB_SHA:null;
 const runUrl=process.env.GITHUB_REPOSITORY==='KuduKhan/mama-mwana'&&/^\d+$/.test(process.env.GITHUB_RUN_ID??'')
  ?'https://github.com/KuduKhan/mama-mwana/actions/runs/'+process.env.GITHUB_RUN_ID:null;
 const packet=assessV200Acceptance(m,x,{commit,runUrl});
 mkdirSync('.mamamwana-evidence',{recursive:true});
 writeFileSync('.mamamwana-evidence/v200-acceptance-readiness.json',JSON.stringify(packet,null,2)+'\n',{mode:0o600});
 console.log('NO_GO: '+packet.gatesPending+'/'+packet.gatesTotal+' gates lack independent evidence.');
 console.log('Sanitized technical packet created. No signatures, patient data, approval or clinical access generated.');
}catch(error){console.error('Acceptance packet invalid: '+String(error?.message??error));process.exit(1);}
