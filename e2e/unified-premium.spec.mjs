import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
async function demo(page,width){
 await page.setViewportSize({width,height:840});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
}
async function go(page,width,section){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText(section);
}
test('older care planner renders current release with premium feature card',async({page})=>{
 await demo(page,1280);
 await go(page,1280,'My care planner');
 const heading=page.locator('.mm-current-feature');
 await expect(heading.getByRole('heading',{name:'My care planner'})).toBeVisible();
 await expect(heading.locator('.mm-current-release')).toContainText('v'+version);
 await expect(heading).not.toContainText(/v0\.7|version 0\.7/i);
 await expect(page.locator('.care07-metrics')).toBeVisible();
});
test('older clinical and guidance pages show current release without obsolete badges',async({page})=>{
 await demo(page,1280);
 await go(page,1280,'Clinical timeline');
 await expect(page.getByRole('heading',{name:'Clinical record timeline'})).toBeVisible();
 await expect(page.locator('.mm-current-release')).toContainText('v'+version);
 await expect(page.locator('.v4-record-disclaimer')).toContainText('not a certified electronic health record');
 await go(page,1280,'Care guidance');
 await expect(page.getByRole('heading',{name:'Ask about your journey'})).toBeVisible();
 await expect(page.locator('.mm-current-release')).toContainText('v'+version);
 await expect(page.locator('.v4-guidance-head')).toContainText('not a diagnosis');
});
test('privacy rights and family keep current release identity and safe controls',async({page})=>{
 await demo(page,1280);
 await go(page,1280,'Privacy & records');
 await expect(page.locator('.mm-current-release')).toContainText('v'+version);
 await expect(page.getByRole('heading',{name:'Requests and review status'})).toBeVisible();
 await expect(page.locator('.v5-rights')).toContainText('v'+version);
 await expect(page.locator('.v5-rights')).not.toContainText('V0.5');
 await go(page,1280,'Family journeys');
 await expect(page.locator('.family09')).toBeVisible();
 await expect(page.locator('.mm14-family-summary')).toBeVisible();
});
for(const width of [320,390,768,1280]){
 test('premium old-feature sections reflow at '+width+'px',async({page})=>{
  await demo(page,width);
  for(const section of ['My care planner','Clinical timeline','Care guidance','Privacy & records']){
   await go(page,width,section);
   await expect(page.locator('.mm-current-feature')).toBeVisible();
   const boxes=await page.locator('.mm-current-feature-icon,.mm-current-release').evaluateAll(nodes=>nodes.map(n=>({left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right,height:n.getBoundingClientRect().height})));
   for(const box of boxes){
    expect(box.left).toBeGreaterThanOrEqual(-2);
    expect(box.right).toBeLessThanOrEqual(width+2);
   }
   const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   expect(size.scroll).toBeLessThanOrEqual(size.width+2);
  }
 });
}
