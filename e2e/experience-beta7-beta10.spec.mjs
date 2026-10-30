import {test,expect} from '@playwright/test';
async function demo(page,width){
 await page.setViewportSize({width,height:850});await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
}
test('beta.7 primary destinations and contextual next action fit narrow screens',async({page})=>{
 for(const width of [320,390,768]){
  await demo(page,width);
  await expect(page.locator('.mobile-tabs button')).toHaveCount(width<=760?5:5);
  if(width<=760){
   await expect(page.locator('.mobile-tabs')).toContainText('Journey');
   await expect(page.locator('.mobile-tabs')).toContainText('Learn');
  }
  await expect(page.locator('.mm207-next')).toContainText('Not medical advice');
  const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+2);
 }
});
test('beta.8 family storybook, beta.9 academy and beta.10 trust panel remain sample-only',async({page})=>{
 await demo(page,390);
 await page.locator('.mobile-tabs').getByRole('button',{name:'Journey'}).click();
 await expect(page.getByRole('heading',{name:'Family Storybook & Support'})).toBeVisible();
 await expect(page.locator('.mm208-tasks input')).toHaveCount(4);
 await page.locator('.mobile-tabs').getByRole('button',{name:'Learn'}).click();
 await expect(page.getByRole('heading',{name:'Family Learning Academy'})).toBeVisible();
 await expect(page.locator('.mm209-pack')).toHaveAttribute('href','/learning/mamamwana-learning-essentials-v209.txt');
 await page.locator('.mm209-lesson input').first().check();
 await expect(page.locator('.mm209-feedback')).toContainText('Correct');
 await page.locator('.mobile-tabs').getByRole('button',{name:'Me',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Quality, privacy & transparency'})).toBeVisible();
 await expect(page.locator('.mm210-decision')).toContainText('CLINICAL NO-GO');
 const sizes=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));
 expect(sizes.s).toBeLessThanOrEqual(sizes.w+2);
});
