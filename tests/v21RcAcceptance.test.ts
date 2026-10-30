import {describe,it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import {CONNECTED_CARE_SERVICES,requireConnectedCareAuthorization} from '../src/lib/connectedServicesV21';
import {V21_BACKEND_CONTRACTS,getCareServiceContract,invokeConnectedCare} from '../src/lib/connectedCareContractsV21';
import {readFileSync} from 'node:fs';
describe('RC.1 and v2.1 clinical no-go',()=>{
 it('requires all 10 independent gates and rejects CLI activation',()=>{
  const normal=spawnSync(process.execPath,['scripts/check-rc1-acceptance.mjs'],{encoding:'utf8'});
  expect(normal.status,normal.stderr).toBe(0);
  const forbidden=spawnSync(process.execPath,['scripts/check-rc1-acceptance.mjs','--require-clinical-go'],{encoding:'utf8'});
  expect(forbidden.status).toBe(1);expect(forbidden.stderr).toContain('MM_RC1_CLINICAL_NO_GO');
 });
 it('locks all five backend contracts with explicit grant and external review requirements',()=>{
  expect(CONNECTED_CARE_SERVICES).toHaveLength(5);
  for(const service of CONNECTED_CARE_SERVICES){
   const contract=getCareServiceContract(service.id);
   expect(contract.state).toBe('LOCKED');expect(contract.backendRequired).toBe(true);
   expect(contract.authorization.length).toBeGreaterThan(1);
   expect(contract.independentEvidence.length).toBeGreaterThan(0);
  }
  expect(Object.keys(V21_BACKEND_CONTRACTS)).toHaveLength(5);
  expect(()=>requireConnectedCareAuthorization({approved:true})).toThrow('MM_V21_CLINICAL_NO_GO');
  expect(()=>invokeConnectedCare()).toThrow('MM_V21_CLINICAL_NO_GO');
 });
 it('has no client API, live patient data paths, administrative credentials or force-enable flags',()=>{
  const contracts=readFileSync('src/lib/connectedCareContractsV21.ts','utf8');
  expect(contracts).not.toMatch(/\bfetch\s*\(|createClient\(|service_role|authorization\s*:\s*true|VITE_AUTH_ACCESS_ENABLED/);
 });
});
