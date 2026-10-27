import {test,expect} from '@playwright/test';
async function demo(page,width,height=820){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
async function fit(page){
 return page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
}
for(const width of [320,360,390,430,570,760]){
 test('single mobile hierarchy retains all features at '+width+'px',async({page})=>{
  await demo(page,width);
  await expect(page.locator('.mm-phone-pagebar')).toBeVisible();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('Overview');
  await expect(page.locator('.mm-phone-page-label>span')).toBeHidden();
  await expect(page.locator('.mm13-action-card')).toHaveCount(3);
  await expect(page.locator('.mm13-home .metrics-grid>.metric-card').first()).toBeVisible();
  await expect(page.locator('.mm13-home .metrics-grid>.metric-card').nth(1)).toBeHidden();
  await expect(page.locator('.mm13-home .metrics-grid>.metric-card').nth(2)).toBeHidden();
  await expect(page.locator('.mm13-home .m12-dashboard-link')).toBeHidden();
  await expect(page.locator('.mm-footer-links')).toBeHidden();
  await expect(page.locator('.mm-footer-phone-trust')).toBeVisible();
  await expect(page.locator('.demo-banner')).toContainText('Sample data only');
  await expect(page.locator('.demo-banner')).not.toContainText('Interactive preview');
  await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
  let dims=await fit(page);expect(dims.scroll).toBeLessThanOrEqual(dims.viewport+2);
  await page.getByRole('button',{name:'Open navigation'}).click();
  await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
  await page.locator('.sidebar-nav').getByRole('button',{name:'Care journey hub'}).click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('Care journey hub');
  await page.locator('.mobile-tabs').getByRole('button',{name:'Planner'}).click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('My care planner');
  dims=await fit(page);expect(dims.scroll).toBeLessThanOrEqual(dims.viewport+2);
 });
}
test('real phone controls have nonoverlapping 44px targets and accessible safety',async({page})=>{
 await demo(page,320);
 const x=await page.evaluate(()=>{
  const qs=['.topbar .hamburger','.topbar .locale-switch select','.topbar .mm14-topbar','.mm-phone-urgent'];
  return qs.map(sel=>{const r=document.querySelector(sel).getBoundingClientRect();
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:r.width,h:r.height};});
 });
 for(const c of x){expect(c.w).toBeGreaterThanOrEqual(44);expect(c.h).toBeGreaterThanOrEqual(44);expect(c.left).toBeGreaterThanOrEqual(0);expect(c.right).toBeLessThanOrEqual(321)}
 expect(x[0].right).toBeLessThanOrEqual(x[1].left-5);
 expect(x[1].right).toBeLessThanOrEqual(x[2].left+1);
 expect(x[3].top).toBeGreaterThanOrEqual(x[0].bottom-1);
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toHaveCount(0);
});
test('mobile footer no longer repeats navigational destinations',async({page})=>{
 await demo(page,390);
 const f=page.locator('.mm-app-footer');
 await expect(f.locator('.mm-footer-links')).toBeHidden();
 await expect(f.locator('.mm-footer-identity .brand')).toBeVisible();
 await f.scrollIntoViewIfNeeded();
 const rect=await f.boundingBox();
 expect(rect.height).toBeLessThanOrEqual(165);
 await f.locator('.mm-footer-phone-trust summary').click();
 await expect(f.locator('.mm-footer-phone-trust')).toHaveAttribute('open','');
 await expect(f.locator('.mm-footer-phone-trust')).toContainText('not medical advice');
 await f.locator('.mm-footer-phone-trust summary').click();
 await expect(f.locator('.mm-footer-phone-trust')).not.toHaveAttribute('open','');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 const gap=await page.evaluate(()=>({
  foot:document.querySelector('.mm-app-footer').getBoundingClientRect().bottom,
  dock:document.querySelector('.mobile-tabs').getBoundingClientRect().top
 }));
 expect(gap.foot).toBeLessThanOrEqual(gap.dock+2);
});
test('large display preference remains usable with slim phone layout',async({page})=>{
 await demo(page,320);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Text size'}).selectOption('largest');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 const d=await fit(page);expect(d.scroll).toBeLessThanOrEqual(d.viewport+2);
 await expect(page.locator('.mm13-today')).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
});
test('short phone landscape and desktop both keep their own navigation',async({page})=>{
 await demo(page,667,375);
 await expect(page.locator('.mobile-tabs')).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar-support button')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:1280,height:860});
 await expect(page.locator('.mobile-tabs')).toBeHidden();
 await expect(page.locator('.mm-footer-links')).toBeVisible();
 await expect(page.locator('.mm-phone-pagebar')).toBeHidden();
 await expect(page.locator('.topbar-hello')).toBeVisible();
});
