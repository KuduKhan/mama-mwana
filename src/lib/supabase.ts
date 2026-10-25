import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
// Fail closed: a valid URL and public key alone must never enable live health-data intake.
// Set VITE_AUTH_ACCESS_ENABLED=true only on an explicitly protected test or approved release.
export const configured = Boolean(url && key && import.meta.env.VITE_AUTH_ACCESS_ENABLED === 'true');
export const supabase = configured ? createClient(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;
