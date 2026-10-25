import {test,expect} from '@playwright/test';
test('demo remains clearly separate from saved healthcare records',async({page})=>{
 await page.goto('/');
 const demo=page.getByRole('button',{name:/Explore interactive demo/i});
 await expect(demo).toBeVisible();
 await demo.click();
 await expect(page.getByText('Create your pregnancy profile')).toBeVisible();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).isVisible().then(async visible=>{
  if(visible){await page.getByRole('button',{name:'Open navigation'}).click();await page.keyboard.press('Escape');}
 });
 await expect(page.locator('body')).not.toContainText('service_role');
});
