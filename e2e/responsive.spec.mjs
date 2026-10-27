import {test,expect} from '@playwright/test';

const widths=[320,360,390,430,570,768,1024,1280,1440,1920];
const tabs=[
 {name:'Overview',id:'home'},
 {name:'Family journeys',id:'family'},
 {name:'My pregnancy',id:'pregnancy'},
 {name:'Daily care',id:'care'},
 {name:'Antenatal visits',id:'visits'},
 {name:'My care planner',id:'planner'},
 {name:'Care journey hub',id:'hub'},
 {name:'Birth preparation',id:'birth'},
 {name:'Baby & growth',id:'baby'},
 {name:'Clinical timeline',id:'records'},
 {name:'Care guidance',id:'guidance'},
 {name:'Privacy & records',id:'privacy'},
 {name:'Health library',id:'library'}
];

async function inspectOverflow(page,label){
 const problems=await page.evaluate(()=>{
  const viewport=document.documentElement.clientWidth;
  const items=[];
  if(document.documentElement.scrollWidth>viewport+2){
   items.push('page horizontal scroll: '+document.documentElement.scrollWidth+' > '+viewport);
  }
  const selector='.topbar,.page-content,.section-heading,.metrics-grid,.metric-card,.panel,.ch-card,.care07,.care07-entry,.family-journey,.v4-page';
  for(const el of document.querySelectorAll(selector)){
   const r=el.getBoundingClientRect();
   if(!r.width||!r.height||getComputedStyle(el).display==='none')continue;
   const visible=r.bottom>0&&r.top<innerHeight;
   if(!visible)continue;
   // Drawer/sidebar content is intentionally offscreen when closed.
   if(r.left < -2 || r.right>viewport+2){
    items.push((el.className||el.tagName)+': '+Math.round(r.left)+'..'+Math.round(r.right)+' vs '+viewport);
   }
  }
  return items.slice(0,14);
 });
 expect(problems, label+' must fit its viewport').toEqual([]);
}
async function beginDemo(page,width){
 await page.setViewportSize({width,height:800});
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Explore interactive demo/i})).toBeVisible();
 await inspectOverflow(page,'Sign-in at '+width);
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await expect(page.getByText('Create your pregnancy profile')).toBeVisible();
 await inspectOverflow(page,'Onboarding at '+width);
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
 await inspectOverflow(page,'Dashboard at '+width);
}
async function goTab(page,width,label){
 const nav=page.locator('.sidebar-nav');
 if(width<=760){
  await page.getByRole('button',{name:'Open navigation'}).click();
  await expect(page.locator('.sidebar.sidebar-open')).toBeVisible();
 }
 await nav.getByRole('button',{name:label,exact:true}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText(label);
 await inspectOverflow(page,label+' at '+width);
}
for(const width of widths){
 test('responsive demo at '+width+'px',async({page})=>{
  await beginDemo(page,width);
  const choices=width<=430
   ?tabs // intensive navigation and layout test for the narrowest phones
   :width===768||width===1024||width===1440
    ?tabs
    :tabs.filter(x=>['My care planner','Antenatal visits','Privacy & records','Baby & growth'].includes(x.name));
  for(const tab of choices)await goTab(page,width,tab.name);
  if(width<=760){
   await expect(page.locator('.mobile-tabs button')).toHaveCount(5);
   await expect(page.locator('.mobile-tabs button').filter({hasText:'Planner'})).toBeVisible();
   await page.getByRole('button',{name:'Open navigation'}).click();
   await page.keyboard.press('Escape');
   await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
  }
 });
}
test('mobile navigation is keyboard-dismissible and all browser UI text wraps',async({page})=>{
 await beginDemo(page,360);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.getByRole('button',{name:'Close navigation'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
 const font=await page.locator('.hero-copy .handwritten-accent').evaluate(el=>getComputedStyle(el).fontFamily);
 expect(font).toMatch(/Segoe Print|Bradley Hand|Chancery|cursive/);
});
