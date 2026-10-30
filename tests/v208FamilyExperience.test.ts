import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {storybookPreview} from '../src/components/FamilyExperienceV208';
describe('beta.8 family storybook is safe and sample-limited',()=>{
 it('renders only safe generic labels and no private notes or clinic details',()=>{
  const j:any={id:'sample',visits:[{id:'visit',scheduled_on:'2026-10-31',attended:false,clinic:'SECRET CLINIC',notes:'PRIVATE NOTES'}],
   growth:[],wellbeing_entries:[],milestones:[],baby_birth_date:null,feeding_logs:[],immunizations:[]};
  const text=JSON.stringify(storybookPreview([j]));
  expect(text).not.toContain('SECRET CLINIC');expect(text).not.toContain('PRIVATE NOTES');
 });
 it('does not add a network or permanent storage path for support tasks',()=>{
  const source=readFileSync('src/components/FamilyExperienceV208.tsx','utf8');
  expect(source).not.toMatch(/\bfetch\s*\(|localStorage|sessionStorage|\.from\(/);
  expect(source).toContain('!demo');
 });
});
