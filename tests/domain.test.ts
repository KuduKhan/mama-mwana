import { describe, expect, it } from 'vitest';
import { addDays, ageInMonths, daysBetween, getPhase, isValidBirthDate, postpartumDay, pregnancyStage, validateOnboarding } from '../src/lib/domain';
describe('pregnancy and newborn journey',()=>{
 it('computes the due date as 40 completed weeks',()=>{expect(pregnancyStage('2026-11-01','2026-11-01').week).toBe(40);});
 it('uses calendar dates rather than locale-specific time',()=>{expect(addDays('2026-12-31',1)).toBe('2027-01-01');expect(daysBetween('2026-10-24','2026-11-03')).toBe(10);});
 it('keeps the pregnancy stage within user-friendly bounds',()=>{const s=pregnancyStage('2027-01-01','2026-10-24');expect(s.trimester).toBe(3);expect(s.progress).toBeGreaterThan(60);});
 it('computes completed baby months',()=>{expect(ageInMonths('2026-01-26','2026-10-24')).toBe(8);expect(ageInMonths('2026-01-24','2026-10-24')).toBe(9);});
 it('transitions to postpartum then childhood',()=>{const base={id:'1',mother_name:'Amina',due_date:'2026-10-24',baby_birth_date:null,baby_name:null,visits:[],daily_checks:{},birth_checks:[],growth:[],milestones:[]};expect(getPhase(base,'2026-10-24')).toBe('pregnancy');const born={...base,baby_birth_date:'2026-10-24',baby_name:'Ali'};expect(getPhase(born,'2026-11-10')).toBe('postpartum');expect(getPhase(born,'2026-12-10')).toBe('childhood');expect(postpartumDay('2026-10-24','2026-10-25')).toBe(1);});
 it('checks due-date and birth-date windows',()=>{expect(validateOnboarding('A','2026-12-20','2026-10-24')).toBeTruthy();expect(validateOnboarding('Amina','2026-12-20','2026-10-24')).toBeNull();expect(isValidBirthDate('2026-10-24','2026-11-01','2026-10-24')).toBe(true);expect(isValidBirthDate('2026-10-26','2026-11-01','2026-10-24')).toBe(false);});
});
