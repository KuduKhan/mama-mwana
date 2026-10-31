import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {accessDenied,verifyAccountOnly} from './verify-account-only-live.mjs';
describe('hosted account-only access test fail-closed semantics',()=>{
 it('accepts only explicit permission-denied or unavailable RPC responses',()=>{
  assert.equal(accessDenied({code:'42501'},403),true);
  assert.equal(accessDenied({code:'PGRST202'},404),true);
  assert.equal(accessDenied({code:'PGRST301'},401),true);
  assert.equal(accessDenied(null,200),false);
  assert.equal(accessDenied({code:'PGRST116'},406),false);
  assert.equal(accessDenied({message:'No rows'},200),false);
  assert.equal(accessDenied({message:'Unknown'},500),false);
 });
 it('never attempts login without a separately configured synthetic verified account',async()=>{
  await assert.rejects(verifyAccountOnly({url:'',key:'',email:'',password:''}),/synthetic account/i);
 });
});
