import {test,expect} from '@playwright/test';

const words=Array.from({length:5},()=> 'Amina').join(' ')+' Nuru';

async function demo(page){
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
function viewportFit(page){
 return page.evaluate(()=>{
  const root=document.documentElement;
  return {client:root.clientWidth,scroll:root.scrollWidth};
 });
}
test('original UI colors and artwork are retained at phone and desktop sizes',async({page},testInfo)=>{
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:830});
  await demo(page);
  const original=await page.evaluate(()=>{
   const hero=document.querySelector('.hero-card');
   const script=document.querySelector('.hero-copy .handwritten-accent');
   const panel=document.querySelector('.metric-card');
   return {
    gradient:getComputedStyle(hero).backgroundImage,
    typeface:getComputedStyle(script).fontFamily,
    artVisible:getComputedStyle(document.querySelector('.hero-visual')).display!=='none',
    emblem:!!document.querySelector('.hero-emblem svg'),
    panelRadius:getComputedStyle(panel).borderRadius
   };
  });
  expect(original.gradient).toContain('linear-gradient');
  expect(original.artVisible).toBe(true);
  expect(original.emblem).toBe(true);
  expect(original.typeface).toMatch(/Segoe Print|Bradley Hand|Chancery|cursive/);
  expect(original.panelRadius).not.toBe('0px');
  const fit=await viewportFit(page);
  expect(fit.scroll,'horizontal page scroll at '+width).toBeLessThanOrEqual(fit.client+2);
  await page.screenshot({path:testInfo.outputPath('original-home-'+width+'.png'),fullPage:true,animations:'disabled'});
 });
});
test('important card labels now meet text contrast and dates remain legible at 320px',async({page})=>{
 await page.setViewportSize({width:320,height:840});
 await demo(page);
 const info=await page.evaluate(()=>{
  function srgb(v){const c=v/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
  function luminance(color){
   const v=color.match(/[\d.]+/g).map(Number);
   return .2126*srgb(v[0])+.7152*srgb(v[1])+.0722*srgb(v[2]);
  }
  function contrast(color){const a=luminance(color),b=luminance('rgb(255,255,255)');return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
  const labels=['.metric-label','.metric-foot','.task-description small'];
  return {
   contrast:labels.map(selector=>contrast(getComputedStyle(document.querySelector(selector)).color)),
   date:getComputedStyle(document.querySelector('.date-tag')).fontSize,
   card:document.querySelector('.date-tag').getBoundingClientRect().right,
   width:document.documentElement.clientWidth
  };
 });
 for(const value of info.contrast)expect(value,'body text must meet WCAG AA against original white card').toBeGreaterThanOrEqual(4.5);
 expect(parseFloat(info.date),'date text must be displayed rather than icon-only').toBeGreaterThanOrEqual(11);
 expect(info.card).toBeLessThanOrEqual(info.width+2);
 const fit=await viewportFit(page);
 expect(fit.scroll).toBeLessThanOrEqual(fit.client+2);
});
test('Back and Forward navigate sections without exposing patient details in the URL',async({page})=>{
 await page.setViewportSize({width:1280,height:820});
 await demo(page);
 await page.locator('.sidebar-nav').getByRole('button',{name:'My care planner'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('My care planner');
 await page.locator('.sidebar-nav').getByRole('button',{name:'Antenatal visits'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Antenatal visits');
 await page.evaluate(()=>window.history.back());
 await expect(page.locator('.topbar-current-page')).toHaveText('My care planner');
 await page.evaluate(()=>window.history.forward());
 await expect(page.locator('.topbar-current-page')).toHaveText('Antenatal visits');
 expect(new URL(page.url()).search).toBe('');
 expect(new URL(page.url()).hash).toBe('');
});
test('warning and birth modals contain keyboard focus and return it to their triggers',async({page})=>{
 await page.setViewportSize({width:1280,height:820});
 await demo(page);
 const warning=page.getByRole('button',{name:'Health warning signs'});
 await warning.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog',{name:'When to seek urgent help'});
 await expect(dialog).toBeVisible();
 await expect(page.getByRole('button',{name:'Close'})).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(dialog.locator('button').last()).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(warning).toBeFocused();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Baby & growth'}).click();
 const birth=page.getByRole('button',{name:/Record baby.s arrival/i});
 await birth.focus();await page.keyboard.press('Enter');
 const birthDialog=page.getByRole('dialog',{name:/Hello, little one/});
 await expect(birthDialog).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(birthDialog).not.toBeVisible();
 await expect(birth).toBeFocused();
});
test('skip link and narrow-screen long text remain operable',async({page})=>{
 await page.setViewportSize({width:360,height:760});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('textbox',{name:/What should we call you/}).fill(words);
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
 const fit=await viewportFit(page);
 expect(fit.scroll).toBeLessThanOrEqual(fit.client+2);
 const skip=page.getByRole('link',{name:'Skip to main content'});
 await skip.focus();
 await expect(skip).toBeFocused();
 await skip.press('Enter');
 expect(new URL(page.url()).hash).toBe('#mamamwana-main');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar.sidebar-open')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
});
