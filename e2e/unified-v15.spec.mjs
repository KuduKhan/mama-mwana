import {test,expect} from '@playwright/test';
for(const width of [320,768,1440]){
 test('v1.5.0 keeps demo onboarding and the unified navigation at '+width,async({page})=>{
  await page.setViewportSize({width,height:850});await page.goto('/');
  await page.getByRole('button',{name:/Explore interactive demo/i}).click();
  await page.getByRole('button',{name:/Create my journey/i}).click();
  await expect(page.locator('.mm13-today')).toBeVisible();
  if(width<=760){
   await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
   await page.locator('.mobile-tabs').getByRole('button',{name:'Planner'}).click();
  }else await page.locator('.sidebar-nav').getByRole('button',{name:'My care planner'}).click();
  await expect(page.getByRole('heading',{name:/my care planner/i}).first()).toBeVisible();
  const widthInfo=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widthInfo.scroll).toBeLessThanOrEqual(widthInfo.client+2);
 });
}
