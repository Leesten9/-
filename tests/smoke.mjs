import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['wide', 1920, 1080]]) {
  await page.setViewportSize({ width, height });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1800);
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await Promise.all([...document.images].map(image => image.decode()));
  });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
  const video = await page.locator('video').evaluate(v => ({ ready: v.readyState, time: v.currentTime, error: v.error?.message }));
  assert(video.ready >= 2 && !video.error, `${name}: video unavailable`);
  assert.equal(await page.locator('.header-floating').count(), 0);
  await page.evaluate(() => scrollTo({ top: document.querySelector('#home').offsetHeight, behavior: 'instant' }));
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.header-floating').count(), 1);
  assert.equal(await page.locator('.header').evaluate(el => getComputedStyle(el).position), 'fixed');
  assert.equal((await page.locator('.header').boundingBox()).y, 0);
  await page.screenshot({ path: `artifacts/${name}-floating-nav.png` });
  const canvas = page.locator('.fiber-viewport canvas');
  assert.equal(await canvas.count(), 1);
  const sample = () => canvas.evaluate(el => {
    const gl = el.getContext('webgl2');
    return new Promise((resolve, reject) => {
      const draw = gl.drawArrays;
      const timer = setTimeout(() => { gl.drawArrays = draw; reject(new Error('No background frame rendered')); }, 5000);
      gl.drawArrays = function (...args) {
        draw.apply(this, args);
        const pixels = new Uint8Array(64 * 64 * 4);
        gl.readPixels(Math.floor(el.width / 2), Math.floor(el.height / 2), 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.drawArrays = draw;
        clearTimeout(timer);
        resolve([...pixels]);
      };
    });
  });
  const pixels = await sample();
  assert(pixels.some((value, index) => index % 4 !== 3 && value > 0), `${name}: blank rays`);
  await page.waitForTimeout(500);
  assert.notDeepEqual(await sample(), pixels, `${name}: static fibers`);
  const experience = page.locator('.experience-glow').first();
  await experience.scrollIntoViewIfNeeded();
  const bounds = await experience.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 3);
  await page.waitForTimeout(300);
  assert(Number(await experience.evaluate(el => el.style.getPropertyValue('--edge-proximity'))) > 80);
  await page.screenshot({ path: `artifacts/${name}-experience-glow.png` });
  await page.mouse.move(0, 0);
  assert.equal(await experience.evaluate(el => el.style.getPropertyValue('--edge-proximity')), '0');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.header-floating').count(), 0);
  assert(await page.locator('video source').getAttribute('src') === '/videos/hero-grain.mp4');
  await page.waitForTimeout(400);
  assert(await page.locator('video').evaluate(v => v.currentTime) > video.time, `${name}: video not advancing`);
  if (name !== 'mobile') {
    const cta = page.locator('.hero .primary-button');
    const initial = await cta.evaluate(el => getComputedStyle(el).backgroundColor);
    await cta.hover();
    await page.waitForTimeout(350);
    assert.notEqual(await cta.evaluate(el => getComputedStyle(el).backgroundColor), initial);
  }
  assert.equal(await page.locator('.project').count(), 3);
  assert.equal(await page.locator('#work img').count(), 0);
  for (let i = 0; i < 3; i++) {
    await page.locator('.project').nth(i).click();
    await page.getByRole('dialog').waitFor();
    for (const category of ['主图', '详情', '场景']) {
      await page.getByRole('tab', { name: category, exact: true }).click();
      assert.equal(await page.getByRole('tabpanel').count(), 1);
      assert(await page.getByRole('tabpanel').getByRole('heading', { name: category + '作品' }).isVisible());
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
  }
  assert.equal(await page.locator('.strength-card').count(), 5);
  await page.getByRole('button', { name: '复制微信号', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '微信号已复制' }).waitFor();
  assert.equal(await page.locator('.contact-mail-button').getAttribute('href'), 'mailto:547301008@qq.com');
  await page.getByRole('button', { name: '聊聊你的项目' }).click();
  await page.getByRole('heading', { name: '期待下一次合作.' }).waitFor();
  await page.getByRole('button', { name: '关闭弹窗' }).click();
  if (name === 'mobile') {
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole('button', { name: '打开导航' }).click();
    await page.getByRole('navigation').getByRole('link', { name: '精选作品' }).click();
    assert.equal(await page.getByRole('button', { name: '打开导航' }).getAttribute('aria-expanded'), 'false');
  }
  console.log(`${name}: images, video, layout, filters and dialogs passed`);
}
assert.deepEqual(errors, []);
await browser.close();
