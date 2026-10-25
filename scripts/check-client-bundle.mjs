import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
const forbidden=[
 {pattern:/\bSUPABASE_SERVICE_ROLE_KEY\b/,label:'Supabase administrative key'},
 {pattern:/\bSUPABASE_SECRET_KEY\b/,label:'Supabase secret key'},
 {pattern:/\bservice_role\b/,label:'Supabase service role'},
 {pattern:/\bVITE_[A-Z_]*(SERVICE|SECRET|PRIVATE)[A-Z_]*\b/,label:'Browser-exposed secret configuration'}
];
function sourceFiles(root){
 return readdirSync(root,{withFileTypes:true}).flatMap(e=>{
  const path=join(root,e.name);
  return e.isDirectory()?sourceFiles(path):/\.(ts|tsx)$/.test(e.name)?[path]:[];
 });
}
let bad=0;
for(const path of sourceFiles('src')){
 const contents=readFileSync(path,'utf8');
 for(const {pattern,label} of forbidden){
  if(pattern.test(contents)){
   console.error('Unsafe browser source: '+relative('.',path)+' contains '+label);
   bad++;
  }
 }
}
if(bad)process.exit(1);
console.log('Browser source security gate: no administrative credential references.');
