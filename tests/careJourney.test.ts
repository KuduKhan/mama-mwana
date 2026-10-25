import {describe,it,expect} from 'vitest';
import type {Journey} from '../src/lib/domain';
import {buildCareEvents,buildVisitBrief} from '../src/lib/careJourney';

const source:Journey={
 id:'journey-1',mother_name:'Amina Test',due_date:'2026-11-30',baby_birth_date:'2026-10-12',baby_name:'Child Test',
 visits:[
  {id:'v3',scheduled_on:'2026-11-05',clinic:'Community Clinic',notes:'Question to ask',attended:false},
  {id:'v1',scheduled_on:'2026-10-10',clinic:'County Clinic',notes:'Past date unconfirmed',attended:false},
  {id:'v2',scheduled_on:'2026-10-12',clinic:'Hospital One',notes:'Routine check',attended:true}
 ],
 daily_checks:{},birth_checks:[],growth:[
  {id:'g1',measured_on:'2026-10-20',weight_kg:3.65,length_cm:null},
  {id:'g2',measured_on:'2026-10-22',weight_kg:null,length_cm:51}
 ],milestones:[],
 feeding_logs:[{id:'f1',recorded_at:'2026-10-23T10:11:00+03:00',method:'breast'}],
 wellbeing_entries:[{id:'w1',recorded_on:'2026-10-21',feeling:'okay',note:'Personal feeling — should not be auto-shared'}],
 immunizations:[{id:'i1',dose_id:'vaccine-entry-01',given_on:'2026-10-19',facility:'Community Clinic',note:'User entry'}]
};

describe('read-only care journey projection',()=>{
 it('sorts recorded events newest first without losing the source',()=>{
  const input=JSON.parse(JSON.stringify(source));
  const events=buildCareEvents(source,'2026-10-25');
  expect(events).toHaveLength(9);
  expect(events[0].day).toBe('2026-11-05');
  expect(events.at(-1)?.day).toBe('2026-10-10');
  expect(events.find(x=>x.id==='birth:journey-1')?.title).toBe('Baby arrival recorded');
  expect(events.filter(x=>x.kind==='baby')).toHaveLength(5);
  expect(source).toEqual(input);
 });
 it('distinguishes planned, attended and unconfirmed past appointments',()=>{
  const events=buildCareEvents(source,'2026-10-25');
  expect(events.find(x=>x.id==='visit:v3')?.status).toBe('planned');
  expect(events.find(x=>x.id==='visit:v2')?.status).toBe('recorded');
  expect(events.find(x=>x.id==='visit:v1')?.status).toBe('confirm');
  expect(events.find(x=>x.id==='visit:v1')?.title).not.toContain('Missed');
 });
 it('safely ignores invalid date entries without fabricating health interpretations',()=>{
  const broken:Journey={...source,visits:[...source.visits,{id:'bad',scheduled_on:'invalid',clinic:'Invalid',notes:'',attended:false}]};
  const events=buildCareEvents(broken,'2026-10-25');
  expect(events.some(e=>e.id==='visit:bad')).toBe(false);
  expect(events.find(e=>e.id==='growth:g1')?.detail).toBe('3.65 kg');
  expect(events.find(e=>e.id==='growth:g2')?.detail).toBe('51 cm');
  expect(events.find(e=>e.id==='immunization:i1')?.source).toContain('not a verified');
 });
 it('builds an intentionally incomplete appointment excerpt without wellbeing notes',()=>{
  const excerpt=buildVisitBrief(source,'2026-10-25');
  expect(excerpt).toContain('Amina Test');
  expect(excerpt).toContain('Community Clinic');
  expect(excerpt).toContain('3.65 kg');
  expect(excerpt).toContain('may be incomplete');
  expect(excerpt).not.toContain('Personal feeling');
  expect(excerpt).not.toContain('Past date unconfirmed');
  expect(excerpt).not.toContain('vaccine-entry-01');
  expect(excerpt).not.toContain('Question to ask');
 });
 it('does not conflate separate owner journeys',()=>{
  const other:Journey={...source,id:'journey-2',mother_name:'Different User',visits:[],growth:[],immunizations:[],wellbeing_entries:[],feeding_logs:[],baby_name:null,baby_birth_date:null};
  expect(buildCareEvents(other)).toHaveLength(0);
  const brief=buildVisitBrief(other,'2026-10-25');
  expect(brief).toContain('Different User');
  expect(brief).not.toContain('Amina Test');
  expect(brief).not.toContain('Community Clinic');
 });
});
