import {test,expect} from '@playwright/test';
async function demo(page,width,height=820){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
for(const width of [320,360,375,390,430,570,760]){
 test('premium header and branded footer fit '+width+'px without collision',async({page})=>{
  await demo(page,width);
  const h=page.locator('.mm-renewed-header'),f=page.locator('.mm-renewed-footer');
  await expect(h.locator('.mm-phone-pagebar')).toBeVisible();
  await expect(h.locator('.mm-phone-page-label strong')).toHaveText('Overview');
  await expect(h.locator('.mm-mobile-brand img')).toHaveAttribute('src','/icon.svg');
  await expect(f.locator('.mm-renewed-footer-caption')).toBeVisible();
  await expect(f.locator('.mm-footer-links')).toBeHidden();
  const geometry=await page.evaluate(()=>{
   const r=x=>{const b=document.querySelector(x).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,w:b.width,h:b.height}};
   return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
    menu:r('.mm-renewed-header .hamburger'),logo:r('.mm-renewed-header .mm-mobile-brand'),
    wordmark:r('.mm-renewed-header .mm-mobile-wordmark'),lang:r('.mm-renewed-header .locale-switch select'),
    prefs:r('.mm-renewed-header .mm14-topbar'),page:r('.mm-renewed-header .mm-phone-pagebar'),
    safety:r('.mm-renewed-header .mm-phone-urgent'),footer:r('.mm-renewed-footer')};
  });
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.width+2);
  for(const part of ['menu','logo','wordmark','lang','prefs','page','safety','footer']){
   expect(geometry[part].left,part).toBeGreaterThanOrEqual(-1);
   expect(geometry[part].right,part).toBeLessThanOrEqual(geometry.width+1);
  }
  for(const part of ['menu','lang','prefs','safety']){
   expect(geometry[part].w,part+' width').toBeGreaterThanOrEqual(44);
   expect(geometry[part].h,part+' height').toBeGreaterThanOrEqual(44);
  }
  expect(geometry.logo.left).toBeGreaterThanOrEqual(geometry.menu.right-1);
  expect(geometry.wordmark.left).toBeGreaterThanOrEqual(geometry.logo.right-1);
  expect(geometry.lang.left).toBeGreaterThanOrEqual(geometry.wordmark.right-1);
  expect(geometry.prefs.left).toBeGreaterThanOrEqual(geometry.lang.right-1);
  expect(geometry.page.top).toBeGreaterThanOrEqual(geometry.menu.bottom-1);
  await f.scrollIntoViewIfNeeded();
  const box=await f.boundingBox();
  expect(box.height,'closed footer remains compact').toBeLessThanOrEqual(165);
  const details=f.locator('.mm-footer-phone-trust');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open','');
  await expect(details).toContainText('not medical advice');
  await details.locator('summary').click();
  await expect(details).not.toHaveAttribute('open','');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const a=await page.evaluate(()=>({
   footer:document.querySelector('.mm-renewed-footer').getBoundingClientRect().bottom,
   dock:document.querySelector('.mobile-tabs').getBoundingClientRect().top
  }));
  expect(a.footer).toBeLessThanOrEqual(a.dock+2);
 });
}
test('mobile header settings, bilingual switching and safety are reachable on a narrow phone',async({page})=>{
 await demo(page,320);
 await page.getByRole('combobox',{name:'Language / Lugha'}).selectOption('sw');
 await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await page.getByRole('button',{name:'Display preferences'}).click();
 await expect(page.getByRole('dialog',{name:'Mwonekano na ufikivu'})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
});
test('tablet and desktop headers and footers keep their full navigation and safe content',async({page})=>{
 for(const width of [768,1024,1440]){
  await demo(page,width,900);
  await expect(page.locator('.mm-renewed-header .topbar-hello')).toBeVisible();
  await expect(page.locator('.mm-renewed-header .mm-phone-pagebar')).toBeHidden();
  await expect(page.locator('.mm-renewed-footer .mm-footer-links')).toBeVisible();
  await expect(page.locator('.mm-renewed-footer .mm-footer-trust')).toBeVisible();
  await expect(page.locator('.mm-renewed-footer-caption')).toBeHidden();
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width+2);
 }
});
test('landscape header, dock and footer remain accessible',async({page})=>{
 await demo(page,667,375);
 await expect(page.locator('.mm-renewed-header .mm-phone-pagebar')).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar-support button')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
});
