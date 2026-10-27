import {test,expect} from '@playwright/test';

async function demo(page,width=390){
 await page.setViewportSize({width,height:820});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
async function tab(page,width,label){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:label,exact:true}).click();
}
test('display options remain local to this browser across reloads',async({page})=>{
 await demo(page,390);
 await page.getByRole('button',{name:'Display preferences'}).click();
 const dialog=page.getByRole('dialog',{name:'Display and accessibility'});
 await expect(dialog).toBeVisible();
 await dialog.getByRole('combobox',{name:'Text size'}).selectOption('largest');
 await dialog.getByRole('combobox',{name:'Contrast'}).selectOption('high');
 await dialog.getByRole('combobox',{name:'Motion'}).selectOption('reduce');
 await expect(page.locator('html')).toHaveAttribute('data-mm-text','largest');
 await expect(page.locator('html')).toHaveAttribute('data-mm-contrast','high');
 await expect(page.locator('html')).toHaveAttribute('data-mm-motion','reduce');
 await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Display preferences'})).toBeFocused();
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-mm-text','largest');
 const saved=await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('mamamwana-ui-display-v1')||'{}')).sort());
 expect(saved).toEqual(['contrast','motion','textScale']);
});
test('settings reset without changing the active care journey',async({page})=>{
 await demo(page,1280);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Text size'}).selectOption('large');
 await page.getByRole('button',{name:'Reset display preferences'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-mm-text','standard');
 await expect(page.locator('html')).toHaveAttribute('data-mm-contrast','standard');
 await expect(page.locator('html')).toHaveAttribute('data-mm-motion','system');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
});
test('family-specific overview shows only selected account journeys and summary counts',async({page})=>{
 await demo(page,1280);
 await tab(page,1280,'Family journeys');
 await expect(page.getByRole('heading',{name:'Your family at a glance'})).toBeVisible();
 const cards=page.locator('.mm14-family-card');
 await expect(cards).toHaveCount(1);
 await expect(cards.first()).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.mm14-family-summary')).toContainText('planned visit');
 await expect(page.locator('.mm14-family-summary')).toContainText('not verified clinic records');
});
test('Kiswahili preferences and family navigation translate without clinical translation claims',async({page})=>{
 await demo(page,390);
 await page.getByRole('combobox',{name:'Language / Lugha'}).selectOption('sw');
 await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await expect(page.getByRole('status')).toContainText('mapitio');
 await page.getByRole('button',{name:'Display preferences'}).click();
 await expect(page.getByRole('heading',{name:'Mwonekano na ufikivu'})).toBeVisible();
 await page.getByRole('button',{name:'Funga mipangilio ya mwonekano'}).click();
 await tab(page,390,'Safari za familia');
 await expect(page.getByRole('heading',{name:'Muhtasari wa familia yako'})).toBeVisible();
});
for(const width of [320,390,768,1440]){
 test('v1.4 family and settings fit '+width+'px without sideways overflow',async({page})=>{
  await demo(page,width);
  await page.getByRole('button',{name:'Display preferences'}).click();
  await page.getByRole('combobox',{name:'Text size'}).selectOption('largest');
  await expect(page.locator('.mm14-preferences')).toBeVisible();
  await page.getByRole('button',{name:'Close display preferences'}).click();
  await tab(page,width,'Family journeys');
  await expect(page.locator('.mm14-family-summary')).toBeVisible();
  const d=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(d.scroll).toBeLessThanOrEqual(d.viewport+2);
 });
}
