import {test,expect} from '@playwright/test';
const sections=['Overview','Family journeys','My pregnancy','Daily care','Antenatal visits','My care planner','Care journey hub','Birth preparation','Baby & growth','Clinical timeline','Care guidance','Privacy & records','Health library'];
async function demo(page,width){
 await page.setViewportSize({width,height:900});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm22-smart-home')).toBeVisible();
}
async function navigate(page,width,name){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name,exact:true}).click();
}
test('overview surfaces keep matching gutters and consistent spacing at five breakpoints',async({page})=>{
 for(const width of [320,390,768,1024,1440]){
  await demo(page,width);
  const sizes=await page.evaluate(()=>{
   const w=document.documentElement.clientWidth;
   const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null};
   return {w,scroll:document.documentElement.scrollWidth,hero:rect('.mm20-showcase'),smart:rect('.mm22-smart-home'),today:rect('.mm13-today')};
  });
  expect(sizes.scroll,'scroll width at '+width).toBeLessThanOrEqual(sizes.w+2);
  for(const name of ['hero','smart','today']){
   const box=sizes[name];
   expect(box,name+' missing at '+width).not.toBeNull();
   expect(box.left).toBeGreaterThanOrEqual(-2);
   expect(box.right).toBeLessThanOrEqual(sizes.w+2);
  }
  expect(Math.abs(sizes.smart.left-sizes.hero.left),'misaligned cards').toBeLessThanOrEqual(2);
  expect(sizes.smart.top-sizes.hero.bottom,'card gap').toBeGreaterThanOrEqual(10);
  expect(sizes.smart.top-sizes.hero.bottom,'oversized gap').toBeLessThan(65);
 }
});
test('all 13 app navigation icons share one optical size and page surfaces do not overflow',async({page})=>{
 await demo(page,1024);
 const dimensions=await page.locator('.sidebar-nav .nav-item>svg:first-child').evaluateAll(nodes=>nodes.map(n=>{
  const r=n.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);
 }));
 expect(dimensions).toHaveLength(13);
 expect(new Set(dimensions).size).toBe(1);
 for(const name of sections){
  await navigate(page,1024,name);
  const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll,'overflow in '+name).toBeLessThanOrEqual(widths.client+2);
 }
});
test('dark and light appearance preserve visible preview and without horizontal scroll',async({page})=>{
 await demo(page,390);
 await page.getByRole('button',{name:'Display preferences'}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByRole('combobox',{name:'Appearance theme'}).selectOption('dark');
 await expect(page.locator('html')).toHaveAttribute('data-mm-theme','dark');
 await expect(page.locator('.mm20-showcase')).toBeVisible();
 await dialog.getByRole('combobox',{name:'Appearance theme'}).selectOption('light');
 await expect(page.locator('html')).toHaveAttribute('data-mm-theme','light');
 const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(widths.scroll).toBeLessThanOrEqual(widths.client+2);
});
test('system and user reduced motion disable all decorative page entrances',async({page})=>{
 await demo(page,1024);
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('.page-content').first().evaluate(n=>getComputedStyle(n).animationName)).toBe('none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('dialog').getByRole('combobox',{name:'Motion'}).selectOption('reduce');
 await expect(page.locator('html')).toHaveAttribute('data-mm-motion','reduce');
 expect(await page.locator('.page-content').first().evaluate(n=>getComputedStyle(n).animationName)).toBe('none');
});
