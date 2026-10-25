import {describe,it,expect} from 'vitest';
import {buildPrivateVisitBrief,orderCareItems,validateCareDraft} from '../src/lib/carePlanner';
import type {CareItem,CareDraft} from '../src/lib/carePlanner';
const visit={id:'v1',scheduled_on:'2026-11-02',clinic:'Family clinic',notes:'',attended:false};
const draft:CareDraft={kind:'question',title:'My first question',detail:'Please discuss with the clinician',due_on:null,visit_source_id:'v1'};
const item=(overrides:Partial<CareItem>={}):CareItem=>({
 id:'one',journey_id:'journey',owner_id:'owner',kind:'question',title:'What should I ask?',detail:'',
 state:'open',due_on:'2026-11-01',visit_source_id:'v1',version:1,created_at:'2026-10-24T12:00:00Z',updated_at:'2026-10-24T12:00:00Z',...overrides
});
describe('care planner data controls',()=>{
 it('rejects invalid clinic reference, oversized note, and short title',()=>{
  expect(validateCareDraft(draft,[visit])).toBeNull();
  expect(validateCareDraft({...draft,visit_source_id:'unknown'},[visit])).toMatch(/appointment/);
  expect(validateCareDraft({...draft,detail:'a'.repeat(1201)},[visit])).toMatch(/1200/);
  expect(validateCareDraft({...draft,title:'a'},[visit])).toMatch(/title/);
 });
 it('sorts open first and due dates before undated items',()=>{
  const result=orderCareItems([item({id:'late',due_on:null}),item({id:'done',state:'done'}),item({id:'first',due_on:'2026-10-26'})]);
  expect(result.map(x=>x.id)).toEqual(['first','late','done']);
 });
 it('limits visit brief to open items associated with selected visit or general',()=>{
  const rows=[
   item({id:'a',title:'Relevant question',visit_source_id:'v1'}),
   item({id:'b',title:'For another clinic',visit_source_id:'v2'}),
   item({id:'c',title:'Resolved question',state:'done'}),
   item({id:'d',title:'General preparation',kind:'preparation',visit_source_id:null})
  ];
  const text=buildPrivateVisitBrief({baby_birth_date:null,visits:[visit]},rows,'v1','2026-10-25');
  expect(text).toContain('Relevant question');
  expect(text).toContain('General preparation');
  expect(text).not.toContain('For another clinic');
  expect(text).not.toContain('Resolved question');
  expect(text).toContain('caregiver-written');
 });
 it('flattens newlines from entered notes to keep exported text structured',()=>{
  const text=buildPrivateVisitBrief({baby_birth_date:null,visits:[]},[item({detail:'line one\nline two',visit_source_id:null})],null,'2026-10-25');
  expect(text).toContain('line one line two');
 });
});
