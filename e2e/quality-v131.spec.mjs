import {test,expect,devices} from '@playwright/test';
import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

async function demo(page){
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
async function openHub(page){
 if(await page.getByRole('button',{name:'Open navigation'}).isVisible())await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Care journey hub'}).click();
 await expect(page.getByRole('heading',{name:'Care journey hub'})).toBeVisible();
}
function fit(page){
 return page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
}
test('mobile drawer excludes hidden links from keyboard navigation and restores focus',async({page})=>{
 await page.setViewportSize({width:390,height:740});
 await demo(page);
 const drawer=page.locator('#mamamwana-primary-navigation');
 const open=page.getByRole('button',{name:'Open navigation'});
 await expect(drawer).toHaveAttribute('inert','');
 await open.focus();await page.keyboard.press('Enter');
 await expect(drawer).not.toHaveAttribute('inert');
 await expect(open).toHaveAttribute('aria-expanded','true');
 const close=page.getByRole('button',{name:'Close navigation'});
 await expect(close).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(drawer.locator('.sidebar-footer button')).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(close).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(drawer).toHaveAttribute('inert','');
 await expect(open).toBeFocused();
 await expect(open).toHaveAttribute('aria-expanded','false');
 await page.setViewportSize({width:1024,height:740});
 await expect(drawer).not.toHaveAttribute('inert');
});
test('short landscape view keeps the mobile drawer and warning dialog navigable',async({page})=>{
 await page.setViewportSize({width:740,height:390});
 await demo(page);
 await page.getByRole('button',{name:'Open navigation'}).click();
 const nav=page.locator('.sidebar-nav');
 await expect(nav).toBeVisible();
 const scroll=await nav.evaluate(el=>({client:el.clientHeight,total:el.scrollHeight}));
 expect(scroll.client).toBeGreaterThan(0);
 expect(scroll.total).toBeGreaterThanOrEqual(scroll.client);
 await page.locator('.sidebar-support').getByRole('button',{name:'When to seek help'}).click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
 await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toHaveCount(0);
 const viewport=await fit(page);expect(viewport.scroll).toBeLessThanOrEqual(viewport.viewport+2);
});
test('keyboard focus and WCAG-level text contrast remain clear in core UI',async({page})=>{
 await page.setViewportSize({width:1280,height:850});
 await demo(page);
 const action=page.getByRole('button',{name:'Continue daily care'});
 await action.focus();
 const info=await action.evaluate(element=>{
  const srgb=x=>{const c=x/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
  const lum=color=>{const v=color.match(/[\d.]+/g).map(Number);return .2126*srgb(v[0])+.7152*srgb(v[1])+.0722*srgb(v[2])};
  const label=element.querySelector('.mm13-action-label');
  const title=element.querySelector('.mm13-action-copy strong');
  const background=getComputedStyle(element).backgroundColor;
  const ratio=node=>{const a=lum(getComputedStyle(node).color),b=lum(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  return {outline:getComputedStyle(element).outlineStyle,ratios:[ratio(label),ratio(title)]};
 });
 expect(info.outline).toBe('solid');
 for(const contrast of info.ratios)expect(contrast).toBeGreaterThanOrEqual(4.5);
 await openHub(page);
 const search=page.getByRole('searchbox',{name:'Search journal entries'});
 await search.focus();
 await expect(search).toBeFocused();
 await expect(page.locator('.m12-filters button[aria-pressed="true"]')).toHaveCount(1);
});
for(const [name,device] of [['Android / Pixel 7',devices['Pixel 7']],['iPhone 13 viewport / Chromium',devices['iPhone 13']]]){
 test('device-emulated '+name+' preserves care journey and bottom navigation',async({browser},testInfo)=>{
  const {defaultBrowserType:_ignored,...settings}=device;
  const ctx=await browser.newContext({...settings});
  try{
   const page=await ctx.newPage();
   await demo(page);
   await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
   await expect(page.locator('.sidebar')).toHaveAttribute('inert','');
   await openHub(page);
   const viewport=await fit(page);expect(viewport.scroll).toBeLessThanOrEqual(viewport.viewport+2);
   await expect(page.getByRole('searchbox',{name:'Search journal entries'})).toBeVisible();
   await page.screenshot({path:testInfo.outputPath('v131-device-'+name.replace(/[^a-z0-9]+/gi,'-')+'.png'),fullPage:true,animations:'disabled'});
  }finally{await ctx.close();}
 });
}
test('version label and optional reduced motion remain consistent',async({page})=>{
 await page.setViewportSize({width:390,height:780});
 await page.emulateMedia({reducedMotion:'reduce'});
 await demo(page);
 await expect(page.locator('.sidebar-footer')).toContainText('v'+version);
 const state=await page.evaluate(()=>({media:matchMedia('(prefers-reduced-motion: reduce)').matches,transition:getComputedStyle(document.querySelector('.mm13-action-card')).transitionDuration}));
 expect(state.media).toBe(true);
 expect(state.transition).toBe('0s');
});
