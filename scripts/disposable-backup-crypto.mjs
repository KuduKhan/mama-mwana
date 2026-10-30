import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
const AAD=Buffer.from('MamaMwana disposable synthetic recovery v1');
export function sealSyntheticBackup(input){
 if(!Buffer.isBuffer(input)||input.length===0)throw Error('Nonempty synthetic dump required');
 const key=randomBytes(32),nonce=randomBytes(12);
 const cipher=createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(AAD);
 const encrypted=Buffer.concat([cipher.update(input),cipher.final()]);
 return {key,sealed:Buffer.concat([nonce,cipher.getAuthTag(),encrypted])};
}
export function openSyntheticBackup(sealed,key){
 if(!Buffer.isBuffer(sealed)||sealed.length<29||!Buffer.isBuffer(key)||key.length!==32)throw Error('Invalid synthetic backup envelope');
 const decipher=createDecipheriv('aes-256-gcm',key,sealed.subarray(0,12));
 decipher.setAAD(AAD);decipher.setAuthTag(sealed.subarray(12,28));
 return Buffer.concat([decipher.update(sealed.subarray(28)),decipher.final()]);
}
