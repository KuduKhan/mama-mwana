import {describe,it,expect} from 'vitest';
import {PUBLIC_LEARNING_KEY,readPublicAnswers,sanitizePublicAnswers,storePublicAnswers} from '../src/lib/publicLearningProgress';
describe('device-only public education progress',()=>{
 it('rejects unrecognized fields, malformed values, personal notes and out-of-range answers',()=>{
  expect(sanitizePublicAnswers({questions:0,privacy:2,support:-1,source:400,notes:'medical details',userId:'unwanted',__proto__:{admin:true}})).toEqual({questions:0,privacy:2});
  expect(sanitizePublicAnswers(['questions'])).toEqual({});
  expect(sanitizePublicAnswers(null)).toEqual({});
 });
 it('round trips only safe quiz answer indices and supports clearing',()=>{
  const map=new Map<string,string>();
  const storage={
   getItem:(k:string)=>map.get(k)??null,
   setItem:(k:string,v:string)=>{map.set(k,v);},
   removeItem:(k:string)=>{map.delete(k);}
  };
  storePublicAnswers(storage,{questions:0,privacy:1,secret:'not allowed'} as Record<string,number>);
  expect(JSON.parse(map.get(PUBLIC_LEARNING_KEY)??'{}')).toEqual({questions:0,privacy:1});
  expect(readPublicAnswers(storage)).toEqual({questions:0,privacy:1});
  storePublicAnswers(storage,{});
  expect(map.has(PUBLIC_LEARNING_KEY)).toBe(false);
 });
 it('does not crash when storage is corrupt or blocked',()=>{
  expect(readPublicAnswers({getItem:()=>'{'})).toEqual({});
  expect(readPublicAnswers({getItem:()=>{throw Error('blocked')}})).toEqual({});
  expect(()=>storePublicAnswers({setItem:()=>{throw Error('blocked')},removeItem:()=>{}},{questions:0})).not.toThrow();
 });
});
