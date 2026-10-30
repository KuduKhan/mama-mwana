/** Genuine encrypted synthetic backup restore, NOT hosted Supabase acceptance. */
import {randomBytes,createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {sealSyntheticBackup,openSyntheticBackup} from './disposable-backup-crypto.mjs';
const docker=(args,opt={})=>execFileSync('docker',args,{timeout:120000,maxBuffer:20000000,...opt});
const sql=(id,text)=>docker(['exec','-i',id,'psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-At'],{input:text,encoding:'utf8'}).trim();
const check=(ok,why)=>{if(!ok)throw Error('Synthetic recovery invariant failed: '+why)};
const count=(id,q)=>{const n=Number(sql(id,q));check(Number.isSafeInteger(n),'invalid count');return n};
const suffix=randomBytes(6).toString('hex');
const source='mm-rec-src-'+suffix,target='mm-rec-dst-'+suffix;
const dir=mkdtempSync(join(tmpdir(),'mm-recovery-'));
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',guest='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let plaintext,key;
async function start(id){
 docker(['run','--rm','-d','--network','none','--name',id,'-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17-alpine'],{encoding:'utf8'});
 for(let i=0;i<65;i++){
  if(spawnSync('docker',['exec',id,'pg_isready','-U','postgres','-d','postgres'],{stdio:'ignore'}).status===0)return;
  await sleep(400);
 }
 throw Error('Disposable PostgreSQL startup failed');
}
try{
 if(process.env.DATABASE_URL||process.env.MAMAMWANA_USE_HOSTED_BACKUP||process.argv.some(a=>a.startsWith('--remote')))throw Error('Remote database configuration prohibited');
 const migration=readFileSync('supabase/migrations/20261029_000012_v12_recipient_erasure_fk.sql','utf8');
 check(migration.includes('on delete cascade')&&migration.includes("tg_op='DELETE'"),'v12 source missing');
 await start(source);await start(target);
 sql(source,readFileSync('scripts/fixtures/disposable-pre-v12.sql','utf8'));
 plaintext=docker(['exec',source,'pg_dump','-Fc','-U','postgres','-d','postgres','-n','auth','-n','private','-n','public']);
 check(plaintext.length>200,'empty dump');
 const digest=createHash('sha256').update(plaintext).digest('hex');
 const sealed=sealSyntheticBackup(plaintext);key=sealed.key;
 const backupPath=join(dir,'synthetic-only-encrypted.bin');
 writeFileSync(backupPath,sealed.sealed,{mode:0o600});plaintext.fill(0);plaintext=null;
 const startRestore=Date.now();
 plaintext=openSyntheticBackup(readFileSync(backupPath),key);
 check(createHash('sha256').update(plaintext).digest('hex')===digest,'archive authentication failed');
 sql(target,'CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;');
 docker(['exec','-i',target,'pg_restore','--clean','--if-exists','--no-owner','--no-acl','-U','postgres','-d','postgres'],{input:plaintext});
 plaintext.fill(0);plaintext=null;
 const restoreDurationMs=Date.now()-startRestore;
 check(count(target,'select count(*) from auth.users;')===2,'Auth fixture not restored');
 check(count(target,'select count(*) from public.family_children;')===1,'child fixture missing');
 check(count(target,'select count(*) from public.caregiver_invitations;')===1,'recipient fixture missing');
 check(sql(target,"select relrowsecurity from pg_class where oid='public.family_children'::regclass;")==='t','RLS not restored');
 const old=spawnSync('docker',['exec','-i',target,'psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-At'],{input:"delete from auth.users where id='"+guest+"';",encoding:'utf8',timeout:15000});
 check(old.status!==0,'pre-v12 guarded recipient removal unexpectedly succeeded');
 check(count(target,'select count(*) from auth.users;')===2,'failed deletion did not roll back');
 sql(target,migration);
 check(sql(target,"select pg_get_constraintdef(oid) from pg_constraint where conname='caregiver_invitations_accepted_by_fkey';").includes('ON DELETE CASCADE'),'v12 FK not cascade');
 check(sql(target,"select proconfig[1] from pg_proc where oid='private.audit_family_write()'::regprocedure;")==='search_path=""','audit function search path');
 sql(target,"delete from auth.users where id='"+guest+"';");
 check(count(target,'select count(*) from public.caregiver_invitations;')===0,'recipient invitation not erased');
 sql(target,"delete from auth.users where id='"+owner+"';");
 check(count(target,'select count(*) from auth.users;')===0,'Auth fixture remains');
 check(count(target,'select count(*) from public.family_children;')===0,'child fixture remains');
 mkdirSync('.mamamwana-evidence',{recursive:true});
 const result={schema:'mamamwana.disposable-recovery.v1',status:'PASS',
  syntheticOnly:true,hostedBackupUsed:false,fullSupabaseRestore:false,
  independentRecoveryApproved:false,clinicalRecoveryGate:'PENDING',
  separateNetworkIsolatedInstances:true,encryption:'AES-256-GCM',archiveSHA256:digest,
  authenticatedRestore:true,restoredSyntheticAuthRows:2,rlsPreserved:true,
  preV12GuardVerified:true,actualV12SourceMigrationTested:true,
  recipientErasurePassed:true,ownerErasurePassed:true,restoreDurationMs,
  clinicalRtoRpoMeasured:false,limitations:'Synthetic reduced-schema rehearsal only. No hosted project, real patient data, complete Auth/Storage recovery or external signoff.'};
 writeFileSync('.mamamwana-evidence/disposable-recovery.json',JSON.stringify(result,null,2)+'\n',{mode:0o600});
 console.log('PASS: encrypted disposable restore and v12 synthetic erasure. Clinical release NO_GO.');
}catch(error){
 console.error('Disposable recovery failed: '+(error instanceof Error?error.message:'unknown').slice(0,220));
 process.exitCode=1;
}finally{
 if(plaintext)plaintext.fill(0);if(key)key.fill(0);
 for(const id of [source,target])spawnSync('docker',['rm','-f',id],{stdio:'ignore'});
 rmSync(dir,{recursive:true,force:true});
}
