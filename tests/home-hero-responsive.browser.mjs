import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { expect } from "@playwright/test";
import { baseURL, launchBrowser } from "./browser-utils.mjs";

const output = "test-results/home-hero-responsive";
await mkdir(output, { recursive: true });
const browser = await launchBrowser();
const failures = [];
const viewports = [
  { width: 360, height: 640 }, { width: 390, height: 844 },
  { width: 844, height: 390 }, { width: 768, height: 1024 },
  { width: 1024, height: 768 }, { width: 1280, height: 720 },
  { width: 1920, height: 1080 }, { width: 3840, height: 2160 },
  { width: 320, height: 640 },
];
const cases = viewports.map(viewport => ({ locale: "pt", viewport }));
for (const locale of ["en", "es"]) cases.push({ locale, viewport: viewports[1] });
cases.push({ locale: "pt", viewport: viewports[1], reducedMotion: "reduce" });
cases.push({ locale: "pt", viewport: viewports[1], manualMotion: true });
cases.push({ locale: "pt", viewport: viewports[1], javaScriptEnabled: false });
const photoSelector = ".commercial-intro .credibility-portrait img";

// boundingBox() has x/y/width/height, never right/bottom.
function contains(outer, inner, label) {
  assert.ok(inner && inner.width > 0 && inner.height > 0, `${label}: missing/empty rectangle`);
  assert.ok(inner.x >= outer.x - 1 && inner.y >= outer.y - 1 &&
    inner.x + inner.width <= outer.x + outer.width + 1 &&
    inner.y + inner.height <= outer.y + outer.height + 1,
  `${label}: ${JSON.stringify(inner)} is outside ${JSON.stringify(outer)}`);
}
function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function imageState(page, selector) {
  const img = page.locator(selector);
  await expect(img, `${selector}: image must finish loading`).toHaveJSProperty("complete", true);
  assert.ok(await img.evaluate(el => el.naturalWidth > 0), `${selector}: image failed to decode`);
  await expect(img).toHaveCSS("opacity", "1");
  assert.ok(await img.evaluate(el => {
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (Number(style.opacity) !== 1 || style.visibility === "hidden" || style.display === "none") return false;
    }
    return true;
  }), `${selector}: an ancestor hides/dims the image`);
  return img;
}

async function unbrokenTitle(page) {
  const title = page.locator("main h1");
  await expect(title).toBeVisible();
  await expect(title).toHaveCSS("overflow-wrap", "break-word");
  await expect(title).toHaveCSS("hyphens", "manual");
  const measurements = await title.evaluate(h1 => {
    const words = [];
    // Text-node ranges avoid counting the extra boxes of decorative spans.
    // Walk every node so accented lines and the Home name are included.
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (const match of node.textContent.matchAll(/\S+/gu)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        words.push({ word: match[0], rects: range.getClientRects().length });
      }
    }
    return { words, scrollWidth: h1.scrollWidth, clientWidth: h1.clientWidth };
  });
  const label = `${new URL(page.url()).pathname} at ${page.viewportSize().width}px`;
  assert.ok(measurements.words.length, `${label}: h1 has no words`);
  assert.deepEqual(measurements.words.filter(({ rects }) => rects !== 1), [], `${label}: h1 words break mid-word`);
  assert.ok(measurements.scrollWidth <= measurements.clientWidth + 1,
    `${label}: h1 overflows (${measurements.scrollWidth}px > ${measurements.clientWidth}px)`);
}

