import {test,expect} from '@playwright/test';

async function demo(page,width=390){
 await page.setViewportSize({width,height:840});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function go(page,width,name){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name,exact:true}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText(name);
}
test('Today actions prioritize care, upcoming visits and journey without clinical claims',async({page})=>{
 await demo(page,1280);
 const today=page.getByRole('region',{name:'Your day at a glance'});
 await expect(today).toBeVisible();
 await expect(today).toContainText('Personal reminders, not medical advice');
 await expect(today.getByRole('button')).toHaveCount(3);
 await today.getByRole('button',{name:'Continue daily care'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Daily care');
 await go(page,1280,'Overview');
 await today.getByRole('button',{name:'Review planned visits'}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText('Antenatal visits');
 await go(page,1280,'Overview');
 await today.getByRole('button',{name:'Open care journey'}).click();
 await expect(page.getByRole('heading',{name:'Care journey hub'})).toBeVisible();
});
test('Grouped sidebar retains every section and its active state',async({page})=>{
 await demo(page,1280);
 const groups=page.locator('.mm13-nav-group');
 await expect(groups).toHaveCount(3);
 await expect(groups.nth(0)).toContainText('Daily essentials');
 await expect(groups.nth(1)).toContainText('Family & milestones');
 await expect(groups.nth(2)).toContainText('Records & support');
 await expect(page.locator('.sidebar-nav .nav-item')).toHaveCount(13);
 await go(page,1280,'Care journey hub');
 await expect(page.locator('.sidebar-nav [aria-current="page"]')).toHaveCount(1);
});
test('Care timeline search, status filter, sort and private details remain controlled',async({page})=>{
 await demo(page,1280);
 await go(page,1280,'Antenatal visits');
 await page.getByRole('button',{name:'Add visit'}).click();
 await page.getByRole('textbox',{name:'Facility / contact'}).fill('Sample Family Clinic');
 await page.getByRole('button',{name:'Save visit'}).click();
 await go(page,1280,'Care journey hub');
 const search=page.getByRole('searchbox',{name:'Search journal entries'});
 await search.fill('Sample Family Clinic');
 await expect(page.locator('.m12-event')).toHaveCount(1);
 await expect(page.locator('.mm13-event-details')).not.toHaveAttribute('open');
 await page.locator('.mm13-event-details summary').click();
 await expect(page.locator('.mm13-event-details')).toHaveAttribute('open','');
 await search.fill('Unrelated sample text');
 await expect(page.getByRole('heading',{name:'No entries match this view'})).toBeVisible();
 await page.getByRole('button',{name:'Clear search and status'}).click();
 await expect(page.locator('.m12-event')).toHaveCount(1);
 await page.getByRole('combobox',{name:'Filter journal status'}).selectOption('recorded');
 await expect(page.locator('.m12-event')).toHaveCount(0);
 await page.getByRole('combobox',{name:'Filter journal status'}).selectOption('planned');
 await expect(page.locator('.m12-event')).toHaveCount(1);
 await page.getByRole('combobox',{name:'Sort journal entries'}).selectOption('oldest');
 await expect(page.locator('.m12-event')).toHaveCount(1);
 await expect(page.locator('.m12-brief-text')).toHaveCount(0);
});
for(const width of [320,390,768,1024,1440]){
 test('premium dashboard and care controls fit '+width+'px without clipping',async({page})=>{
  await demo(page,width);
  await expect(page.locator('.mm13-today')).toBeVisible();
  const bounds=await page.locator('.mm13-action-card').evaluateAll(nodes=>nodes.map(n=>({left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right,height:n.getBoundingClientRect().height})));
  for(const b of bounds){expect(b.left).toBeGreaterThanOrEqual(-2);expect(b.right).toBeLessThanOrEqual(width+2);expect(b.height).toBeGreaterThanOrEqual(44);}
  await go(page,width,'Care journey hub');
  await expect(page.getByRole('searchbox',{name:'Search journal entries'})).toBeVisible();
  const size=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.viewport+2);
 });
}
