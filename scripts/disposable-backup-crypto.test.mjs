import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {randomBytes} from 'node:crypto';
import {sealSyntheticBackup,openSyntheticBackup} from './disposable-backup-crypto.mjs';
test('AES-GCM restores authentic synthetic bytes',()=>{
 const data=randomBytes(128),{sealed,key}=sealSyntheticBackup(data);
 assert.deepEqual(openSyntheticBackup(sealed,key),data);key.fill(0);
});
test('tampering or wrong keys reject archive',()=>{
 const {sealed,key}=sealSyntheticBackup(Buffer.from('synthetic'));
 assert.throws(()=>openSyntheticBackup(sealed,randomBytes(32)));
 sealed[sealed.length-1]^=1;assert.throws(()=>openSyntheticBackup(sealed,key));
 assert.throws(()=>openSyntheticBackup(sealed.subarray(0,10),key));key.fill(0);
});
