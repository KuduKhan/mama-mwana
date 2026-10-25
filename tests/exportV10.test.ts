import {describe,expect,it} from 'vitest';
import {buildCompleteExport,emptyPrivateExportRows} from '../src/lib/privateExport';
import {makeJourney} from '../src/lib/domain';
describe('v1.0 comprehensive private records',()=>{
 it('preserves multiple distinct children and care planning entries',()=>{
  const extras=emptyPrivateExportRows();
  extras.family_children=[{id:'one'},{id:'two'}];
  extras.family_growth_entries=[{child_id:'two',weight_kg:3.2}];
  extras.care_plan_items=[{id:'question'}];
  const result=buildCompleteExport([makeJourney('Parent','2026-12-01')],{in_app_reminders:true,guidance_context:false},extras);
  expect(result.child_profiles).toHaveLength(2);
  expect(result.child_growth).toEqual([{child_id:'two',weight_kg:3.2}]);
  expect(result.care_planner).toHaveLength(1);
  expect(result.schema).toBe('v1.0-rc');
 });
 it('does not mutate source visit arrays',()=>{
  const j=makeJourney('Parent','2026-12-01');
  j.visits.push({id:'visit',scheduled_on:'2026-10-25',clinic:'sample',notes:'',attended:false});
  const out=buildCompleteExport([j],{in_app_reminders:true,guidance_context:false},emptyPrivateExportRows());
  out.journeys[0].visits.pop();expect(j.visits).toHaveLength(1);
 });
});
