import {test,expect} from '@playwright/test';
async function ready(page,width,height=820){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
const sections=['Overview','Family journeys','My pregnancy','Daily care','Antenatal visits','My care planner','Care journey hub','Birth preparation','Baby & growth','Clinical timeline','Care guidance','Privacy & records','Health library'];
for(const width of [320,360,390,430,768,1024,1440]){
 test('medical studio fits '+width+'px while preserving all navigable features',async({page})=>{
  await ready(page,width);
  await expect(page.locator('.mm-handwritten-note')).toBeVisible();
  await expect(page.locator('.hero-visual .mm-medical-motif')).toHaveAttribute('src','/care-motif.svg');
  await expect(page.locator('.hero-copy .handwritten-accent')).toBeVisible();
  const icon=page.locator('.mm-renewed-header .mm-language-symbol');
  if(width<=760){
   await expect(icon).toBeVisible();
   const target=await page.locator('.mm-renewed-header .mm-language-switch').boundingBox();
   expect(target.width).toBeGreaterThanOrEqual(44);
   expect(target.height).toBeGreaterThanOrEqual(44);
   const select=page.getByRole('combobox',{name:'Language / Lugha'});
   const style=await select.evaluate(el=>({opacity:getComputedStyle(el).opacity,display:getComputedStyle(el).display}));
   expect(style.opacity).toBe('0');expect(style.display).not.toBe('none');
  }else{
   await expect(icon).toBeHidden();
   await expect(page.locator('.mm-renewed-header .mm-phone-pagebar')).toBeHidden();
  }
  const doc=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(doc.scroll).toBeLessThanOrEqual(doc.viewport+2);
  if(width===320||width===390||width===768||width===1440){
   for(const section of sections){
    if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
    await page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true}).click();
    const r=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    expect(r.scroll,section+' at '+width).toBeLessThanOrEqual(r.viewport+2);
   }
  }
 });
}
test('globe-only phone language selector changes actual language and remains keyboard named',async({page})=>{
 await ready(page,320);
 const select=page.getByRole('combobox',{name:'Language / Lugha'});
 await expect(select).toHaveAccessibleName('Language / Lugha');
 await select.selectOption('sw');await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await expect(page.locator('.mm-renewed-header .mm-phone-page-label strong')).toHaveText('Muhtasari');
 await select.selectOption('en');await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.getByRole('button',{name:'Display preferences'}).click();
 await expect(page.getByRole('dialog',{name:'Display and accessibility'})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
});
test('user motion reduction turns off decorative animations without hiding content',async({page})=>{
 await ready(page,390);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Motion'}).selectOption('reduce');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-mm-motion','reduce');
 const a=await page.locator('.mm-medical-motif').evaluate(el=>getComputedStyle(el).animationDuration);
 expect(a).toMatch(/0.01ms|0s/);
 await expect(page.locator('.mm-medical-motif')).toBeVisible();
 await expect(page.locator('.mm-handwritten-note')).toBeVisible();
});
test('card labels and links remain visible with high contrast and large text',async({page})=>{
 await ready(page,320);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Text size'}).selectOption('largest');
 await page.getByRole('combobox',{name:'Contrast'}).selectOption('high');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-mm-contrast','high');
 for(const section of ['Family journeys','My care planner','Care guidance','Privacy & records']){
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true}).click();
  const d=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(d.scroll).toBeLessThanOrEqual(d.width+2);
 }
});
