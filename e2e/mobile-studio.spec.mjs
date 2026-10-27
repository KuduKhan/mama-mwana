import {test,expect} from '@playwright/test';
async function start(page,width,height=800){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
async function inspect(page){
 return page.evaluate(()=>{
  const viewport=document.documentElement.clientWidth;
  const rect=sel=>{const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const controls=['.topbar .hamburger','.topbar .locale-switch select','.topbar .mm14-topbar','.mm-phone-urgent'].map(rect);
  const pbar=rect('.mm-phone-pagebar');
  const dock=rect('.mobile-tabs');
  return {viewport,documentWidth:document.documentElement.scrollWidth,controls,pbar,dock};
 });
}
for(const width of [320,360,375,390,430,540,760]){
 test('reengineered mobile chrome at '+width+'px',async({page})=>{
  await start(page,width);
  await expect(page.locator('.mm-phone-pagebar')).toBeVisible();
  await expect(page.locator('.mm-mobile-wordmark')).toBeVisible();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('Overview');
  await expect(page.locator('.mm-phone-mode')).toContainText('Preview');
  const a=await inspect(page);
  expect(a.documentWidth).toBeLessThanOrEqual(a.viewport+2);
  for(const c of a.controls){
   expect(c).not.toBeNull();
   expect(c.width).toBeGreaterThanOrEqual(43);
   expect(c.height).toBeGreaterThanOrEqual(43);
   expect(c.left).toBeGreaterThanOrEqual(-2);
   expect(c.right).toBeLessThanOrEqual(a.viewport+2);
  }
  for(let i=1;i<3;i++)expect(a.controls[i].left).toBeGreaterThanOrEqual(a.controls[i-1].right-1);
  expect(a.controls[3].top).toBeGreaterThanOrEqual(a.controls[0].bottom-1);
  expect(a.pbar.left).toBeGreaterThanOrEqual(-1);
  expect(a.pbar.right).toBeLessThanOrEqual(a.viewport+1);
  expect(a.dock.left).toBeGreaterThanOrEqual(0);
  expect(a.dock.right).toBeLessThanOrEqual(a.viewport+1);
  const menu=page.getByRole('button',{name:'Open navigation'});
  await menu.click();await expect(page.getByRole('button',{name:'Close navigation'})).toBeFocused();
  await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys'}).click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('Family journeys');
  await page.getByRole('button',{name:'Health warning signs'}).last().click();
  await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Display preferences'}).click();
  await expect(page.getByRole('dialog',{name:'Display and accessibility'})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.mobile-tabs').getByRole('button',{name:'Planner'}).click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText('My care planner');
  expect((await inspect(page)).documentWidth).toBeLessThanOrEqual(width+2);
 });
}
test('short landscape phone stays operable and avoids horizontal overflow',async({page})=>{
 await start(page,667,375);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.getByRole('button',{name:'Close navigation'})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
 await page.keyboard.press('Escape');
 const a=await inspect(page);
 expect(a.documentWidth).toBeLessThanOrEqual(a.viewport+2);
 expect(a.dock.width).toBeGreaterThan(500);
});
test('desktop header and desktop navigation retain established design',async({page})=>{
 await start(page,1366,860);
 await expect(page.locator('.mm-phone-pagebar')).toBeHidden();
 await expect(page.locator('.mm-mobile-wordmark')).toBeHidden();
 await expect(page.locator('.topbar-hello')).toBeVisible();
 await expect(page.locator('.sidebar')).toBeVisible();
 await expect(page.locator('.mobile-tabs')).toBeHidden();
 const a=await page.evaluate(()=>({topbar:document.querySelector('.topbar').getBoundingClientRect().height,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(a.topbar).toBeGreaterThanOrEqual(70);
 expect(a.scroll).toBeLessThanOrEqual(a.client+2);
});
