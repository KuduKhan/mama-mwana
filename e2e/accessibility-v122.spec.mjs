import {test,expect} from '@playwright/test';

async function openDemo(page,width=390){
 await page.setViewportSize({width,height:820});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function selectSection(page,width,name){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name,exact:true}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText(name);
}
test('shared botanical tokens remain available without altering the original palette',async({page})=>{
 await openDemo(page);
 const tokens=await page.evaluate(()=>{
  const css=getComputedStyle(document.documentElement);
  return {
   forest:css.getPropertyValue('--mm-forest').trim(),
   sage:css.getPropertyValue('--mm-sage-pale').trim(),
   touch:css.getPropertyValue('--mm-touch-min').trim()
  };
 });
 expect(tokens).toEqual({forest:'#153f36',sage:'#f1f7f0',touch:'44px'});
 await expect(page.locator('.sidebar-footer')).toContainText('v1.2.2');
});
test('mobile quick navigation has 44px targets and reports its active section',async({page})=>{
 await openDemo(page,390);
 const buttons=page.locator('.mobile-tabs button');
 await expect(buttons).toHaveCount(5);
 const heights=await buttons.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
 expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
 await buttons.filter({hasText:'Planner'}).click();
 await expect(page.locator('.mobile-tabs button[aria-current="page"]')).toContainText('Planner');
 await expect(page.locator('.topbar-current-page')).toHaveText('My care planner');
});
test('keyboard navigation and asynchronously loaded care sections are accessible',async({page})=>{
 await openDemo(page,1280);
 const nav=page.locator('.sidebar-nav');
 await expect(nav).toHaveAttribute('aria-label','Primary navigation');
 const link=nav.getByRole('button',{name:'Care journey hub'});
 await link.focus();
 await expect(link).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Care journey hub'})).toBeVisible();
 await expect(link).toHaveAttribute('aria-current','page');
 const focus=await link.evaluate(node=>getComputedStyle(node).outlineStyle);
 expect(focus).toBe('solid');
});
test('320px navigation retains safe reflow and current-language semantics',async({page})=>{
 await openDemo(page,320);
 const lang=page.getByRole('combobox',{name:'Language / Lugha'});
 await lang.selectOption('sw');
 await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await lang.selectOption('en');
 await selectSection(page,320,'Care journey hub');
 const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.width+2);
});
