import {describe,expect,it} from 'vitest';
import {editJourneyClinical,hydrateCanonicalJourneys,isClinicalConflict,nonClinicalJourneyPayload} from '../src/lib/clinical';
import {makeJourney} from '../src/lib/domain';

describe('v0.6 canonical clinical record transformations',()=>{
 const journey=makeJourney('Maya','2027-01-25');
 it('takes canonical rows rather than stale legacy JSONB snapshots',()=>{
  const stale={...journey,visits:[{id:'legacy',scheduled_on:'2026-11-01',clinic:'Old',notes:'',attended:false}]};
  const hydrated=hydrateCanonicalJourneys([stale],[],[],[]);
  expect(hydrated[0].visits).toEqual([]);
 });
 it('keeps version numbers and maps authoritatively returned records',()=>{
  const hydrated=hydrateCanonicalJourneys([journey],[{journey_id:journey.id,source_id:'a',version:7,scheduled_on:'2026-11-01',clinic:'Clinic',notes:'',attended:false}],[],[]);
  expect(hydrated[0].visits[0]).toMatchObject({id:'a',version:7,clinic:'Clinic'});
 });
 it('does not send clinical arrays back during a general journey save',()=>{
  const payload=nonClinicalJourneyPayload({...journey,visits:[{id:'v',scheduled_on:'2026-10-01',clinic:'A',notes:'',attended:false}]},'owner');
  expect(payload).not.toHaveProperty('visits');
  expect(payload).not.toHaveProperty('growth');
  expect(payload).not.toHaveProperty('immunizations');
  expect(payload.owner_id).toBe('owner');
 });
 it('replaces an edited record without duplicates and keeps its version',()=>{
  const visit={id:'v',version:2,scheduled_on:'2026-11-11',clinic:'Clinic',notes:'',attended:false};
  const first=editJourneyClinical(journey,'visit',visit);
  expect(editJourneyClinical(first,'visit',{...visit,version:3,attended:true}).visits).toHaveLength(1);
  expect(editJourneyClinical(first,'visit',visit,true).visits).toHaveLength(0);
 });
 it('identifies optimistic-lock conflicts by stable error prefix',()=>{
  expect(isClinicalConflict(new Error('MM_CONFLICT: record changed'))).toBe(true);
  expect(isClinicalConflict(new Error('connection timeout'))).toBe(false);
 });
});
