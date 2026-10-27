import {test,expect} from '@playwright/test';
const sections=[
 'Overview','Family journeys','My pregnancy','Daily care','Antenatal visits',
 'My care planner','Care journey hub','Birth preparation','Baby & growth',
 'Clinical timeline','Care guidance','Privacy & records','Health library'
];
async function demo(page,width){
 await page.setViewportSize({width,height:850});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.mm13-today')).toBeVisible();
}
async function visit(page,width,section){
 if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:section,exact:true}).click();
 await expect(page.locator(width<=760?'.mm-phone-page-label strong':'.topbar-current-page')).toHaveText(section);
}
async function audit(page){
 return page.evaluate(()=>{
  const viewport=document.documentElement.clientWidth;
  const offenders=[];
  const selectors=[
   '#mamamwana-main .page-content','#mamamwana-main .panel','#mamamwana-main .ch-card',
   '#mamamwana-main .care07-form','#mamamwana-main .ch-reference',
   '#mamamwana-main .ch-dose','#mamamwana-main .v4-delete-row',
   '#mamamwana-main .v4-review-entry','#mamamwana-main .v5-rights-options',
   '#mamamwana-main .family09-form','#mamamwana-main .family09-records',
   '#mamamwana-main .v4-article','#mamamwana-main .mm-current-feature',
   '#mamamwana-main .mm14-family-card','#mamamwana-main .m12-layout'
  ];
  for(const el of document.querySelectorAll(selectors.join(','))){
   const style=getComputedStyle(el),r=el.getBoundingClientRect();
   if(style.display==='none'||!r.width||!r.height)continue;
   if(r.left < -3 || r.right > viewport+3)offenders.push({selector:el.className,left:Math.round(r.left),right:Math.round(r.right),viewport});
  }
  const controls=[...document.querySelectorAll('#mamamwana-main input,#mamamwana-main select,#mamamwana-main textarea,#mamamwana-main button,#mamamwana-main a')];
  for(const el of controls){
   const style=getComputedStyle(el),r=el.getBoundingClientRect();
   if(style.display==='none'||style.visibility==='hidden'||r.width<2||r.height<2)continue;
   // A deliberately horizontally scrollable age strip has its own local viewport.
   if(el.closest('.milestone-tabs,.weeks-strip,.m12-filters'))continue;
   const owner=el.closest('.panel,.ch-card,.v4-article,.family09-form,.mm14-family-summary,.mm13-today,.care07-form,.page-content');
   if(!owner)continue;
   const bounds=owner.getBoundingClientRect();
   if(r.left < bounds.left-4||r.right>bounds.right+4){
    offenders.push({selector:(el.tagName.toLowerCase()+' '+(el.className||'')).slice(0,90),
     left:Math.round(r.left),right:Math.round(r.right),container:Math.round(bounds.left)+'..'+Math.round(bounds.right)});
   }
  }
  return {viewport,scroll:document.documentElement.scrollWidth,offenders:offenders.slice(0,14)};
 });
}
for(const width of [320,390,768,1024,1440]){
 test('all feature sections and controls fit containers at '+width+'px',async({page})=>{
  await demo(page,width);
  for(const section of sections){
   await visit(page,width,section);
   const result=await audit(page);
   expect(result.scroll,section+' horizontal document scroll at '+width).toBeLessThanOrEqual(result.viewport+2);
   expect(result.offenders,section+' elements outside viewport/card at '+width).toEqual([]);
  }
 });
}
test('largest display preference keeps private-care panels contained on a narrow phone',async({page})=>{
 await demo(page,320);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('combobox',{name:'Text size'}).selectOption('largest');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 for(const section of ['My care planner','Care guidance','Privacy & records','Family journeys']){
  await visit(page,320,section);
  const result=await audit(page);
  expect(result.scroll).toBeLessThanOrEqual(result.viewport+2);
  expect(result.offenders,section+' extra-large text').toEqual([]);
 }
});
test('child profile history and multi-field editors fit within family panel on phone',async({page})=>{
 await demo(page,360);
 await visit(page,360,'Family journeys');
 const form=page.locator('.family09-form').first();
 await form.locator('input').first().fill('Sample Child');
 await form.getByRole('button',{name:/Add child profile/i}).click();
 await expect(page.locator('.family09-records')).toBeVisible();
 const result=await audit(page);
 expect(result.scroll).toBeLessThanOrEqual(result.viewport+2);
 expect(result.offenders).toEqual([]);
});
test('critical privacy and safety dialogues fit visible phone viewport',async({page})=>{
 await demo(page,320);
 await page.getByRole('button',{name:'Display preferences'}).click();
 const box=page.getByRole('dialog',{name:'Display and accessibility'});
 await expect(box).toBeVisible();
 const fits=await box.evaluate(el=>{
  const r=el.getBoundingClientRect();return {left:r.left,right:r.right,viewport:document.documentElement.clientWidth,scroll:el.scrollWidth,client:el.clientWidth};
 });
 expect(fits.left).toBeGreaterThanOrEqual(0);
 expect(fits.right).toBeLessThanOrEqual(fits.viewport+2);
 expect(fits.scroll).toBeLessThanOrEqual(fits.client+2);
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Health warning signs'}).last().click();
 const urgent=page.getByRole('dialog',{name:'When to seek urgent help'});
 await expect(urgent).toBeVisible();
 await expect(urgent).toBeInViewport({ratio:0.1});
 await page.keyboard.press('Escape');
});
