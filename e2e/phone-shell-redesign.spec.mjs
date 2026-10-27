import {test,expect} from '@playwright/test';
async function demo(page,width,height=820){
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm-phone-pagebar')).toBeVisible();
}
for(const width of [320,360,375,390,430,570,760]){
 test('redesigned responsive header and footer at '+width+'px',async({page})=>{
  await demo(page,width);
  const shell=await page.evaluate(()=>{
   const rect=q=>{const x=document.querySelector(q).getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width,height:x.height}};
   const parts=['.topbar .hamburger','.topbar .mm-mobile-lockup','.topbar .locale-switch select','.topbar .mm14-topbar'].map(rect);
   const page=rect('.mm-phone-pagebar');
   const safe=rect('.mm-phone-urgent');
   return {parts,page,safe,doc:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth};
  });
  expect(shell.doc).toBeLessThanOrEqual(width+2);
  for(const box of shell.parts){
   expect(box.left).toBeGreaterThanOrEqual(0);
   expect(box.right).toBeLessThanOrEqual(width+1);
  }
  expect(shell.parts[0].width).toBeGreaterThanOrEqual(44);
  expect(shell.parts[2].width).toBeGreaterThanOrEqual(44);
  expect(shell.parts[3].width).toBeGreaterThanOrEqual(44);
  for(let i=1;i<shell.parts.length;i++)expect(shell.parts[i].left).toBeGreaterThanOrEqual(shell.parts[i-1].right-1);
  expect(shell.page.right).toBeLessThanOrEqual(width+1);
  expect(shell.safe.width).toBeGreaterThanOrEqual(44);
  expect(shell.safe.top).toBeGreaterThanOrEqual(shell.parts[0].bottom-1);
  await expect(page.locator('.mm-mobile-lockup img')).toHaveAttribute('src','/icon.svg');
  await expect(page.locator('.mm-phone-mode')).toHaveCount(0);
  await expect(page.locator('.demo-banner')).toContainText('Sample data only');
  const footer=page.locator('.mm-app-footer');
  await expect(footer.locator('.mm-footer-top')).toBeHidden();
  await expect(footer.locator('.mm-phone-footer-card')).toBeVisible();
  await expect(footer.locator('.mm-phone-footer-version')).toContainText(/^v1\.4\.0$/);
  await footer.scrollIntoViewIfNeeded();
  const bounding=await footer.boundingBox();
  expect(bounding.height).toBeLessThanOrEqual(165);
  const trust=footer.locator('.mm-footer-phone-trust');
  await trust.locator('summary').click();
  await expect(trust).toHaveAttribute('open','');
  await expect(trust).toContainText('not medical advice');
  await trust.locator('summary').click();
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const gap=await page.evaluate(()=>({end:document.querySelector('.mm-app-footer').getBoundingClientRect().bottom,
   start:document.querySelector('.mobile-tabs').getBoundingClientRect().top}));
  expect(gap.end).toBeLessThanOrEqual(gap.start+2);
 });
}
test('phone shell remains keyboard-accessible and keeps all-section navigation',async({page})=>{
 await demo(page,320);
 const menu=page.getByRole('button',{name:'Open navigation'});
 await menu.click();
 await expect(page.getByRole('button',{name:'Close navigation'})).toBeFocused();
 await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
 await page.keyboard.press('Escape');
 const safety=page.getByRole('button',{name:'Health warning signs'}).last();
 await safety.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog',{name:'When to seek urgent help'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(safety).toBeFocused();
 await page.getByRole('button',{name:'Display preferences'}).click();
 await expect(page.getByRole('dialog',{name:'Display and accessibility'})).toBeVisible();
 await page.keyboard.press('Escape');
});
test('desktop remains visually and functionally unchanged',async({page})=>{
 await page.setViewportSize({width:1366,height:860});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.topbar-hello')).toBeVisible();
 await expect(page.locator('.mm-mobile-lockup')).toBeHidden();
 await expect(page.locator('.mm-phone-pagebar')).toBeHidden();
 await expect(page.locator('.mm-phone-footer-card')).toBeHidden();
 await expect(page.locator('.mm-footer-top')).toBeVisible();
 await expect(page.locator('.mm-footer-links button')).toHaveCount(3);
 const status=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(status.scroll).toBeLessThanOrEqual(status.client+2);
});
