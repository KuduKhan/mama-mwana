import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
 testDir:'./e2e',
 timeout:60_000,
 expect:{timeout:12_000},
 fullyParallel:false,
 workers:1,
 forbidOnly:!!process.env.CI,
 retries:process.env.CI?1:0,
 reporter:process.env.CI?[['github'],['line']]:[['list']],
 use:{
  baseURL:'http://127.0.0.1:4179',
  ...devices['Desktop Chrome'],
  screenshot:'only-on-failure',
  trace:'retain-on-failure',
  video:'off'
 },
 webServer:{
  command:'npm run dev -- --host 127.0.0.1 --port 4179 --strictPort',
  url:'http://127.0.0.1:4179',
  reuseExistingServer:!process.env.CI,
  timeout:60_000
 }
});
