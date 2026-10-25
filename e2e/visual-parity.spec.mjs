import {test,expect} from '@playwright/test';

async function openWelcomeAndJourney(page){
 await page.goto('/');
 await expect(page.locator('.auth-story')).toBeVisible();
 await expect(page.locator('.auth-story .auth-art')).toBeVisible();
 await expect(page.locator('.auth-story>.brand')).toBeVisible();
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await expect(page.locator('.onboard-decoration')).toBeVisible();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function geometry(page){
 return page.evaluate(()=>{
  const read=selector=>document.querySelector(selector)?.getBoundingClientRect();
  const copy=read('.hero-copy'),art=read('.hero-card .hero-visual'),chip=read('.hero-card .hero-floating');
  const hero=read('.hero-card'),body=document.documentElement;
  return {
   overflow:body.scrollWidth-body.clientWidth,
   copyArtOverlap:!!copy&&!!art&&copy.bottom>art.top+2&&copy.top<art.bottom-2,
   copyChipOverlap:!!copy&&!!chip&&copy.bottom>chip.top+2&&copy.top<chip.bottom-2,
   artChipOverlap:!!art&&!!chip&&art.bottom>chip.top+2&&art.top<chip.bottom-2,
   artVisible:!!art&&art.height>=110&&art.width>100,
   heroBounds:!!hero&&hero.left>=-2&&hero.right<=body.clientWidth+2
  };
 });
}
for(const width of [320,360,390,430,570,600,700,760]){
 test('original MamaMwana visual treatments fit '+width+'px without removing illustrations',async({page})=>{
  await page.setViewportSize({width,height:880});
  await openWelcomeAndJourney(page);
  const g=await geometry(page);
  expect(g.overflow,'document must fit phone width').toBeLessThanOrEqual(2);
  expect(g.copyArtOverlap,'illustration must not cover text').toBe(false);
  expect(g.copyChipOverlap,'original floating milestone must not cover copy').toBe(false);
  expect(g.artChipOverlap,'illustration and milestone need separate space').toBe(false);
  expect(g.artVisible,'heart/orbit illustration stays visible').toBe(true);
  expect(g.heroBounds,'original gradient card fits the screen').toBe(true);
  await expect(page.locator('.hero-halo')).toHaveCount(3);
  await expect(page.locator('.hero-emblem')).toBeVisible();
 });
}
test('the restored original colors and selectable Studio atmospheres still work',async({page})=>{
 await page.setViewportSize({width:390,height:840});
 await openWelcomeAndJourney(page);
 const defaultColor=await page.locator('.hero-card').evaluate(e=>getComputedStyle(e).backgroundImage);
 expect(defaultColor).toContain('linear-gradient');
 await page.getByRole('button',{name:'Customize visual atmosphere'}).click();
 await page.getByRole('button',{name:/Gentle Bloom/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-atmosphere','blush');
 await expect(page.locator('.hero-card .hero-visual')).toBeVisible();
 const changedColor=await page.locator('.hero-card').evaluate(e=>getComputedStyle(e).backgroundImage);
 expect(changedColor).not.toEqual(defaultColor);
 await page.getByRole('button',{name:'Customize visual atmosphere'}).click();
 await page.getByRole('button',{name:/Golden Morning/}).click();
 await expect(page.locator('.hero-card .hero-visual')).toBeVisible();
});
