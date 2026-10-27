import {test,expect} from '@playwright/test';
async function demo(page,width){
 await page.setViewportSize({width,height:820});
 await page.goto('/');
 await expect(page.locator('.brand-icon img').first()).toHaveAttribute('src','/icon.svg');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
}
test('auth remains protected unless live release is explicitly authorized',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Explore interactive demo/i})).toBeVisible();
 await expect(page.getByText('This repository is ready for Supabase')).toHaveCount(0);
});
for(const width of [320,360,390,430,768,1024,1440]){
 test('logo, header controls and footer fit at '+width+'px',async({page})=>{
  await demo(page,width);
  if(width<=760){
   const menu=page.getByRole('button',{name:'Open navigation'});
   await expect(menu).toBeVisible();
   const center=await menu.evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}});
   const element=await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.getAttribute('aria-label'),center);
   expect(element).toBe('Open navigation');
   await menu.click();await expect(page.getByRole('button',{name:'Close navigation'})).toBeVisible();
   await page.getByRole('button',{name:'Close navigation'}).click();
   await expect(page.locator('.mm-mobile-brand img')).toHaveAttribute('src','/icon.svg');
  }
  await expect(page.locator('.mm-app-footer')).toBeVisible();
  if(width<=760)await expect(page.locator('.mm-phone-footer-brand img')).toHaveAttribute('src','/icon.svg');
  else await expect(page.locator('.mm-app-footer .brand img')).toHaveAttribute('src','/icon.svg');
  await expect(page.locator('.mm-footer-links button')).toHaveCount(3);
  const dims=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(dims.doc).toBeLessThanOrEqual(dims.client+2);
 });
}
test('footer links navigate to existing secure sections',async({page})=>{
 await demo(page,1280);
 const footer=page.locator('.mm-app-footer');
 await footer.getByRole('button',{name:'Privacy & records'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Privacy & records');
 await footer.getByRole('button',{name:'Family journeys'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Family journeys');
 await footer.getByRole('button',{name:'Care guidance'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Care guidance');
});
