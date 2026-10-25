import {test,expect} from '@playwright/test';

// Component-level fit and collision checks supplement the existing page-wide overflow suite.
const compact=[320,360,390,412,430,480,570,760];
const NAV=['Overview','Family journeys','My pregnancy','Daily care','Antenatal visits','My care planner',
 'Birth preparation','Baby & growth','Clinical timeline','Care guidance','Privacy & records','Health library'];

async function boot(page,{name='Amina'}={}){
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Explore interactive demo/i})).toBeVisible();
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await expect(page.getByText('Create your pregnancy profile')).toBeVisible();
 await page.getByRole('textbox',{name:/What should we call you/}).fill(name);
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await expect(page.locator('.hero-card')).toBeVisible();
}
async function inspectFit(page,label){
 const issues=await page.evaluate(()=>{
  const viewport=document.documentElement.clientWidth,issues=[];
  if(document.documentElement.scrollWidth>viewport+2)issues.push('document horizontal overflow');
  const selectors=[
   '.topbar','.mobile-welcome','.mobile-header-brand','.topbar-actions','.mobile-welcome-copy',
   '.page-content','.hero-card','.hero-copy','.hero-copy h2','.hero-floating',
   '.metrics-grid','.metric-card','.panel','.ch-card','.family09','.care07',
   '.legacy10','.sharing10','.onboarding-grid','.onboard-form','.auth-panel'
  ];
  for(const el of document.querySelectorAll(selectors.join(','))){
   if(el.closest('.sidebar') || getComputedStyle(el).display==='none')continue;
   const rect=el.getBoundingClientRect();
   if(rect.height===0||rect.width===0)continue;
   if(rect.left<-2||rect.right>viewport+2)issues.push(el.className+' outside viewport');
  }
  const header=document.querySelector('.topbar');
  const left=header?.querySelector('.topbar-left')?.getBoundingClientRect();
  const right=header?.querySelector('.topbar-actions')?.getBoundingClientRect();
  if(left&&right&&left.width&&right.width&&left.right>right.left+1)issues.push('topbar action collision');
  const hero=document.querySelector('.hero-card');
  const content=hero?.querySelector('.hero-copy')?.getBoundingClientRect();
  const badge=hero?.querySelector('.hero-floating')?.getBoundingClientRect();
  if(content&&badge&&content.width&&badge.width&&content.right>badge.left+8&&content.bottom>badge.top+4&&content.top<badge.bottom-4){
   issues.push('hero copy overlaps journey badge');
  }
  for(const selector of ['.mobile-welcome-copy>strong','.mobile-header-brand','.hero-copy h2','.onboarding-intro h1']){
   for(const element of document.querySelectorAll(selector)){
    if(getComputedStyle(element).display==='none')continue;
    if(element.scrollWidth>element.clientWidth+3)issues.push(selector+' clipped text');
   }
  }
  return issues.slice(0,14);
 });
 expect(issues,label).toEqual([]);
}
for(const width of compact){
 test('phone '+width+'px — no header, title, or journey badge collision',async({page})=>{
  await page.setViewportSize({width,height:780});
  await boot(page,{name:'Amina'});
  await expect(page.locator('.mobile-welcome')).toBeVisible();
  await inspectFit(page,'home layout '+width);
  await page.getByRole('button',{name:'Search and navigate pages'}).click();
  await expect(page.getByRole('dialog',{name:'Quick navigation'})).toBeVisible();
  await page.keyboard.press('Escape');
  await inspectFit(page,'home after command close '+width);
 });
}
test('320px with long owner name and handwriting is readable and stays within the screen',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await boot(page,{name:'Amina Nuru MwanaWaBahari'});
 await expect(page.locator('.handwritten-accent').first()).toBeVisible();
 await inspectFit(page,'long name');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.sidebar.sidebar-open')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
});
for(const width of [320,390,430]){
 test('mobile '+width+'px — every major page and nested form remains within viewport',async({page})=>{
  await page.setViewportSize({width,height:820});
  await boot(page);
  for(const label of NAV){
   await page.getByRole('button',{name:'Open navigation'}).click();
   await page.locator('.sidebar-nav').getByRole('button',{name:label,exact:true}).click();
   await expect(page.locator('.topbar-current-page')).toHaveText(label);
   await inspectFit(page,label+' '+width);
  }
 });
}
test('font enlargement does not break essential mobile controls',async({page})=>{
 await page.setViewportSize({width:360,height:700});
 await boot(page);
 await page.addStyleTag({content:'html {font-size:125%!important;}'});
 await inspectFit(page,'larger root font');
 await expect(page.getByRole('button',{name:'Search and navigate pages'})).toBeVisible();
 await page.getByRole('button',{name:'Search and navigate pages'}).click();
 await expect(page.getByRole('dialog',{name:'Quick navigation'})).toBeVisible();
});
test('handwriting uses script accents without forcing clinical copy into cursive',async({page})=>{
 await page.setViewportSize({width:390,height:800});
 await boot(page);
 const fonts=await page.evaluate(()=>({
  accent:getComputedStyle(document.querySelector('.handwritten-accent')).fontFamily,
  body:getComputedStyle(document.querySelector('.hero-copy p')).fontFamily
 }));
 expect(fonts.accent.toLowerCase()).toContain('script');
 expect(fonts.body.toLowerCase()).not.toContain('segoe script');
});
