import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL?.trim();
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
// Authentication is separate from clinical-data authorization. Public URL and publishable
// key are safe in a browser; neither bypasses row-level security or release approvals.
export const authConfigured=Boolean(url&&key&&/^https:\/\//i.test(url));
export const authSupabase=authConfigured?createClient(url!,key!,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
}):null;
// Never use account creation or valid public keys as a clinical-release approval.
// A private workspace requires this independent deployment safety gate.
export const configured=authConfigured&&import.meta.env.VITE_AUTH_ACCESS_ENABLED==='true';
export const supabase=configured?authSupabase:null;
