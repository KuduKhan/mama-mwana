import {test,expect} from '@playwright/test';
async function demo(page,width,height=820){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
for(const width of [320,360,390,430,540,760]){
 test('compact phone header and footer '+width+'px',async({page})=>{
  await demo(page,width);
  const footer=page.locator('.mm-app-footer'),trust=footer.locator('.mm-footer-phone-trust');
  await expect(trust).toBeVisible();
  await expect(footer.locator('.mm-footer-links button')).toHaveCount(3);
  await expect(footer.locator('.mm-footer-links')).toBeHidden();
  const m=await page.evaluate(()=>{
   const rect=q=>{const r=document.querySelector(q).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
   return {vw:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
    header:rect('.topbar'),pagebar:rect('.mm-phone-pagebar'),
    firstRow:['.topbar .hamburger','.mm-mobile-brand','.mm-mobile-wordmark','.topbar .locale-switch select','.topbar .mm14-topbar'].map(rect),
    links:[...document.querySelectorAll('.mm-footer-links button')].map(x=>x.getBoundingClientRect().height)};
  });
  expect(m.scroll).toBeLessThanOrEqual(m.vw+2);
  expect(m.header.right).toBeLessThanOrEqual(m.vw+1);
  expect(m.pagebar.right).toBeLessThanOrEqual(m.vw+1);
  for(const i of [0,3,4])expect(m.firstRow[i].width).toBeGreaterThanOrEqual(44);
  for(let i=1;i<m.firstRow.length;i++){
   expect(m.firstRow[i].left).toBeGreaterThanOrEqual(m.firstRow[i-1].right-1);
   expect(m.firstRow[i].right).toBeLessThanOrEqual(m.vw+1);
  }
  for(const h of m.links)expect(h).toBeGreaterThanOrEqual(44);
  await footer.scrollIntoViewIfNeeded();
  const b=await footer.boundingBox();
  expect(b.height).toBeLessThanOrEqual(225);
  await trust.locator('summary').click();
  await expect(trust).toHaveAttribute('open','');
  await expect(trust).toContainText('not medical advice');
  await trust.locator('summary').click();
  await expect(trust).not.toHaveAttribute('open','');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const clearance=await page.evaluate(()=>({foot:document.querySelector('.mm-app-footer').getBoundingClientRect().bottom,dock:document.querySelector('.mobile-tabs').getBoundingClientRect().top}));
  expect(clearance.foot).toBeLessThanOrEqual(clearance.dock+2);
 });
}
test('all full navigation links remain accessible from one mobile menu',async({page})=>{
 await demo(page,320);
 await expect(page.locator('.mm-app-footer .mm-footer-links')).toBeHidden();
 for(const label of ['Family journeys','Care guidance','Privacy & records']){
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.sidebar-nav').getByRole('button',{name:label}).click();
  await expect(page.locator('.mm-phone-page-label strong')).toHaveText(label);
 }
});
test('language and display preferences remain usable at 320px',async({page})=>{
 await demo(page,320);
 await page.getByRole('combobox',{name:'Language / Lugha'}).selectOption('sw');
 await expect(page.locator('html')).toHaveAttribute('lang','sw');
 await page.getByRole('button',{name:'Display preferences'}).click();
 await expect(page.getByRole('dialog',{name:'Mwonekano na ufikivu'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Display preferences'})).toBeFocused();
});
test('full desktop footer and header are preserved',async({page})=>{
 await demo(page,1280,860);
 await expect(page.locator('.mm-footer-trust')).toBeVisible();
 await expect(page.locator('.mm-footer-identity>p')).toBeVisible();
 await expect(page.locator('.mm-footer-phone-trust')).toBeHidden();
 await expect(page.locator('.mm-phone-pagebar')).toBeHidden();
 await expect(page.locator('.topbar-hello')).toBeVisible();
});
