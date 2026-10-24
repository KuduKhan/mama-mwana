import {describe,it,expect} from 'vitest';
import {canIndependentlyApprove,canRequestRight} from '../src/lib/governance';
import type {DataRightRequest} from '../src/lib/governance';
describe('v0.5 independent clinical approval',()=>{
 const article={status:'in_review',author_id:'clinician-a',source_url:'https://www.who.int/health-topics'};
 it('rejects the author approving their own submission',()=>expect(canIndependentlyApprove(article,'clinician-a')).toBe(false));
 it('allows an independent reviewer for an in-review official-source article',()=>expect(canIndependentlyApprove(article,'clinician-b')).toBe(true));
 it('rejects approved items, absent author, unknown reviewer, and unsafe source',()=>{
  expect(canIndependentlyApprove({...article,status:'approved'},'clinician-b')).toBe(false);
  expect(canIndependentlyApprove({...article,author_id:null},'clinician-b')).toBe(false);
  expect(canIndependentlyApprove(article,null)).toBe(false);
  expect(canIndependentlyApprove({...article,source_url:'https://who.int.evil.example'},'clinician-b')).toBe(false);
 });
});
describe('v0.5 accountable data rights',()=>{
 const request:DataRightRequest={id:'r',request_type:'erasure',status:'received',requested_at:'2026-10-24T00:00:00Z',resolved_at:null};
 it('prevents a second open request of the same kind',()=>{
  expect(canRequestRight('erasure',[request])).toBe(false);
  expect(canRequestRight('access',[request])).toBe(true);
  expect(canRequestRight('erasure',[{...request,status:'in_review'}])).toBe(false);
 });
 it('allows a new request after a previous one is resolved or declined',()=>{
  expect(canRequestRight('erasure',[{...request,status:'resolved'}])).toBe(true);
  expect(canRequestRight('erasure',[{...request,status:'declined'}])).toBe(true);
 });
});
