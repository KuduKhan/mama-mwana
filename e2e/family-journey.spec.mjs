import {test,expect} from '@playwright/test';
test('separate child records work in the local-only demo',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/Explore interactive demo/i}).click();
 await page.getByRole('button',{name:/Create my journey/i}).click();
 await page.locator('.sidebar-nav').getByRole('button',{name:'Family journeys',exact:true}).click();
 await expect(page.locator('.family09')).toBeVisible();
 const profile=page.locator('.family09-form').first();
 await profile.locator('input').first().fill('Sample Child');
 await profile.getByRole('button',{name:/Add child profile/i}).click();
 await expect(page.locator('.family09-profiles')).toContainText('Sample Child');
 await expect(page.locator('.family09-records')).toBeVisible();
 await page.locator('.family09-records input[type=number]').first().fill('3.25');
 await page.locator('.family09-records').getByRole('button',{name:'Save measurement'}).click();
 await expect(page.locator('.family09-history').first()).toContainText('3.25');
 await page.reload();
 await expect(page.getByRole('button',{name:/Explore interactive demo/i})).toBeVisible();
});
