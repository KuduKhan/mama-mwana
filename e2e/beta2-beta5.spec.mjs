import {test,expect} from '@playwright/test';
async function demo(page,width){
 await page.setViewportSize({width,height:900});await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
}
test('beta.2 theme and navigation search persist without changing records',async({page})=>{
 await demo(page,1280);
 await page.getByRole('button',{name:'Display preferences'}).click();
 await page.getByRole('dialog').getByRole('combobox',{name:'Appearance theme'}).selectOption('dark');
 await expect(page.locator('html')).toHaveAttribute('data-mm-theme','dark');
 await page.getByRole('button',{name:'Close display preferences'}).click();
 await page.getByRole('searchbox',{name:'Find a section'}).fill('library');
 await expect(page.locator('.sidebar-nav').getByRole('button',{name:'Health library'})).toBeVisible();
 await expect(page.locator('.sidebar-nav').getByRole('button',{name:'My care planner'})).toHaveCount(0);
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-mm-theme','dark');
});
test('beta.3 demo family intelligence and visit kit reflow at phone width',async({page})=>{
 await demo(page,390);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys'}).click();
 await expect(page.getByRole('heading',{name:'Family Journey 360°'})).toBeVisible();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Antenatal visits'}).click();
 await expect(page.getByRole('heading',{name:'Prepare for your next visit'})).toBeVisible();
 await page.getByText('What should I prepare or bring for the next appointment?').click();
 await expect(page.locator('.mm23-questions input:checked')).toHaveCount(1);
 const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});
test('beta.4 public bilingual learning distinguishes general text from reviewed medical content',async({page})=>{
 await demo(page,768);
 await page.locator('.sidebar-nav').getByRole('button',{name:'Health library'}).click();
 await expect(page.getByRole('heading',{name:'Family learning studio'})).toBeVisible();
 await page.getByRole('button',{name:'Keep information private'}).click();
 await expect(page.getByRole('heading',{name:'Keep information private'})).toBeVisible();
 await expect(page.locator('.mm24-warning')).toContainText('No independent medical');
 await expect(page.locator('.mm24-guide')).toHaveAttribute('href','/learning/mamamwana-public-guide-v204.txt');
});
test('beta.5 privacy permission explanation and NO-GO do not overflow 320px',async({page})=>{
 await demo(page,320);
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Privacy & records'}).click();
 await expect(page.getByRole('heading',{name:'Privacy and permission clarity'})).toBeVisible();
 await expect(page.locator('.mm25-trust')).toContainText('Clinical launch is restricted');
 const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});
