import {authConfigured} from './supabase';
// Separate personal-organizer release flag. This never unlocks clinical data.
export const personalTrackerEnabled=authConfigured&&import.meta.env.VITE_PERSONAL_TRACKER_ENABLED==='true';
