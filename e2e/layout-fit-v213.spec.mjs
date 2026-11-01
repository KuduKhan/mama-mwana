import {test,expect} from '@playwright/test';

const sections=[
 'Overview','Family journeys','My pregnancy','Daily care','Antenatal visits',
 'My care planner','Care journey hub','Birth preparation','Baby & growth',
 'Clinical timeline','Care guidance','Privacy & records','Health library'
];
const grids=[
 '.mm22-smart-grid','.mm13-action-grid','.metrics-grid','.dashboard-grid',
 '.pregnancy-grid','.two-columns','.care-list','.mm210-grid'
];

async function startDemo(page,width){
 await page.setViewportSize({width,height:850});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm22-smart-home')).toBeVisible();
}
async function navigate(page,width,name){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name,exact:true}).click();
 await expect(page.locator('.topbar-current-page')).toHaveText(name);
}
async function assertLayout(page,description){
 const problems=await page.evaluate(gridSelectors=>{
  const issues=[];
  const width=document.documentElement.clientWidth;
  if(document.documentElement.scrollWidth>width+2){
   issues.push('document scrollWidth '+document.documentElement.scrollWidth+' > '+width);
  }
  const visible=e=>{
   const s=getComputedStyle(e);
   const r=e.getBoundingClientRect();
   return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
  };
  for(const selector of ['.page-content','.section-heading','.mm20-showcase','.mm22-smart-home']){
   for(const el of document.querySelectorAll(selector)){
    if(!visible(el))continue;
    const r=el.getBoundingClientRect();
    if(r.left < -2||r.right>width+2){
     issues.push(selector+' extends '+Math.round(r.left)+'..'+Math.round(r.right));
    }
   }
  }
  for(const selector of gridSelectors){
   for(const grid of document.querySelectorAll('.page-content '+selector)){
    if(!visible(grid))continue;
    const children=[...grid.children].filter(el=>{
     if(!visible(el))return false;
     const p=getComputedStyle(el).position;
     return p!=='absolute'&&p!=='fixed';
    });
    for(let i=0;i<children.length;i++){
     const a=children[i].getBoundingClientRect();
     for(let j=i+1;j<children.length;j++){
      const b=children[j].getBoundingClientRect();
      const dx=Math.min(a.right,b.right)-Math.max(a.left,b.left);
      const dy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
      if(dx>3&&dy>3)issues.push(selector+' has overlapping siblings '+i+'/'+j);
     }
    }
   }
  }
  return issues.slice(0,12);
 },grids);
 expect(problems,description).toEqual([]);
}

for(const width of [320,390,768,1024,1440]){
 test('premium spacing fits navigation and cards at '+width+'px',async({page})=>{
  await startDemo(page,width);
  await assertLayout(page,'Overview at '+width+'px');
  const targets=width===320||width===768||width===1440
   ? sections
   : ['Family journeys','My care planner','Baby & growth','Privacy & records'];
  for(const name of targets){
   await navigate(page,width,name);
   await assertLayout(page,name+' at '+width+'px');
  }
  if(width<=760){
   const targets=page.locator('.mobile-tabs button');
   await expect(targets).toHaveCount(5);
   const heights=await targets.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
   expect(heights.every(h=>h>=44)).toBe(true);
  }
 });
}
test('original flat navigation iconography remains in the premium layout',async({page})=>{
 await startDemo(page,1024);
 await expect(page.locator('.sidebar-nav .nav-item>svg:first-child')).toHaveCount(13);
 await expect(page.locator('.sidebar-nav .mm-gc')).toHaveCount(0);
});
