import { expect } from '@playwright/test';
import { baseURL, launchBrowser } from './browser-utils.mjs';
const browser = await launchBrowser();
try {
 const page = await browser.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 for (const [width,height] of [[1280,1000],[390,900]]) {
  await page.setViewportSize({width,height});
  await page.goto(`${baseURL}/pt/eventos`);
  await expect(page.locator('.event-stats strong').nth(0)).toHaveText('116');
  await expect(page.locator('.event-stats strong').nth(1)).toHaveText('9');
  await expect(page.locator('.event-countries li')).toHaveCount(9);
  await expect(page.locator('.event-history details').first()).toHaveAttribute('open','');
  await expect(page.locator('.event-history')).toContainText('AgentCon Rio de Janeiro');
  await expect(page.locator('canvas.globe')).toHaveAttribute('width', /[1-9]\d+/);
  if (width === 1280) {
    await page.screenshot({path:'docs/screenshots/events-redesign-desktop.png', fullPage:true});
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
    const changed = Number(await globe.getAttribute('data-longitude'));
    expect(changed).not.toBe(before);
    await page.getByRole('button',{name:'Recentrar',exact:true}).click();
    await expect(globe).toHaveAttribute('data-longitude','5.5000');
    await page.emulateMedia({reducedMotion:'reduce'});
    await globe.press('ArrowRight');
    await expect(globe).toHaveAttribute('data-longitude','5.6500');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.getByRole('searchbox').fill('mcp');
    await expect(page.locator('.event-history li')).toHaveCount(1);
    await expect(page.locator('.event-history li')).toContainText('TypeScript');
    await page.getByRole('searchbox').fill('no-such-event-zz');
    await expect(page.locator('.event-empty')).toBeVisible();
    await page.getByRole('searchbox').fill('');
    await page.getByLabel('Ano',{exact:true}).selectOption('2026');
    await expect(page.locator('.event-history li')).toHaveCount(3);
    await page.getByLabel('Ano',{exact:true}).selectOption('');
  } else {
    await page.screenshot({path:'docs/screenshots/events-redesign-mobile.png',fullPage:true});
  }
  await page.locator('.globe-wrap').scrollIntoViewIfNeeded();
  await page.screenshot({path:`docs/screenshots/event-globe-${width}.png`});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
 const touchContext = await browser.newContext({viewport:{width:390,height:900},isMobile:true,hasTouch:true});
 const touchPage = await touchContext.newPage();
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
 const staticPage = await browser.newPage({ javaScriptEnabled: false });
 await staticPage.goto(`${baseURL}/pt/eventos`);
 await expect(staticPage.locator('.event-stats strong').nth(1)).toHaveText('9');
 await expect(staticPage.locator('.event-history')).toContainText('AgentCon');
 await staticPage.close();
 expect(errors).toEqual([]);
 console.log('PASS: globe runtime, 116 records, 9 countries, latest year expanded, desktop/mobile layout.');
} finally { await browser.close(); }
