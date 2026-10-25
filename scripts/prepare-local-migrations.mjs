/**
 * Create an isolated local-only Supabase workdir with CLI-standard 14-digit
 * timestamps. Existing tracked migrations and remote migration history are
 * never modified. Run from the MamaMwana repository root.
 */
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';

const input=resolve('supabase/migrations');
const output=resolve('.mamamwana-local/supabase/migrations');
const originals=readdirSync(input)
 .filter(file=>/^\d{8}_\d{6}_[a-z0-9_]+\.sql$/.test(file)).sort();
if(originals.length<11)throw new Error('Expected all eleven original MamaMwana migration source files.');
mkdirSync(output,{recursive:true});
const targetNames=[];
for(const original of originals){
 const match=/^(\d{8})_(\d{6})_([a-z0-9_]+\.sql)$/.exec(original);
 if(!match)throw new Error('Unrecognized historical migration: '+original);
 const target=match[1]+match[2]+'_mamamwana_local_'+match[3];
 const body=readFileSync(join(input,original));
 const targetPath=join(output,target);
 if(existsSync(targetPath)&&!readFileSync(targetPath).equals(body)){
  throw new Error('Local fixture source differs; clear only the generated .mamamwana-local directory after review.');
 }
 if(!existsSync(targetPath))writeFileSync(targetPath,body);
 targetNames.push(target);
}
const unique=new Set(targetNames.map(x=>x.slice(0,14)));
if(unique.size!==targetNames.length)throw new Error('Duplicate generated 14-digit migration timestamp.');
console.log('Prepared '+targetNames.length+' isolated local Supabase migrations.');
console.log('Hosted Supabase and tracked migration source files remain unchanged.');
