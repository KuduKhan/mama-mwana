import {test,expect} from '@playwright/test';

// Only the in-memory sample journey is exercised. No account or patient data.
for (const width of [320,375,768,1440]) {
 test(`compact navigation chrome fits at ${width}px without losing controls`, async ({page}) => {
  await page.setViewportSize({width,height:840});
  await page.goto('/');
  await page.locator('.demo-button').click();
  await page.getByRole('button',{name:/Create my journey/i}).click();
  const shell=page.locator('.app-shell');
  await expect(shell).toBeVisible();
  const header=page.locator('.mm-renewed-header.topbar');
  await expect(header).toBeVisible();
  const metrics=await header.evaluate(element=>({
   height:element.getBoundingClientRect().height,
   scrollWidth:element.scrollWidth,
   width:element.clientWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width+2);
  expect(metrics.height).toBeLessThanOrEqual(width<=760?74:70);

  const navigation=page.locator('#mamamwana-primary-navigation');
  const navScroll=page.locator('.sidebar-nav');
  await expect(navScroll.locator('.nav-item')).toHaveCount(13);
  await expect(page.locator('.topbar-actions .mm14-topbar')).toBeVisible();
  await expect(page.locator('.topbar-actions select[aria-label="Language / Lugha"]')).toBeVisible();

  if(width<=760){
   await expect(page.locator('.mm-phone-pagebar')).toBeHidden();
   await expect(page.locator('.topbar-actions .topbar-icon')).toBeVisible();
   const menu=page.getByRole('button',{name:'Open navigation'});
   await menu.click();
   await expect(menu).toHaveAttribute('aria-expanded','true');
   await expect(navigation).toHaveClass(/sidebar-open/);
   await expect(navigation.getByRole('button',{name:'When to seek help'})).toBeVisible();
   const scrollBehavior=await navScroll.evaluate(element=>getComputedStyle(element).overflowY);
   expect(scrollBehavior).toBe('auto');
   await page.keyboard.press('Escape');
   await expect(menu).toHaveAttribute('aria-expanded','false');
   await expect(menu).toBeFocused();
  }else{
   await expect(navigation).toBeVisible();
   await expect(header.locator('.topbar-current-page')).toBeVisible();
  }
 });
}
