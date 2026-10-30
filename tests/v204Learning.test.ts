import {describe,it,expect} from 'vitest';
import {PUBLIC_LESSONS,publicLessonText} from '../src/content/publicLessons';
import {readFileSync} from 'node:fs';
describe('beta.4 bilingual public content & offline boundary',()=>{
 it('has separate generic English/Kiswahili text without declaring clinical approval',()=>{
  expect(PUBLIC_LESSONS).toHaveLength(4);
  for(const lesson of PUBLIC_LESSONS){expect(lesson.status).toBe('general-unreviewed');expect(lesson.heading[1]).toBeTruthy();}
  expect(publicLessonText('privacy','sw')).toContain('Linda taarifa');
 });
 it('limits pre-cached assets to a public static allowlist',()=>{
  const sw=readFileSync('public/demo-offline-sw.js','utf8');
  expect(sw).toContain("'/learning/mamamwana-public-guide-v204.txt'");
  expect(sw).toContain("req.method!=='GET'");
  expect(sw).not.toContain('supabase.co');
  expect(sw).not.toContain('localStorage');
 });
});
