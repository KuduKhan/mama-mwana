import {describe,it,expect} from 'vitest';
import {nextJournalAction} from '../src/lib/journeyIntelligence';
import {MOBILE_NAV,NAV,primaryForTab} from '../src/ui/navigation';
describe('beta.7 five-destination navigation and next step',()=>{
 it('groups thirteen existing routes into five accessible spaces',()=>{
  expect(MOBILE_NAV.map(i=>i.label)).toEqual(['Home','Journey','Planner','Learn','Me']);
  expect(NAV).toHaveLength(13);
  for(const route of NAV)expect(MOBILE_NAV.map(i=>i.id)).toContain(primaryForTab(route.id));
 });
 it('does not interpret clinical entries or modify source order',()=>{
  const visits=[{id:'later',scheduled_on:'2026-11-09',attended:false,clinic:'',notes:''},{id:'early',scheduled_on:'2026-11-03',attended:false,clinic:'',notes:''}];
  expect(nextJournalAction({visits},1,3,'2026-11-01').kind).toBe('checklist');
  expect(nextJournalAction({visits},3,3,'2026-11-01')).toEqual({target:'visits',kind:'visit',date:'2026-11-03'});
  expect(nextJournalAction({visits},3,3,'2026-11-25').kind).toBe('plan');
  expect(visits[0].id).toBe('later');
 });
});