async function layout(page, { home = false, notFound = false } = {}) {
  await unbrokenTitle(page);
  const heroSelector = notFound ? ".red-tide" : ".page-hero";
  const selector = notFound ? ".red-tide__image" : `${home ? ".home-hero " : ""}.page-hero__image`;
  const img = await imageState(page, selector);
  await expect(img).toHaveCSS("object-fit", "cover");
  const hero = await page.locator(heroSelector).boundingBox();
  const plate = await img.boundingBox();
  const header = await page.locator(".site-header").boundingBox();
  const viewport = page.viewportSize();
  assert.ok(hero && plate && header, "hero/image/header has no rectangle");
  assert.ok(Math.abs(hero.y - header.y - header.height) < 2, "hero must start directly below header");
  assert.ok(hero.height >= viewport.height - header.height - 2, "hero is shorter than the available viewport");
  const shortLandscape = viewport.width > viewport.height && viewport.height <= 520;
  // Short landscape deliberately lets supporting copy continue below the scene.
  // All other viewports retain the full-hero image coverage assertion.
  const scene = shortLandscape ? { ...hero, height: viewport.height - header.height } : hero;
  contains(plate, scene, "image must cover the entire scene");
  if (shortLandscape) {
    assert.ok(Math.abs(plate.height - scene.height) < 2, "landscape scene must stop at the first viewport");
    const secondary = page.locator(`${heroSelector} :is(.page-hero__subtitle,.page-hero__extra,.cta-note,.secrets-guide,.hero-link,.aurelia-independent,.credibility-experience,.red-tide__body,.red-tide__episode,.red-tide__worlds,.red-tide__touch)`);
    for (const item of await secondary.all()) {
      await expect(item).toBeVisible();
      const box = await item.boundingBox();
      assert.ok(box && box.y >= plate.y + plate.height - 1, "secondary copy must continue below the landscape scene");
    }
  }
  const visible = { x: Math.max(0, hero.x), y: Math.max(header.y + header.height, hero.y),
    width: Math.min(viewport.width, hero.x + hero.width) - Math.max(0, hero.x),
    height: Math.min(viewport.height, hero.y + hero.height) - Math.max(header.y + header.height, hero.y) };
  const coveredWidth = Math.max(0, Math.min(visible.x + visible.width, plate.x + plate.width) - Math.max(visible.x, plate.x));
  const coveredHeight = Math.max(0, Math.min(visible.y + visible.height, plate.y + plate.height) - Math.max(visible.y, plate.y));
  const coverage = coveredWidth * coveredHeight / (visible.width * visible.height);
  assert.ok(visible.width > 0 && visible.height > 0 && coverage >= .9, `image covers only ${(coverage * 100).toFixed(1)}% of visible hero`);
  const screen = { x: 0, y: header.y + header.height, width: viewport.width, height: viewport.height - header.y - header.height };
  const title = page.locator(`${heroSelector} ${home ? 'h1.hero-name' : 'h1'}`);
  await expect(title).toBeVisible();
  const titleBox = await title.boundingBox();
  contains(plate, titleBox, "h1 must be inside the image");
  contains(screen, titleBox, "h1 must be fully inside the first viewport");
  const identity = [titleBox];
  if (home) {
    const photo = await imageState(page, photoSelector);
    const box = await photo.boundingBox();
    contains(plate, box, "portrait must be inside the image");
    contains(screen, box, "portrait must be fully inside the first viewport");
    identity.push(box);
  }
  const cta = page.locator(`${heroSelector} .actions a.button.primary`).first();
  await expect(cta).toBeVisible();
  contains(screen, await cta.boundingBox(), "primary CTA must be inside the first viewport");
  contains(plate, await cta.boundingBox(), "primary CTA must overlay the image");

  // The plane is larger than the visible crop, not a separate 16:9 strip.
  // Verify its exact object-position projection, including all hotspot planes.
  const projection = await page.locator(heroSelector).evaluate(hero => {
    const frame = hero.querySelector(".page-hero__image,.red-tide__image").getBoundingClientRect();
    const planes = [...hero.querySelectorAll(".observatory-plane,.niveora-plane,.mars-plane,.lumina-plane,.atlas-plane,.aurelia-plane,.red-tide__plane")];
    return planes.map(plane => {
      const box = plane.getBoundingClientRect();
      const style = getComputedStyle(plane);
      const x = parseFloat(style.getPropertyValue("--scene-x")) / 100;
      const y = parseFloat(style.getPropertyValue("--scene-y")) / 100;
      const width = Math.max(frame.width, frame.height * 16 / 9);
      const height = Math.max(frame.height, frame.width * 9 / 16);
      return { name: plane.className, errors: [box.x - (frame.x + (frame.width - width) * x), box.y - (frame.y + (frame.height - height) * y), box.width - width, box.height - height] };
    });
  });
  assert.ok(projection.length, "missing effect/hotspot coordinate planes");
  for (const { name, errors } of projection) assert.ok(errors.every(n => Math.abs(n) < 2), `${name}: cover projection mismatch ${JSON.stringify(errors)}`);
  assert.equal(await page.evaluate(() => scrollY), 0, "entry checks must never scroll");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "horizontal overflow");
  return { identity, selector };
}

