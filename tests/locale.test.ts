import {describe,expect,it} from 'vitest';
import {textFor} from '../src/lib/locale';
describe('English and Kiswahili navigation',()=>{
 it('translates navigation without changing internal route identity',()=>{
  expect(textFor('sw','nav.family')).toBe('Safari za familia');
  expect(textFor('en','nav.family')).toBe('Family journeys');
 });
 it('does not silently invent unreviewed translations',()=>{
  expect(textFor('sw','clinical.unreviewed','Clinical wording awaiting review')).toBe('Clinical wording awaiting review');
 });
 it('makes the medical-review boundary visible in Kiswahili',()=>{
  expect(textFor('sw','app.review')).toContain('mapitio');
 });
});
