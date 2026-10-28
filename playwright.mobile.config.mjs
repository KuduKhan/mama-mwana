import {defineConfig,devices} from '@playwright/test';

/** Separate device-engine evidence, not a substitute for physical hardware/AT. */
export default defineConfig({
 testDir:'./e2e',
 testMatch:'platform-accessibility.spec.mjs',
 fullyParallel:false,
 forbidOnly:!!process.env.CI,
 timeout:60_000,
 expect:{timeout:12_000},
 retries:process.env.CI?1:0,
 workers:1,
 reporter:process.env.CI?[['github'],['line']]:[['list']],
 use:{
  baseURL:'http://127.0.0.1:4179',
  screenshot:'only-on-failure',
  trace:'retain-on-failure',
  video:'off'
 },
 projects:[
  {name:'iphone-webkit',use:{...devices['iPhone 13'],browserName:'webkit'}},
  {name:'android-chromium',use:{...devices['Pixel 7'],browserName:'chromium'}}
 ],
 webServer:{
  command:'npm run dev -- --host 127.0.0.1 --port 4179 --strictPort',
  url:'http://127.0.0.1:4179',
  reuseExistingServer:!process.env.CI,
  timeout:60_000
 }
});
