import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';

// Enforce the main entry budget rather than counting all lazy-loaded chunks as startup JS.
const base=resolve('dist');
const html=readFileSync(resolve(base,'index.html'),'utf8');
const match=html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/);
if(!match)throw new Error('Built entry script was not found in dist/index.html');
const entry=resolve(base,match[1].replace(/^\//,''));
const bytes=statSync(entry).size;
const max=500*1024;
console.log('MamaMwana main entry:',(bytes/1024).toFixed(1),'KiB (budget: 500 KiB)');
if(bytes>max)throw new Error('Initial JavaScript exceeds the release budget; preserve route-level code splitting.');
