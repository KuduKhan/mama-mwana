/**
 * Automated CI technical evidence only. No PHI, secrets or actual signoffs.
 * Corroborate this metadata with a completed GitHub Actions run and reviewed SHA.
 */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const scope=process.argv[2];
const scopes={
 build:'CI TypeScript, unit, client/SQL security, production build and bundle checks ran before this step.',
 'local-isolation':'Local GoTrue two-account suite and mandatory synthetic fixture cleanup ran before this step.'
};
if(!Object.hasOwn(scopes,scope)){
 console.error('Expected build or local-isolation evidence scope.');
 process.exit(2);
}
const repo=process.env.GITHUB_REPOSITORY||'';
const sha=process.env.GITHUB_SHA||'';
const runId=process.env.GITHUB_RUN_ID||'';
if(process.env.GITHUB_ACTIONS!=='true'||repo!=='KuduKhan/mama-mwana'||!/^[0-9a-f]{40}$/i.test(sha)||!/^[1-9]\d*$/.test(runId)){
 console.error('Technical evidence may be emitted only in a scoped GitHub Actions run.');
 process.exit(1);
}
const manifest=readFileSync(resolve('docs/V200_RELEASE_SIGNOFF.json'));
const parsed=JSON.parse(manifest.toString('utf8'));
if(parsed.status!=='NO_GO'||parsed.productionClinicalAccess!==false)throw new Error('Clinical release NO-GO invariant violated');
const record={
 schemaVersion:1,kind:'automated-technical-evidence',subject:'MamaMwana v2 clinical acceptance hardening',
 scope,outcome:'workflow-step-reached',workflowPrerequisite:scopes[scope],
 repository:repo,commit:sha,
 workflowRunUrl:'https://github.com/'+repo+'/actions/runs/'+runId,
 capturedAt:new Date().toISOString(),
 releaseManifestSha256:createHash('sha256').update(manifest).digest('hex'),
 syntheticOnly:true,patientDataUsed:false,
 independentlyReviewed:false,clinicalReleaseApproved:false,manualSignoffsProvided:false,
 limitations:'Evidence metadata only. Verify actual GitHub job results. Not a pentest, hosted restore, physical-device acceptance, production isolation, clinical or legal approval.'
};
const dir=resolve('.mamamwana-evidence');
mkdirSync(dir,{recursive:true});
writeFileSync(join(dir,scope+'.json'),JSON.stringify(record,null,2)+'\n',{mode:0o600});
console.log('Created sanitized '+scope+' CI metadata for '+sha.slice(0,12)+'; clinical NO-GO remains.');
