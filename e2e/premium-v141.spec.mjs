import {test,expect} from '@playwright/test';
async function demo(page,width){
 await page.setViewportSize({width,height:850});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
for(const width of [320,390,768,1440]){
 test('v1.4.1 premium tokens and home reflow at '+width,async({page})=>{
  await demo(page,width);
  const result=await page.evaluate(()=>{
   const doc=document.documentElement;
   const card=document.querySelector('.mm13-today');
   const style=getComputedStyle(card);
   return {width:doc.clientWidth,scroll:doc.scrollWidth,
    cardWidth:card.getBoundingClientRect().width,
    cardLeft:card.getBoundingClientRect().left,
    cardRight:card.getBoundingClientRect().right,
    token:getComputedStyle(doc).getPropertyValue('--mm-content-max').trim(),
    shadow:style.boxShadow};
  });
  expect(result.scroll).toBeLessThanOrEqual(result.width+2);
  expect(result.cardLeft).toBeGreaterThanOrEqual(-2);
  expect(result.cardRight).toBeLessThanOrEqual(width+2);
  expect(result.cardWidth).toBeGreaterThan(200);
  expect(result.token).toBe('1180px');
  expect(result.shadow).not.toBe('none');
  await expect(page.getByRole('button',{name:'Health warning signs'}).last()).toBeVisible();
  if(width<=760)await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
 });
}
test('v1.4.1 maintains visible focus and honors reduced motion',async({page})=>{
 await demo(page,390);
 const open=page.getByRole('button',{name:'Display preferences'});
 await open.focus();
 const outline=await open.evaluate(el=>getComputedStyle(el).outlineStyle);
 expect(outline).not.toBe('none');
 await open.click();
 await page.getByRole('combobox',{name:'Motion'}).selectOption('reduce');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-mm-motion','reduce');
});
