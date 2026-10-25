import {describe,expect,it} from 'vitest';
import {assertLocalSupabaseEndpoint} from '../scripts/local-db-boundary.mjs';
describe('disposable security fixture URL restrictions',()=>{
 it('accepts an explicit loopback-local Supabase API',()=>{
  expect(assertLocalSupabaseEndpoint('http://127.0.0.1:54321')).toBe('http://127.0.0.1:54321/');
  expect(assertLocalSupabaseEndpoint('http://localhost:54321')).toContain('localhost');
 });
 it('refuses production Supabase and non-local network endpoints',()=>{
  for(const url of [
   'https://jkazrgobphetdbfdvotf.supabase.co',
   'http://jkazrgobphetdbfdvotf.supabase.co:54321',
   'http://10.0.0.10:54321',
   'http://127.0.0.2:54321',
   'https://localhost:54321',
   'http://localhost',
   'http://127.0.0.1'
  ])expect(()=>assertLocalSupabaseEndpoint(url)).toThrow();
 });
});
