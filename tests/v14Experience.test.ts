import {describe,it,expect} from 'vitest';
import {normalizeDisplay,readDisplay,DISPLAY_KEY,DEFAULT_DISPLAY} from '../src/lib/a11yPreferences';
import {textFor} from '../src/lib/locale';
describe('v1.4.0 nonclinical accessibility and locale guardrails',()=>{
 it('normalizes only supported UI display settings',()=>{
  expect(normalizeDisplay({textScale:'largest',contrast:'high',motion:'reduce'}))
   .toEqual({textScale:'largest',contrast:'high',motion:'reduce',theme:'system'});
  expect(normalizeDisplay({textScale:'medical',contrast:'invalid',motion:'on',patientId:'sensitive'}))
   .toEqual(DEFAULT_DISPLAY);
 });
 it('recovers from corrupt browser preference storage safely',()=>{
  expect(readDisplay({getItem:()=>'{'})).toEqual(DEFAULT_DISPLAY);
  expect(readDisplay({getItem:key=>key===DISPLAY_KEY?'{"textScale":"large","motion":"reduce"}':null}))
   .toEqual({textScale:'large',contrast:'standard',motion:'reduce',theme:'system'});
 });
 it('offers explicit bilingual nonclinical family and preference controls',()=>{
  for(const key of ['family.snapshot','family.scope','a11y.heading','a11y.motion','a11y.reset','caregiver.scope','caregiver.acceptScope']){
   const en=textFor('en',key),sw=textFor('sw',key);
   expect(en).not.toBe(key);expect(sw).not.toBe(key);expect(sw).not.toBe(en);
  }
 });
 it('does not replace unreviewed clinical text with speculative Kiswahili',()=>{
  expect(textFor('sw','clinical.urgentSymptom','Seek urgent clinical care')).toBe('Seek urgent clinical care');
  expect(textFor('sw','app.review')).toContain('mapitio');
 });
});
