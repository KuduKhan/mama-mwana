import {test,expect} from '@playwright/test';
test('v2.0 clinical acceptance remains NO-GO and v2.1 catalogue cannot activate care',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Privacy & records'}).click();
 const panel=page.locator('.mm21-readiness');
 await expect(panel.getByRole('heading',{name:'Connected healthcare services'})).toBeVisible();
 await expect(panel).toContainText('NOT AUTHORIZED');
 await panel.getByRole('button',{name:/FHIR\/HIE integration/}).click();
 await expect(panel).toContainText('There is no live FHIR endpoint');
 await expect(panel).toContainText('DHA certification');
 const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 expect(widths.scroll).toBeLessThanOrEqual(widths.client+2);
});
