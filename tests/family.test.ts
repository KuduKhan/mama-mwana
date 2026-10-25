import {describe,expect,it} from 'vitest';
import {groupFamilyRecords,nextBirthOrder,validateChildDraft,validateGrowthDraft,validateVaccineDraft} from '../src/lib/family';
import type {FamilyChild} from '../src/lib/family';
const a:FamilyChild={id:'a',journey_id:'j',owner_id:'u',birth_order:1,display_name:'First',born_on:'2025-06-01',sex:'unknown',version:1};
describe('v0.9 family record boundaries',()=>{
 it('numbers newborns distinctly',()=>expect(nextBirthOrder([a,{...a,id:'b',birth_order:2}])).toBe(3));
 it('never mixes the siblings records',()=>{
  const x=groupFamilyRecords([a,{...a,id:'b',birth_order:2}],[{child_id:'a',x:1},{child_id:'b',x:2}]);
  expect(x.a).toEqual([{child_id:'a',x:1}]);expect(x.b).toEqual([{child_id:'b',x:2}]);
 });
 it('validates accurate recorded birth dates',()=>{expect(validateChildDraft('Twin','2026-02-30','2026-03-01')).not.toBeNull();expect(validateChildDraft('Twin','2025-06-01','2025-06-17')).toBeNull();});
 it('rejects future and empty measurements',()=>{expect(validateGrowthDraft('2025-06-02','2025-06-01',null,null)).not.toBeNull();expect(validateGrowthDraft('2025-06-02','2025-06-01',3.2,52)).toBeNull();});
 it('does not accept vaccinations before birth',()=>expect(validateVaccineDraft('BCG','2025-05-02','2025-06-01')).not.toBeNull());
});
