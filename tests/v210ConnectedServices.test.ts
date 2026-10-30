import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {CONNECTED_CARE_SERVICES,connectedCarePreview,requireConnectedCareAuthorization} from '../src/lib/connectedServicesV21';
describe('v2.1 connected care is post-approval only',()=>{
 it('names five concrete future services without activating any',()=>{
  expect(CONNECTED_CARE_SERVICES).toHaveLength(5);
  expect(CONNECTED_CARE_SERVICES.every(s=>s.status==='LOCKED')).toBe(true);
  expect(connectedCarePreview('interop').requirements.join(' ')).toMatch(/DHA/);
 });
 it('rejects fake roles, tokens, user metadata and feature flags',()=>{
  for(const candidate of [undefined,true,{role:'clinician',verified:true},{production:true,approved:true,certified:true},{VITE_AUTH_ACCESS_ENABLED:'true'}])
   expect(()=>requireConnectedCareAuthorization(candidate)).toThrow('MM_V21_CLINICAL_NO_GO');
 });
 it('never imports privileged API, clinical calculation or patient-export code',()=>{
  const v=readFileSync('src/lib/connectedServicesV21.ts','utf8');
  const ui=readFileSync('src/components/ConnectedServicesReadinessV21.tsx','utf8');
  for(const source of [v,ui]){
   expect(source).not.toMatch(/from ['"]@supabase/);
   expect(source).not.toMatch(/\bfetch\s*\(/);
   expect(source).not.toContain('service_role');
  }
  expect(ui).toContain('NOT AUTHORIZED');
 });
});
