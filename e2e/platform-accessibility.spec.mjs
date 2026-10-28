import {test,expect} from '@playwright/test';

/** Uses only ephemeral sample-data demo records, never patient information. */
async function demo(page){
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
const sections=[
 'Overview','Family journeys','My pregnancy','Daily care','Antenatal visits',
 'My care planner','Care journey hub','Birth preparation','Baby & growth',
 'Clinical timeline','Care guidance','Privacy & records','Health library'
];
async function fit(page,description){
 const result=await page.evaluate(()=>({
  width:document.documentElement.clientWidth,
  scroll:document.documentElement.scrollWidth
 }));
 expect(result.scroll,description+' must not overflow width '+result.width)
  .toBeLessThanOrEqual(result.width+2);
}
function targetBoxes(page){
 return page.evaluate(()=>{
  const keys={
   menu:'.mm-renewed-header .hamburger',
   language:'.mm-renewed-header .mm-language-switch',
   preferences:'.mm-renewed-header .mm14-topbar',
   safety:'.mm-renewed-header .mm-phone-urgent'
  };
  return Object.fromEntries(Object.entries(keys).map(([name,selector])=>{
   const element=document.querySelector(selector);
   if(!element)return [name,null];
   const r=element.getBoundingClientRect();
   return [name,{x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width,height:r.height}];
  }));
 });
}
test('sample onboarding, mobile navigation, content and safe areas',async({page},testInfo)=>{
 await page.goto('/');
 await fit(page,'welcome');
 await expect(page.getByRole('button',{name:/Explore interactive demo/i})).toBeVisible();
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await fit(page,'onboarding');
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
 const dims=await targetBoxes(page);
 const width=await page.evaluate(()=>document.documentElement.clientWidth);
 for(const [name,r] of Object.entries(dims)){
  expect(r,name+' visible').not.toBeNull();
  expect(r.width,name+' target width').toBeGreaterThanOrEqual(44);
  expect(r.height,name+' target height').toBeGreaterThanOrEqual(44);
  expect(r.x,name+' left boundary').toBeGreaterThanOrEqual(-1);
  expect(r.right,name+' right boundary').toBeLessThanOrEqual(width+1);
 }
 expect(dims.menu.right).toBeLessThanOrEqual(dims.language.x);
 expect(dims.language.right).toBeLessThanOrEqual(dims.preferences.x+1);
 expect(dims.safety.y).toBeGreaterThanOrEqual(dims.menu.bottom-1);
 await expect(page.locator('.mm-renewed-header .mm-language-symbol')).toBeVisible();
 await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
 await expect(page.locator('.mm-renewed-footer .mm-footer-links')).toBeHidden();
 await fit(page,'home');
 await page.screenshot({
  path:testInfo.outputPath('SAMPLE-mobile-home.png'),
  fullPage:true,animations:'disabled'
 });
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
 await expect(page.getByRole('button',{name:'Close navigation'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
 await page.locator('.mobile-tabs').getByRole('button',{name:'Planner'}).click();
 await expect(page.locator('.mm-phone-page-label strong')).toHaveText('My care planner');
 await fit(page,'care planner');
});
test('thirteen feature screens fit without losing buttons or text',async({page})=>{
 await demo(page);
 for(const section of sections){
  await page.getByRole('button',{name:'Open navigation'}).click();
  const button=page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true});
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText(section);
  await fit(page,section);
 }
});
test('native bilingual selection, settings and urgent guidance remain accessible',async({page})=>{
 await demo(page);
 const selector=page.getByRole('combobox',{name:'Language / Lugha'});
 await expect(selector).toHaveAccessibleName('Language / Lugha');
 await selector.selectOption('sw');
 await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await selector.selectOption('en');
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.getByRole('button',{name:'Display preferences'}).click();
 const preferences=page.getByRole('dialog',{name:'Display and accessibility'});
 await expect(preferences).toBeVisible();
 await expect(preferences.getByRole('combobox',{name:'Text size'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(preferences).not.toBeVisible();
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 const warning=page.getByRole('dialog',{name:'When to seek urgent help'});
 await expect(warning).toBeVisible();
 await expect(warning).toContainText('immediate');
 await page.keyboard.press('Escape');
 await expect(warning).not.toBeVisible();
});
test('forms and consent controls remain operable with larger text',async({page})=>{
 await demo(page);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Text size'}).selectOption('largest');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 for(const section of ['Family journeys','My care planner','Privacy & records']){
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true}).click();
  await fit(page,section+' with large text');
 }
});
test('landscape, scrolling, footer dock separation and reduced-motion modes',async({page})=>{
 await demo(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 const animation=await page.locator('.mm-medical-motif').evaluate(el=>getComputedStyle(el).animationDuration);
 expect(animation).toMatch(/0(?:s|\.0+s|\.01ms)|0\.00001s/);
 const height=await page.evaluate(()=>document.documentElement.clientHeight);
 const width=await page.evaluate(()=>document.documentElement.clientWidth);
 const landscapeWidth=Math.max(width,height);
 await page.setViewportSize({width:landscapeWidth,height:Math.min(width,height)});
 await fit(page,'native device landscape');
 // Pixel 7's landscape CSS width exceeds the 760px navigation breakpoint.
 // It intentionally uses tablet/desktop navigation, unlike iPhone 13.
 if(landscapeWidth<=760){
  await expect(page.locator('.mobile-tabs')).toBeVisible();
  await page.getByRole('button',{name:'Open navigation'}).click();
  await expect(page.locator('.sidebar-support').getByRole('button',{name:'When to seek help'})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const gap=await page.evaluate(()=>({
   footer:document.querySelector('.mm-renewed-footer').getBoundingClientRect().bottom,
   dock:document.querySelector('.mobile-tabs').getBoundingClientRect().top
  }));
  expect(gap.footer).toBeLessThanOrEqual(gap.dock+2);
 }else{
  await expect(page.locator('.mobile-tabs')).toBeHidden();
  await expect(page.locator('.sidebar-nav')).toBeVisible();
  await expect(page.locator('.mm-renewed-header .topbar-hello')).toBeVisible();
  await page.locator('.sidebar-nav').getByRole('button',{name:'Care guidance'}).click();
  await fit(page,'wide phone landscape care guidance');
 }
});
