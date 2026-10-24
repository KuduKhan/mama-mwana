import { describe,it,expect } from 'vitest';
import { dateAtMonths, referenceDate, referenceStage, validateImmunization, growthTrend, recordImmunization, referenceForSex, KENYA_IMMUNIZATIONS } from '../src/lib/childHealth';
import type { Growth, ImmunizationRecord } from '../src/lib/domain';
const given:ImmunizationRecord={id:'a',dose_id:'bcg',given_on:'2026-10-20',facility:'Clinic',note:''};
describe('v0.3 child health references and records',()=>{
 it('handles month-end dates including leap years',()=>{
  expect(dateAtMonths('2026-01-31',1)).toBe('2026-02-28');
  expect(dateAtMonths('2024-01-31',1)).toBe('2024-02-29');
  expect(dateAtMonths('2026-12-31',2)).toBe('2027-02-28');
 });
 it('exposes Kenya baseline ages as informational references',()=>{
  expect(referenceDate('2026-10-24',KENYA_IMMUNIZATIONS.find(d=>d.id==='bcg')!)).toBe('2026-10-24');
  expect(referenceDate('2026-10-24',KENYA_IMMUNIZATIONS.find(d=>d.id==='penta1')!)).toBe('2026-12-05');
  expect(referenceDate('2026-10-24',KENYA_IMMUNIZATIONS.find(d=>d.id==='mr1')!)).toBe('2027-07-24');
 });
 it('does not assume missed or late doses have been given',()=>{
  expect(referenceStage('2026-10-01',KENYA_IMMUNIZATIONS[0],[],'2026-10-24')).toBe('ask-clinic');
  expect(referenceStage('2026-10-01',KENYA_IMMUNIZATIONS[0],[given],'2026-10-24')).toBe('recorded');
 });
 it('requires a credible administration date and guards facility length',()=>{
  expect(validateImmunization('2026-10-20','2026-10-21','clinic','2026-10-24')).toBeTruthy();
  expect(validateImmunization('2026-10-25','2026-10-21','clinic','2026-10-24')).toBeTruthy();
  expect(validateImmunization('2026-10-22','2026-10-21','clinic','2026-10-24')).toBeNull();
 });
 it('replaces a dose record without duplicates',()=>{
  expect(recordImmunization([given],{...given,id:'b',given_on:'2026-10-21'})).toEqual([{...given,id:'b',given_on:'2026-10-21'}]);
 });
 it('plots only numeric, dated, nonnegative age measurements',()=>{
  const a:Growth[]=[{id:'1',measured_on:'2026-10-25',weight_kg:3.4,length_cm:51},{id:'2',measured_on:'2026-10-23',weight_kg:2.9,length_cm:49},{id:'3',measured_on:'2026-11-01',weight_kg:null,length_cm:53}];
  expect(growthTrend(a,'2026-10-24','weight')).toEqual([{x:1,y:3.4,date:'2026-10-25'}]);
  expect(growthTrend(a,'2026-10-24','length')).toHaveLength(2);
 });
 it('does not choose sex-specific WHO reference without known sex',()=>{
  expect(referenceForSex('unknown')).toBeNull();expect(referenceForSex('male')?.weight).toContain('boys');
 });
});
