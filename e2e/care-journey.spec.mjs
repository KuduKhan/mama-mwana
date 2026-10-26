import {test,expect} from '@playwright/test';

async function start(page,width){
 await page.setViewportSize({width,height:830});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function openHub(page,width){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Care journey hub'}).click();
 await expect(page.getByRole('heading',{name:'Care journey hub'})).toBeVisible();
}
async function checkFit(page,width){
 const fit=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 expect(fit.scroll,'Care Journey Hub should not cause sideways scroll at '+width).toBeLessThanOrEqual(fit.client+2);
}
for(const width of [320,390,768,1440]){
 test('original-style care journey hub fits and filters at '+width+'px',async({page})=>{
  await start(page,width);
  await openHub(page,width);
  await expect(page.locator('.m12-intro')).toBeVisible();
  await expect(page.getByText('No entries in this category yet')).toBeVisible();
  await checkFit(page,width);
  await page.getByRole('button',{name:'Baby & growth',exact:true}).last().click();
  await expect(page.locator('.m12-filters button.active')).toContainText('Baby & growth');
  await checkFit(page,width);
  await page.getByRole('button',{name:'All entries',exact:true}).click();
  await expect(page.locator('.m12-filters button.active')).toContainText('All entries');
 });
}
test('visit preparation requires deliberate reveal and explicit permission to copy',async({page})=>{
 await start(page,390);
 await openHub(page,390);
 await expect(page.locator('.m12-brief-text')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Copy notes'})).toHaveCount(0);
 await page.getByRole('button',{name:'Review private notes'}).click();
 const preview=page.getByLabel('Visit preparation excerpt');
 await expect(preview).toBeVisible();
 await expect(preview).toContainText('MAMAMWANA — PERSONAL VISIT PREPARATION NOTES');
 const copy=page.getByRole('button',{name:'Copy notes'});
 await expect(copy).toBeDisabled();
 await page.getByRole('checkbox',{name:/I understand this contains sensitive personal information/}).check();
 await expect(copy).toBeEnabled();
 await page.getByRole('button',{name:'Hide preview'}).click();
 await expect(preview).toHaveCount(0);
 await page.getByRole('button',{name:'Review private notes'}).click();
 await expect(page.getByRole('button',{name:'Copy notes'})).toBeDisabled();
});
test('newly entered clinic visit is reflected in the selected journey and can be filtered',async({page})=>{
 await start(page,1280);
 await page.locator('.sidebar-nav').getByRole('button',{name:'Antenatal visits'}).click();
 await page.getByRole('button',{name:'Add visit'}).click();
 await page.getByRole('textbox',{name:'Facility / contact'}).fill('Sample maternity clinic');
 await page.getByRole('button',{name:'Save visit'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Care journey hub'}).click();
 await expect(page.locator('.m12-event-info')).toContainText(['Sample maternity clinic']);
 await expect(page.locator('.m12-appointments')).toContainText('Sample maternity clinic');
 await page.getByRole('button',{name:'Care visits'}).click();
 await expect(page.locator('.m12-event')).toHaveCount(1);
 await page.getByRole('button',{name:'Baby & growth',exact:true}).last().click();
 await expect(page.locator('.m12-event')).toHaveCount(0);
 await page.getByRole('button',{name:'All entries'}).click();
 await expect(page.locator('.m12-event')).toHaveCount(1);
});

test('small-screen care journal retains readable labels, accessible filter targets and private preview',async({page})=>{
 await start(page,390);
 await openHub(page,390);
 const sizes=await page.evaluate(()=>{
  const filter=document.querySelector('.m12-filters button');
  const note=document.querySelector('.m12-intro p');
  const sum=document.querySelector('.m12-summary span');
  return {target:filter.getBoundingClientRect().height,note:parseFloat(getComputedStyle(note).fontSize),summary:parseFloat(getComputedStyle(sum).fontSize)};
 });
 expect(sizes.target).toBeGreaterThanOrEqual(44);
 expect(sizes.note).toBeGreaterThanOrEqual(13);
 expect(sizes.summary).toBeGreaterThanOrEqual(12);
 await checkFit(page,390);
 await page.getByRole('button',{name:'Review private notes'}).click();
 await page.getByRole('checkbox',{name:/I understand this contains sensitive personal information/}).check();
 await expect(page.getByRole('button',{name:'Copy notes'})).toBeEnabled();
 await page.getByRole('button',{name:'Hide preview'}).click();
 await expect(page.locator('.m12-brief-text')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Copy notes'})).toHaveCount(0);
});
