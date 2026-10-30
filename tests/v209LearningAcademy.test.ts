import {describe,it,expect} from 'vitest';
import {ACADEMY_TOPICS,academyAnswer} from '../src/content/learningAcademyV209';
import {readFileSync} from 'node:fs';
describe('beta.9 bilingual public learning is review-gated',()=>{
 it('has aligned bilingual answers with explicit unreviewed status',()=>{
  expect(ACADEMY_TOPICS).toHaveLength(4);
  for(const item of ACADEMY_TOPICS){
   expect(item.heading).toHaveLength(2);expect(item.answers[0]).toHaveLength(item.answers[1].length);
   expect(item.status).toBe('general-unreviewed');
   expect(item.source).toMatch(/^https:\/\//);
   expect(academyAnswer(item.id,item.correct)?.correct).toBe(true);
   expect(academyAnswer(item.id,-1)).toBeNull();
  }
 });
 it('caches only an explicitly allowlisted static public lesson file',()=>{
  const sw=readFileSync('public/demo-offline-sw.js','utf8');
  expect(sw).toContain("'/learning/mamamwana-learning-essentials-v209.txt'");
  expect(sw).not.toContain('indexedDB');
 });
});
