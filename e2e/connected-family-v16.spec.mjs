import {test,expect} from '@playwright/test';
test('v1.6 in-app reminders, safe connectivity and bilingual source status across devices',async({page})=>{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:850});await page.goto('/');
  await page.getByRole('button',{name:/Explore interactive demo/i}).click();
  await page.getByRole('button',{name:/Create my journey/i}).click();
  await expect(page.getByRole('heading',{name:'Care reminders'})).toBeVisible();
  await expect(page.getByText('Connection available')).toBeVisible();
  await page.context().setOffline(true);
  await expect(page.getByText('Offline — changes may not save')).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.getByText('Connection available')).toBeVisible();
  if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Family activity timeline'})).toBeVisible();
  if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.sidebar-nav').getByRole('button',{name:'Health library',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Bilingual learning source register'})).toBeVisible();
  await expect(page.getByText('Clinical and translation review pending').first()).toBeVisible();
  const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client+2);
 }
});
test('v1.6 Kiswahili source labels retain clinical-approval warning',async({page})=>{
 await page.setViewportSize({width:390,height:850});await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await page.getByRole('combobox',{name:'Language / Lugha'}).selectOption('sw');
 await expect(page.getByRole('heading',{name:'Vikumbusho vya huduma'})).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Maktaba ya afya'}).click();
 await expect(page.getByRole('heading',{name:'Rejista ya vyanzo vya elimu ya lugha mbili'})).toBeVisible();
 await expect(page.getByText('Uhakiki wa kitabibu na tafsiri unasubiriwa').first()).toBeVisible();
});
