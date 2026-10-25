import {describe,it,expect} from 'vitest';
import {findLegacyAssignment,legacyEntries} from '../src/lib/legacyAttribution';
describe('original record provenance',()=>{
 it('does not clone clinical observations into another child',()=>{
  const source={growth:[{id:'g',measured_on:'2026-10-20',weight_kg:3.4,length_cm:52}],immunizations:[{id:'i',dose_id:'BCG',given_on:'2026-10-20',facility:'',note:''}]};
  const list=legacyEntries(source);
  expect(list.map(x=>x.sourceId)).toEqual(['g','i']);
  expect(source.growth).toHaveLength(1);
 });
 it('requires an explicit attribution record',()=>{
  expect(findLegacyAssignment([],'growth','g')).toBeUndefined();
  const assignment={journey_id:'j',owner_id:'u',kind:'growth' as const,source_id:'g',child_id:'c',confirmed_by:'u',confirmed_at:'',version:1};
  expect(findLegacyAssignment([assignment],'growth','g')?.child_id).toBe('c');
  expect(findLegacyAssignment([assignment],'immunization','g')).toBeUndefined();
 });
});