// Sample the rendered scene (including shade/effects), not just the source image.
// Decode the PNG in the page: no sharp/png dependency and no cross-origin canvas.
async function pixels(page, id, selector = ".home-hero .page-hero__image") {
  const rect = await page.locator(selector).boundingBox();
  assert.ok(rect);
  const viewport = page.viewportSize();
  const x = Math.max(0, rect.x), y = Math.max(0, rect.y);
  const width = Math.min(rect.x + rect.width, viewport.width) - x;
  const height = Math.min(rect.y + rect.height, viewport.height) - y;
  assert.ok(width > 0 && height > 0, "no visible plate pixels");
  const shot = await page.screenshot({ path: `${output}/${id}.png`, clip: { x, y, width, height } });
  const sample = await page.evaluate(async base64 => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 72;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let total = 0, lit = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = .2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2];
      total += luminance;
      if (luminance > 20) lit++;
    }
    return { mean: total / (data.length / 4), lit: lit / (data.length / 4) };
  }, shot.toString("base64"));
  assert.ok(sample.mean > 25, `plate mean luminance ${sample.mean.toFixed(1)}/255`);
  assert.ok(sample.lit >= .05, `only ${Math.round(sample.lit * 100)}% non-black pixels`);
}

async function soundInvite(page, identity) {
  const invite = page.locator(".sound-invite");
  if (!await invite.isVisible()) return;
  const box = await invite.boundingBox();
  assert.ok(box, "sound invitation has no bounding box");
  assert.ok(box.height <= page.viewportSize().height * .3, "sound invitation covers >30% of viewport");
  for (const rect of identity) assert.ok(!intersects(box, rect), "sound invitation overlaps the name or portrait");
  if (page.viewportSize().width <= 1024 && page.viewportSize().width > 600) assert.ok(box.height <= 73, "compact sound invitation exceeds 72px (1px tolerance)");
  if (page.viewportSize().width === 844 && page.viewportSize().height === 390) {
    assert.ok(box.height <= 60, "landscape sound invitation exceeds 60px");
  }
  for (const button of await invite.getByRole("button").all()) {
    const target = await button.boundingBox();
    assert.ok(target && target.height >= 44 && target.width >= 44, "sound invitation button is smaller than 44px");
    assert.ok(await button.evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1), "sound invitation button text is clipped");
  }
  assert.ok(await invite.evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1), "invitation text is clipped");
}

async function readableControls(page) {
  const issues = await page.evaluate(() => {
    const issues = [];
    for (const el of document.querySelectorAll(".secrets-guide button,.career-dialog__open,.credibility-offer__waitlist,a.worlds-warp__label,.credibility-venues a,footer a,.footer-top,.contact-consent")) {
      const box = el.getBoundingClientRect();
      if (box.width && box.height && Math.min(box.width, box.height) < 44) issues.push(`small target: ${el.className}`);
    }
    for (const el of document.querySelectorAll(".chapter-tag,.comlink-toggle__count,.sky-touch-hint,small,.footer-top,.credibility-kicker,.mars-discoveries,.atlas-discoveries")) {
      if (el.getBoundingClientRect().width && parseFloat(getComputedStyle(el).fontSize) < 12) issues.push(`small font: ${el.className}`);
    }
    return issues;
  });
  assert.deepEqual(issues, []);
}

async function setup({ viewport, ...options }) {
  const touch = viewport.width <= 1024;
  const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1, ...options });
  await context.addInitScript(() => {
    for (const key of ["galaxia-boot", "niveora-boot", "marte-boot", "lumina-boot", "atlas-boot", "aurelia-boot"]) sessionStorage.setItem(key, "done");
  });
  return context;
}

