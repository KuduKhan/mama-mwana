import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
});
