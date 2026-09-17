import { chromium } from '@playwright/test';
import { copyFile, unlink } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const file = 'public/images/HURMEVKOR/主图/__catalog_test__.jpg';
try {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '查看 HURMEVKOR 华美科' }).click();
  await copyFile('public/images/portrait.jpg', file);
  await page.getByAltText('华美科 主图 __catalog_test__.jpg', { exact: true }).waitFor({ timeout: 12000 });
  await page.getByAltText('华美科 主图 __catalog_test__.jpg').evaluate(img => img.decode());
  await page.getByRole('tab', { name: '详情', exact: true }).click();
  assert.equal(await page.getByRole('tabpanel').locator('img').count(), 0);
  await page.getByRole('tab', { name: '主图', exact: true }).click();
  await unlink(file);
  await page.getByAltText('华美科 主图 __catalog_test__.jpg').waitFor({ state: 'detached', timeout: 12000 });
  console.log('Live add/delete and category isolation passed');
} finally {
  await unlink(file).catch(e => { if (e.code !== 'ENOENT') throw e; });
  await browser.close();
}
