import {test,expect} from '@playwright/test';
for(const width of [320,390,768,1440]){
 test('v2.0 preview identity, premium home reflow and functional shortcuts '+width,async({page})=>{
  await page.setViewportSize({width,height:880});
  await page.goto('/');
  await expect(page.getByText('v2.0 Preview').first()).toBeVisible();
  await page.getByRole('button',{name:/Explore interactive demo/i}).click();
  await page.getByRole('button',{name:/Create my journey/i}).click();
  await expect(page.getByRole('heading',{name:'A calmer way to keep family care connected.'})).toBeVisible();
  await expect(page.getByText('Sample data only', {exact:false}).first()).toBeVisible();
  await page.locator('.mm20-showcase').getByRole('button',{name:'Family journeys'}).click();
  await expect(page.getByRole('heading',{name:'Family journeys'}).first()).toBeVisible();
  if(width<=760)await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
  const x=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(x.scroll).toBeLessThanOrEqual(x.client+2);
  await page.reload();
  await expect(page.getByText('v2.0 Preview').first()).toBeVisible();
 });
}
test('v2.0 preview retains educational boundary and explicit no-go',async({page})=>{
 await page.setViewportSize({width:390,height:850});await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm20-showcase')).toContainText('not an approved clinical service');
 await page.locator('.mm20-showcase').getByRole('button',{name:'Explore learning'}).click();
 await expect(page.getByRole('heading',{name:'Health & learning library'})).toBeVisible();
 await expect(page.getByText('Clinical and translation review pending').first()).toBeVisible();
});
