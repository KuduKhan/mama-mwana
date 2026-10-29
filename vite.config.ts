import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import {assertClinicalReleaseBoundary} from './scripts/clinical-release-boundary.mjs';

export default defineConfig(({mode})=>{
 // Blocking a clinical-data build is an independent engineering control, not a
 // replacement for clinical, security or privacy signoff. Only a reviewed source
 // change can remove this NO-GO gate after all approvals exist.
 const clientEnv=loadEnv(mode,process.cwd(),'VITE_');
 assertClinicalReleaseBoundary({
  VERCEL_ENV:process.env.VERCEL_ENV,
  VITE_AUTH_ACCESS_ENABLED:clientEnv.VITE_AUTH_ACCESS_ENABLED
 });
 return {
 plugins:[react()],
 build:{
  rollupOptions:{
   output:{
    // Keep the stable Supabase client separate from the UI entry. Browser downloads
    // remain secure and unchanged; independent vendor caching improves repeat visits.
    manualChunks(id){
     if(id.includes('node_modules/@supabase/'))return 'supabase-vendor';
    }
   }
  }
 }
 };
});
