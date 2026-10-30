import {test,expect} from '@playwright/test';
test('beta.12 low-bandwidth responsive and focus acceptance — sample demo only',async({page})=>{
 await page.setViewportSize({width:320,height:750});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm22-smart-home')).toBeVisible();
 await page.evaluate(()=>{document.documentElement.dataset.mmData='reduce'});
 await expect(page.locator('html')).toHaveAttribute('data-mm-data','reduce');
 await page.keyboard.press('Tab');
 const report=await page.evaluate(()=>({
  client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
  animation:getComputedStyle(document.querySelector('.page-content')).animationName
 }));
 expect(report.scroll).toBeLessThanOrEqual(report.client+2);
 expect(report.animation).toBe('none');
 await page.locator('.mobile-tabs').getByRole('button',{name:'Learn',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Family Learning Academy'})).toBeVisible();
 await expect(page.locator('.mm209-pack')).toHaveAttribute('href',/mamamwana-learning-essentials-v209/);
});
