import {test,expect} from '@playwright/test';

async function enterDemo(page){
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function noHorizontalOverflow(page,context){
 const violations=await page.evaluate(()=>{
  const width=document.documentElement.clientWidth;
  const problems=[];
  if(document.documentElement.scrollWidth>width+2)problems.push('document');
  for(const element of document.querySelectorAll('.topbar,.topbar-actions,.page-content,.hero-card,.metric-card,.panel,.family09,.sharing10,.care07,.ch-card,.legacy10')){
   const css=getComputedStyle(element),rect=element.getBoundingClientRect();
   if(css.display==='none'||rect.height===0||rect.bottom<0||rect.top>innerHeight)continue;
   if(rect.left < -2 || rect.right>width+2)problems.push(String(element.className).slice(0,80));
  }
  return problems.slice(0,12);
 });
 expect(violations,context).toEqual([]);
}
test('visual atmosphere choices are interactive, persistent and private',async({page})=>{
 await page.setViewportSize({width:1280,height:850});
 await enterDemo(page);
 const customize=page.getByRole('button',{name:'Customize visual atmosphere'});
 await customize.click();
 await expect(page.getByRole('group',{name:'Choose visual atmosphere'})).toBeVisible();
 await page.getByRole('button',{name:/Gentle Bloom/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-atmosphere','blush');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-atmosphere','blush');
 await enterDemo(page);
 await customize.click();
 await page.getByRole('button',{name:/Golden Morning/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-atmosphere','sunrise');
});
test('keyboard command navigation opens, searches, changes pages, and dismisses',async({page})=>{
 await page.setViewportSize({width:1280,height:850});
 await enterDemo(page);
 await page.keyboard.press('Control+k');
 const command=page.getByRole('dialog',{name:'Quick navigation'});
 await expect(command).toBeVisible();
 await command.getByRole('searchbox',{name:'Search MamaMwana pages'}).fill('clinical');
 await expect(command.locator('.studio-command-item')).toHaveCount(1);
 await command.locator('.studio-command-item').click();
 await expect(command).not.toBeVisible();
 await expect(page.locator('.topbar-current-page')).toHaveText('Clinical timeline');
 await page.getByRole('button',{name:'Search and navigate pages'}).click();
 await expect(command).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(command).not.toBeVisible();
});
for(const width of [320,360,390,430,570,768,1024,1440,1920]){
 test('studio layouts have no horizontal clipping at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:870});
  await enterDemo(page);
  await noHorizontalOverflow(page,'dashboard at '+width);
  if(width<=760){
   await page.getByRole('button',{name:'Open navigation'}).click();
   await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys',exact:true}).click();
  }else{
   await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys',exact:true}).click();
  }
  await noHorizontalOverflow(page,'family at '+width);
  await page.getByRole('button',{name:'Search and navigate pages'}).click();
  await expect(page.getByRole('dialog',{name:'Quick navigation'})).toBeVisible();
  await noHorizontalOverflow(page,'command navigation at '+width);
  await page.keyboard.press('Escape');
 });
}
test('navigation controls remain keyboard accessible',async({page})=>{
 await page.setViewportSize({width:390,height:800});
 await enterDemo(page);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar.sidebar-open')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
 await page.getByRole('button',{name:'Search and navigate pages'}).click();
 await expect(page.getByRole('dialog',{name:'Quick navigation'})).toBeVisible();
 await page.getByRole('button',{name:'Close quick navigation'}).click();
 await expect(page.getByRole('dialog',{name:'Quick navigation'})).not.toBeVisible();
});
