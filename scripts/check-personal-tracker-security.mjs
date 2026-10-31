import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const sql=readFileSync(new URL('../supabase/migrations/20261031_000013_personal_tracker.sql',import.meta.url),'utf8');
const auth=readFileSync(new URL('../src/lib/supabase.ts',import.meta.url),'utf8');
const trackerGate=readFileSync(new URL('../src/lib/personalTrackerGate.ts',import.meta.url),'utf8');
const workspace=readFileSync(new URL('../src/components/LiveLearningWorkspace.tsx',import.meta.url),'utf8');
assert.match(sql,/enable row level security/i);
assert.match(sql,/force row level security/i);
for(const op of ['select','insert','update','delete']){
 assert.match(sql,new RegExp('create policy mm_tracker_owner_'+op+'[\\s\\S]+?to authenticated','i'));
}
assert.match(sql,/using \(owner_id = \(select auth\.uid\(\)\)\)/i);
assert.match(sql,/with check \(owner_id = \(select auth\.uid\(\)\)\)/i);
assert.match(sql,/revoke all on public\.personal_tracker_items from public, anon, authenticated/i);
assert.match(sql,/grant select, insert, update, delete on public\.personal_tracker_items to authenticated/i);
assert.doesNotMatch(sql,/grant\s+(all|execute)[^;]+\b(public|anon|authenticated)\s*;/i);
assert.doesNotMatch(sql,/security\s+definer/i);
assert.match(trackerGate,/VITE_PERSONAL_TRACKER_ENABLED==='true'/);
assert.match(auth,/VITE_AUTH_ACCESS_ENABLED==='true'/);
assert.match(workspace,/user&&personalTrackerEnabled/);
assert.equal(workspace.includes("from '../lib/supabase'"),false);
assert.doesNotMatch(workspace,/\bapplyClinicalMutation\b/);
console.log('PASS tracker release boundaries: separate flags, per-owner RLS, no anonymous or privileged clinical grants');
