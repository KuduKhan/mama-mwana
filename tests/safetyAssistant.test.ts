import {describe,it,expect} from 'vitest';
import {getGuidance,isApprovedSource} from '../src/lib/safetyAssistant';
describe('v0.4 constrained guidance',()=>{
 it('escalates urgent signs without giving a reassuring diagnosis',()=>{
  for(const q of ['I have severe headache','my baby has fever','I am bleeding','I have chest pain','no fetal movement','I want to harm myself']){
   const response=getGuidance(q,'pregnancy');expect(response.kind).toBe('urgent');expect(response.answer).toContain('immediate');
  }
 });
 it('refuses symptom diagnosis, medication and laboratory interpretation',()=>{
  for(const q of ['which antibiotic dose','interpret my lab result','my ultrasound result','can you prescribe medicine']){
   expect(getGuidance(q).kind).toBe('boundary');
  }
 });
 it('returns only source-linked general information on known topics',()=>{
  const r=getGuidance('What can I eat in pregnancy?','pregnancy');
  expect(r.kind).toBe('education');expect(r.sourceUrl).toContain('who.int');
 });
 it('does not invent guidance for arbitrary symptoms',()=>expect(getGuidance('My leg feels weird').kind).toBe('boundary'));
 it('only permits official HTTPS source hosts without suffix lookalikes',()=>{
  expect(isApprovedSource('https://www.who.int/some-topic')).toBe(true);
  expect(isApprovedSource('http://who.int')).toBe(false);
  expect(isApprovedSource('https://who.int.evil.example')).toBe(false);
  expect(isApprovedSource('javascript:alert(1)')).toBe(false);
 });
});
