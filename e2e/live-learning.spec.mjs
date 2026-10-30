import {test,expect} from '@playwright/test';
for(const width of [320,390,768,1440]){
 test('public learning operates independently of sample profile at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await page.getByRole('button',{name:/Open learning library — no account required/i}).click();
  await expect(page.getByRole('heading',{name:'Explore MamaMwana learning'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Health & learning library'})).toBeVisible();
  await expect(page.getByText('Private care records remain closed')).toBeVisible();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await expect(page.getByRole('button',{name:/Open learning library — no account required/i})).toBeVisible();
  const {client,scroll}=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(scroll).toBeLessThanOrEqual(client+2);
 });
}
test('language choice works in live public workspace',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Open learning library — no account required/i}).click();
 await page.getByRole('combobox',{name:'Learning language'}).selectOption('sw');
 await expect(page.getByRole('heading',{name:'Mafunzo ya familia'})).toBeVisible();
});

test('public learning quiz progress survives reload and can be erased',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Open learning library — no account required/i}).click();
 await page.locator('.mm209-lesson input').first().check();
 await expect(page.locator('.mm209-feedback')).toContainText('Correct');
 await page.reload();
 await page.getByRole('button',{name:/Open learning library — no account required/i}).click();
 await expect(page.locator('.mm209-lesson input').first()).toBeChecked();
 await page.getByRole('button',{name:'Clear learning progress'}).click();
 await expect(page.locator('.mm209-lesson input').first()).not.toBeChecked();
});
