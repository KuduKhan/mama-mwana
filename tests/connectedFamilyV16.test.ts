import {describe,it,expect} from 'vitest';
import {buildVisitNotices} from '../src/lib/notificationCenter';
import {caregiverAccessStatus} from '../src/lib/caregiverPermissionView';
import {EDUCATION_REVIEW_REGISTER,isBilingualClinicallyReviewed} from '../src/lib/educationGovernance';
import type {Visit} from '../src/lib/domain';
const visits:Visit[]=[
 {id:'past',scheduled_on:'2026-10-28',clinic:'Sample clinic',notes:'PRIVATE DO NOT EXPORT',attended:false},
 {id:'today',scheduled_on:'2026-10-30',clinic:'Sample clinic',notes:'PRIVATE DO NOT EXPORT',attended:false},
 {id:'soon',scheduled_on:'2026-11-04',clinic:'Sample clinic',notes:'PRIVATE DO NOT EXPORT',attended:false},
 {id:'far',scheduled_on:'2026-11-20',clinic:'Sample clinic',notes:'PRIVATE DO NOT EXPORT',attended:false},
 {id:'done',scheduled_on:'2026-10-29',clinic:'Sample clinic',notes:'PRIVATE DO NOT EXPORT',attended:true}
];
describe('v1.6.0 connected-family safety contracts',()=>{
 it('creates only ephemeral in-app journal notices and respects consent',()=>{
  expect(buildVisitNotices(visits,false,'2026-10-30')).toEqual([]);
  const notes=buildVisitNotices(visits,true,'2026-10-30');
  expect(notes.map(n=>n.kind)).toEqual(['overdue','today','upcoming']);
  expect(JSON.stringify(notes)).not.toContain('PRIVATE');
  expect(JSON.stringify(notes)).not.toContain('Sample clinic');
  expect(notes.every(n=>n.route==='visits')).toBe(true);
 });
 it('renders expired invitations as expired independent of UI status',()=>{
  const now=new Date('2026-10-30T00:00:00Z');
  expect(caregiverAccessStatus({status:'pending',expires_at:'2026-10-29T00:00:00Z',shared_until:null},now)).toBe('expired');
  expect(caregiverAccessStatus({status:'accepted',expires_at:'2026-10-20T00:00:00Z',shared_until:'2026-11-10T00:00:00Z'},now)).toBe('active');
  expect(caregiverAccessStatus({status:'accepted',expires_at:'2026-10-20T00:00:00Z',shared_until:'2026-10-29T00:00:00Z'},now)).toBe('expired');
  expect(caregiverAccessStatus({status:'revoked',expires_at:'2026-11-01T00:00:00Z',shared_until:null},now)).toBe('revoked');
 });
 it('never represents unapproved clinical translations as reviewed',()=>{
  expect(EDUCATION_REVIEW_REGISTER).toHaveLength(3);
  expect(EDUCATION_REVIEW_REGISTER.every(x=>x.sourceUrl.startsWith('https://www.who.int/'))).toBe(true);
  expect(EDUCATION_REVIEW_REGISTER.every(x=>!isBilingualClinicallyReviewed(x))).toBe(true);
 });
});
