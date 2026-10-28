import {readFileSync} from 'node:fs';

/**
 * Deterministic, offline-only release gate for DDL security invariants.
 * This complements (never replaces) Postgres RLS tests with authenticated users.
 */
const files=[
 'supabase/migrations/20261025_000010_v10_legacy_links.sql',
 'supabase/migrations/20261025_000011_v11_caregiver_invitations.sql'
];
const issues=[];
function expectMatch(sql,expression,message,file){
 if(!expression.test(sql))issues.push(file+': '+message);
}
function rejectMatch(sql,expression,message,file){
 if(expression.test(sql))issues.push(file+': '+message);
}
for(const file of files){
 const sql=readFileSync(file,'utf8');
 expectMatch(sql,/\bbegin\s*;/i,'must open a transaction',file);
 expectMatch(sql,/\bcommit\s*;/i,'must commit the checked migration',file);
 rejectMatch(sql,/\bdrop\s+(table|schema)\b|\btruncate\s+table\b/i,
   'unexpected destructive schema change',file);
 rejectMatch(sql,/\bgrant\s+(?:all|insert|update|delete|select|execute)[\s\S]{0,100}\bto\s+anon\b/i,
   'unexpected anon grant',file);
 for(const match of sql.matchAll(/\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_]+)\s*\(/gi)){
  const name=match[1];
  expectMatch(sql,new RegExp('alter\\s+table\\s+public\\.'+name+'\\s+enable\\s+row\\s+level\\s+security','i'),
   name+' must enable RLS',file);
  expectMatch(sql,new RegExp('revoke\\s+all\\s+on\\s+public\\.'+name+'\\s+from\\s+anon\\s*,\\s*authenticated','i'),
   name+' must explicitly revoke defaults before grants',file);
 }
}
const attribution=readFileSync(files[0],'utf8'),sharing=readFileSync(files[1],'utf8');
const recipientErasure=readFileSync('supabase/migrations/20261029_000012_v12_recipient_erasure_fk.sql','utf8');
expectMatch(recipientErasure,/alter\\s+table\\s+public\\.caregiver_invitations[\\s\\S]*drop\\s+constraint\\s+caregiver_invitations_accepted_by_fkey/i,'v12 must replace accepted-recipient foreign key', 'v12');
expectMatch(recipientErasure,/foreign\\s+key\\s*\\(accepted_by\\)[\\s\\S]*references\\s+auth\\.users\\s*\\(id\\)\\s*on\\s+delete\\s+cascade/i,'recipient account deletion must remove invitation without triggering a guarded FK UPDATE','v12');
rejectMatch(recipientErasure,/disable\\s+row\\s+level\\s+security|drop\\s+table|truncate\\s+table|grant\\s+all/i,'v12 must preserve data-RLS and minimum privilege','v12');

for(const [re,message] of [
 [/confirmed_by\s+is\s+distinct\s+from\s+auth\.uid\(\)/i,'attributions require authenticated actor'],
 [/c\.id\s*=\s*new\.child_id\s+and\s+c\.journey_id\s*=\s*new\.journey_id/i,'attribution must link within same journey'],
 [/source_id\s*=\s*new\.source_id\s+and\s+m\.owner_id\s*=\s*new\.owner_id/i,'growth source must be owner scoped'],
 [/source_id\s*=\s*new\.source_id\s+and\s+v\.owner_id\s*=\s*new\.owner_id/i,'vaccination source must be owner scoped'],
 [/MM_LINK_CONFLICT/,'version conflict must be rejected'],
 [/create\s+trigger\s+remove_growth_attribution/i,'orphaned growth attributions must be removed'],
 [/create\s+trigger\s+remove_immunization_attribution/i,'orphaned vaccine attributions must be removed'],
 [/alter\s+table\s+public\.family_legacy_link_events\s+enable\s+row\s+level\s+security/i,'attribution audit must have RLS']
])expectMatch(attribution,re,message,files[0]);
rejectMatch(attribution,/insert\s+into\s+public\.(child_measurements|child_immunizations|family_growth_entries|family_vaccine_entries)/i,
 'attribution must never copy or overwrite medical observations',files[0]);
for(const [re,message] of [
 [/email_confirmed_at\s+is\s+not\s+null/i,'recipients must have verified emails'],
 [/accepted_by\s*=\s*v_me/i,'acceptance must bind verified recipient ID'],
 [/i\.accepted_by\s*=\s*v_me/i,'summary RPC must require accepted identity'],
 [/i\.status\s*=\s*'accepted'/i,'summary RPC must require accepted status'],
 [/i\.shared_until\s*>\s*now\(\)/i,'read-only access must expire'],
 [/new\.version\s*<>\s*old\.version\s*\+\s*1/i,'invitation transitions must reject stale versions'],
 [/new\.guardian_authority_attested/i,'invitation must require explicit guardian authority attestation'],
 [/MM_SHARE_OWNER_ONLY_REVOKE/i,'owner must be limited to revoke'],
 [/revoke\s+all\s+on\s+function\s+public\.get_shared_child_summary\(uuid\)\s+from\s+public\s*,\s*anon/i,'public read-only RPC must not be anonymous'],
 [/grant\s+execute\s+on\s+function\s+public\.get_shared_child_summary\(uuid\)\s+to\s+authenticated/i,'read-only RPC must be scoped to signed-in accounts']
])expectMatch(sharing,re,message,files[1]);
rejectMatch(sharing,/grant\s+(insert|update|delete)\s+on\s+public\.(family_children|family_growth_entries|family_vaccine_entries)\s+to\s+authenticated/i,
 'sharing migration must not expand original family table write grants',files[1]);
if(issues.length){
 for(const issue of issues)console.error('SQL security contract FAILED: '+issue);
 process.exitCode=1;
}else{
 console.log('SQL security contract passed for v1.0 attribution and caregiver sharing migrations.');
 console.log('NOTE: structural checks do NOT constitute authenticated RLS, clinical or legal approval.');
}