async function visit(page, path) {
  await page.goto(`${baseURL}${path}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Explicit entry checkpoint from the regression specification, without scrolling.
  await page.waitForTimeout(1500);
}

try {
  for (const { locale, viewport, reducedMotion = "no-preference", manualMotion = false, javaScriptEnabled = true } of cases) {
    const id = `${locale}-${viewport.width}x${viewport.height}-${!javaScriptEnabled ? "no-js" : manualMotion ? "manual" : reducedMotion}`;
    const context = await setup({ viewport, reducedMotion, javaScriptEnabled });
    const page = await context.newPage();
    try {
      if (manualMotion) await context.addInitScript(() => localStorage.setItem("reduce-motion", "true"));
      await visit(page, `/${locale}`);
      const { identity, selector } = await layout(page, { home: true });
      if (locale === "pt" && viewport.width === 844 && viewport.height === 390) {
        const crew = page.locator(".observatory-crew__pose--idle");
        await expect(crew).toBeVisible();
        await expect(crew).toHaveCSS("opacity", "1");
        const box = await crew.boundingBox();
        assert.ok(box && box.width > 0 && box.height > 0, "Glaucia has no character rectangle");
        const visibleWidth = Math.max(0, Math.min(box.x + box.width, viewport.width) - Math.max(0, box.x));
        const visibleHeight = Math.max(0, Math.min(box.y + box.height, viewport.height) - Math.max(0, box.y));
        const fraction = visibleWidth * visibleHeight / (box.width * box.height);
        assert.ok(fraction >= .6, `only ${(fraction * 100).toFixed(1)}% of Glaucia's character intersects the viewport`);
        // This entry case must exercise the invitation instead of silently skipping it.
        await expect(page.locator(".sound-invite")).toBeVisible();
      }
      await pixels(page, id, selector);
      await soundInvite(page, identity);
      if (viewport.width <= 1024) await readableControls(page);
      if (manualMotion) await expect(page.locator("html")).toHaveClass(/reduce-motion/);
      assert.equal(await page.evaluate(() => scrollY), 0, "pixel/control checks must not scroll");
      console.log(`PASS ${id}`);
    } catch (error) {
      failures.push(`${id}: ${error.message}`);
      await page.screenshot({ path: `${output}/${id}-failed.png` }).catch(() => {});
    } finally { await context.close(); }
  }

  for (const route of ["sobre", "projetos", "eventos", "servicos", "conteudo", "404"]) {
    for (const viewport of [viewports[8], viewports[0], viewports[1], viewports[2], viewports[3], viewports[5]]) {
      const id = `${route}-${viewport.width}x${viewport.height}`;
      const context = await setup({ viewport });
      const page = await context.newPage();
      try {
        await visit(page, `/pt/${route === "404" ? "missing-responsive-page" : route}`);
        const { identity, selector } = await layout(page, { notFound: route === "404" });
        await pixels(page, id, selector);
        await soundInvite(page, identity);
        if (viewport.width <= 1024) await readableControls(page);
        console.log(`PASS ${id}`);
      } catch (error) {
        failures.push(`${id}: ${error.message}`);
        await page.screenshot({ path: `${output}/${id}-failed.png` }).catch(() => {});
      } finally { await context.close(); }
    }
  }

  // The epilogue has its own hero structure. Include it, plus the translated
  // About/Services titles, in the same whole-word and overflow regression.
  const titleRoutes = ["/pt/alem-da-ultima-orbita"];
  for (const locale of ["en", "es"]) {
    for (const route of ["sobre", "servicos"]) titleRoutes.push(`/${locale}/${route}`);
  }
  for (const path of titleRoutes) {
    for (const viewport of [viewports[8], viewports[0], viewports[1], viewports[3]]) {
      const id = `title-${path.slice(1).replaceAll("/", "-")}-${viewport.width}x${viewport.height}`;
      const context = await setup({ viewport });
      const page = await context.newPage();
      try {
        await visit(page, path);
        await unbrokenTitle(page);
        console.log(`PASS ${id}`);
      } catch (error) {
        failures.push(`${id}: ${error.message}`);
        await page.screenshot({ path: `${output}/${id}-failed.png` }).catch(() => {});
      } finally { await context.close(); }
    }
  }

  // Preserve the root-scale contract from the earlier responsive fix.
  for (const [width, height, font] of [[1440, 900, 16], [1920, 1080, 16], [2560, 1440, 20], [3840, 2160, 28]]) {
    const context = await setup({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      await visit(page, "/pt");
      const sizing = await page.evaluate(() => ({
        root: parseFloat(getComputedStyle(document.documentElement).fontSize),
        content: document.querySelector(".page-hero__content").getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.equal(sizing.root, font);
      assert.ok(Math.abs(sizing.content - 73.75 * font) < 2, "content width did not scale with text");
      assert.equal(sizing.overflow, false);
      console.log(`PASS desktop-scale-${width}`);
    } catch (error) { failures.push(`desktop-scale-${width}: ${error.message}`); }
    finally { await context.close(); }
  }
} finally { await browser.close(); }

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log("PASS: full-bleed entry, identity/CTA inside the scene and viewport, cover projection, scene pixels, sound invitation, motion preferences, no-JS and TV scale.");
