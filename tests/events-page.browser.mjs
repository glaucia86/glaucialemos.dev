// Events product layer (Atlas das Conexões): the draggable globe, the logbook filters, the counts and the countries.
// The scene, the secrets and the viewports are covered by tests/atlas.browser.mjs.
import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';
const browser = await launchBrowser();
try {
 const page = await browser.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 await page.addInitScript(() => sessionStorage.setItem('atlas-boot', 'done'));
 for (const [width,height] of [[1280,1000],[390,900]]) {
  await page.setViewportSize({width,height});
  await page.goto(`${baseURL}/pt/eventos`);
  // The counters roll up when they enter the viewport.
  await page.locator('.atlas-stats').scrollIntoViewIfNeeded();
  await expect(page.locator('.atlas-stats dd').nth(0)).toHaveText('136');
  await expect(page.locator('.atlas-stats dd').nth(1)).toHaveText('81');
  await expect(page.locator('.atlas-stats dd').nth(2)).toHaveText('55');
  await expect(page.locator('.atlas-stats dd').nth(5)).toHaveText('9');
  await expect(page.locator('.atlas-countries li[data-kind="city"]')).toHaveCount(7);
  await expect(page.locator('.atlas-countries li[data-kind="signal"]')).toHaveText(['África do Sul', 'França']);
  await expect(page.locator('.log__year').first()).toHaveAttribute('open','');
  await expect(page.locator('.log')).toContainText('AgentCon Rio de Janeiro');
  await expect(page.locator('canvas.globe')).toHaveAttribute('width', /[1-9]\d+/);
  if (width === 1280) {
   await page.getByRole('button', {name:'Pausar rotação', exact:true}).click();
   const globe = page.locator('canvas.globe');
   await globe.scrollIntoViewIfNeeded();
   const rect = await globe.boundingBox();
   const before = Number(await globe.getAttribute('data-longitude'));
   await page.mouse.move(rect.x + rect.width*.4, rect.y + rect.height*.45);
   await page.mouse.down();
   await page.mouse.move(rect.x + rect.width*.7, rect.y + rect.height*.55, {steps:12});
   await page.mouse.up();
   expect(Number(await globe.getAttribute('data-longitude'))-before).toBeGreaterThan(.5);
   await expect(globe).toHaveAttribute('data-dragging','false');
   await globe.press('ArrowLeft');
   expect(Number(await globe.getAttribute('data-longitude'))).not.toBe(before);
   await page.getByRole('button',{name:'Recentrar',exact:true}).click();
   await expect(globe).toHaveAttribute('data-longitude','5.5000');
   await page.emulateMedia({reducedMotion:'reduce'});
   await globe.press('ArrowRight');
   await expect(globe).toHaveAttribute('data-longitude','5.6500');
   await page.emulateMedia({reducedMotion:'no-preference'});
   const search = page.getByRole('searchbox');
   await search.fill('mcp');
   await expect(page.locator('.log__entry')).not.toHaveCount(0);
   await expect(page).toHaveURL(/q=mcp/);
   await search.fill('no-such-event-zz');
   await expect(page.locator('.log__empty')).toBeVisible();
   await search.fill('');
   await page.locator('select[name="formato"]').selectOption('remoto');
   await expect(page.locator('.log__entry')).toHaveCount(55);
   await expect(page.locator('.log__entry[data-format="presencial"]')).toHaveCount(0);
   await page.locator('select[name="formato"]').selectOption('');
   await page.locator('select[name="ano"]').selectOption('2026');
   await expect(page.locator('.log__entry')).toHaveCount(8);
   await page.locator('select[name="ano"]').selectOption('');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
 const touchContext = await browser.newContext({viewport:{width:390,height:900},isMobile:true,hasTouch:true});
 const touchPage = await touchContext.newPage();
 await touchPage.addInitScript(() => sessionStorage.setItem('atlas-boot', 'done'));
 await touchPage.goto(`${baseURL}/pt/eventos`);
 const touchGlobe = touchPage.locator('canvas.globe');
 await expect(touchGlobe).toHaveAttribute('width', /[1-9]\d+/);
 await touchPage.getByRole('button',{name:'Pausar rotação',exact:true}).click();
 await touchGlobe.scrollIntoViewIfNeeded();
 const touchBox = await touchGlobe.boundingBox();
 const touchBefore = Number(await touchGlobe.getAttribute('data-longitude'));
 const cdp = await touchContext.newCDPSession(touchPage);
 const start = {x:touchBox.x+touchBox.width*.35,y:touchBox.y+touchBox.height*.5};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+80,y:start.y+30}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(touchGlobe).toHaveAttribute('data-dragging','false');
 expect(Number(await touchGlobe.getAttribute('data-longitude'))-touchBefore).toBeGreaterThan(.5);
 await touchContext.close();
 // Without JavaScript: full list, counts and a working GET filter.
 const staticPage = await browser.newPage({ javaScriptEnabled: false });
 await staticPage.goto(`${baseURL}/pt/eventos`);
 await expect(staticPage.locator('.atlas-stats dd').nth(5)).toHaveText('9');
 await expect(staticPage.locator('.log__entry')).toHaveCount(136);
 await staticPage.locator('select[name="formato"]').selectOption('presencial');
 await staticPage.locator('.log__apply').click();
 await expect(staticPage).toHaveURL(/formato=presencial/);
 await expect(staticPage.locator('.log__entry')).toHaveCount(81);
 await staticPage.goto(`${baseURL}/pt/eventos?ano=2021&formato=presencial#diario`);
 await expect(staticPage.locator('.log__empty')).toBeVisible();
 await staticPage.close();
 expect(errors).toEqual([]);
 console.log('PASS: globe drag/keys/touch, 136 records (81 in person, 55 remote), 7 + 2 countries, logbook filters with and without JavaScript.');
} finally { await browser.close(); }
