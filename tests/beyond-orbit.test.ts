import { describe, expect, it } from "vitest";
import { floatingFrame, cablePath, ACTORS, STATIC_FRAME, BEATS, CUES, STAR, poseStyle, starDelays, starNote } from "@/lib/beyond-orbit";
import { soundBank } from "@/lib/sfx";
import fs from "node:fs";
import sharp from "sharp";
import { SCENES, poseBox } from "@/lib/scenes";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EpilogueCredits } from "@/components/epilogue/EpilogueCredits";
import { beyondOrbit } from "@/i18n/beyond-orbit";
import { EGGS } from "@/lib/egg-catalog";

describe("floating companions", () => {
  it("starts at rest and keeps separate, inward-facing actors clear of the copy", () => {
    expect(floatingFrame(0)).toEqual(STATIC_FRAME);
    expect(ACTORS.glaucia.flip).toBe(true);
    expect(ACTORS.prince.flip).toBe(false);
    expect(ACTORS.glaucia.x).toBeGreaterThan(45);
    expect(ACTORS.glaucia.x).toBeLessThan(ACTORS.prince.x);
    expect(ACTORS.prince.height).toBeLessThan(ACTORS.glaucia.height * .65);
  });
  it("bounds long-running motion without a jump at the shared loop seam", () => {
    for (let t = 0; t <= 360; t += .25) {
      const frame = floatingFrame(t);
      for (const value of Object.values(frame)) {
        expect(Math.abs(value.x)).toBeLessThanOrEqual(.65);
        expect(Math.abs(value.y)).toBeLessThanOrEqual(.9);
        expect(Math.abs(value.angle)).toBeLessThanOrEqual(1.4);
      }
    }
    const start = floatingFrame(0); const end = floatingFrame(120);
    for (const actor of ["glaucia", "prince"] as const) {
      expect(end[actor].x).toBeCloseTo(start[actor].x, 6);
      expect(end[actor].y).toBeCloseTo(start[actor].y, 6);
      expect(end[actor].angle).toBeCloseTo(start[actor].angle, 6);
    }
    expect(floatingFrame(3).prince.y).not.toBe(floatingFrame(3).glaucia.y);
  });
  it("keeps each cable attached to its drifting backpack anchor", () => {
    for (const t of [0, 2, 7, 30]) {
      const frame = floatingFrame(t);
      for (const actor of ["glaucia", "prince"] as const) {
        const path = cablePath(actor, frame[actor]);
        const start = path.match(/^M ([\d.-]+) ([\d.-]+)/)!;
        expect(Number(start[1])).toBeCloseTo((ACTORS[actor].x + frame[actor].x) * 16, 2);
        expect(Number(start[2])).toBeCloseTo((ACTORS[actor].y + frame[actor].y) * 9, 2);
        expect(path).not.toMatch(/NaN|Infinity/);
      }
    }
  });
});

describe("A Última Luz", () => {
  it("plays its beats in order and every cue is a short sound from the bank, never louder than it", () => {
    const times = Object.values(BEATS);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    for (const cue of CUES) {
      expect(soundBank[cue.sound].length).toBeGreaterThan(0);
      expect(cue.at).toBeGreaterThanOrEqual(0); expect(cue.at).toBeLessThan(BEATS.end);
      expect(cue.gain ?? 1).toBeLessThanOrEqual(1);
    }
  });
  it("lights any journey before the title, one distinct note per star", () => {
    for (const count of [0, 1, 4, EGGS.length, 80]) {
      const delays = starDelays(count);
      expect(delays).toHaveLength(count);
      if (count) expect(BEATS.constellation + .3 + delays.at(-1)!).toBeLessThan(BEATS.title);
    }
    expect(new Set(Array.from({ length: 15 }, (_, index) => starNote(index))).size).toBe(15);
  });
  it.each(["pt", "en", "es"] as const)("includes Aurélia and Red Tide in the %s credits and announces that every world is charted", lang => {
    const copy = beyondOrbit[lang];
    const html = renderToStaticMarkup(createElement(EpilogueCredits, { copy }));
    const credits = html.slice(0, html.indexOf('class="beyond-orbit__post"'));
    const post = html.slice(html.indexOf('class="beyond-orbit__post"'));
    const badges = credits.match(/class="beyond-orbit__world-badges">(.*?)<\/span>/)![1];
    expect(badges.match(/<img /g)).toHaveLength(6);
    expect(badges).toContain(SCENES.aurelia.assets.background.src);
    expect(credits).toContain(copy.worlds.services);
    expect(credits).toContain(copy.worlds.notfound);
    expect(credits).toContain(copy.mapped.replace("{total}", String(EGGS.length)));
    for (const actor of ["glaucia", "prince"] as const) expect(credits).toContain(SCENES["beyond-orbit"].assets.actors[actor]["float-idle"].src);
    expect(post).not.toContain(copy.worlds.services);
    expect(post).toContain(copy.postNone);
    expect(post).not.toContain("<li>");
    expect(post).not.toContain(`<li>${copy.worlds.events}</li>`);
  });
  it("keeps the last star on the Veil and clear of both actors", () => {
    const scene = SCENES["beyond-orbit"];
    for (const actor of ["glaucia", "prince"] as const) {
      const box = poseBox(scene, actor, "float-idle");
      expect(STAR.v * 100 < box.top || STAR.u * 100 < box.left || STAR.u * 100 > box.left + box.width).toBe(true);
    }
    expect(STAR.u).toBeGreaterThan(.55);
  });
  it.each(["glaucia", "prince"] as const)("swaps %s poses around the same backpack pivot", actor => {
    const scene = SCENES["beyond-orbit"];
    const idle = poseBox(scene, actor, "float-idle");
    for (const pose of ["float-idle", "float-b", "float-c", "float-d"] as const) {
      const style = poseStyle(actor, pose);
      const box = poseBox(scene, actor, pose);
      expect(ACTORS[actor].x + style.left / 100 * idle.width).toBeCloseTo(box.left, 2);
      expect(ACTORS[actor].y + style.top / 100 * idle.height).toBeCloseTo(box.top, 2);
      expect(style.src).toBe(scene.assets.actors[actor][pose].src);
    }
    expect(poseStyle(actor, "float-idle")).toMatchObject({ width: 100, height: 100 });
  });
});

describe("approved orbit art", () => {
  it("ships a tiny ambilight copy of the plate", () => {
    const { ambient } = SCENES["beyond-orbit"].assets;
    expect(ambient.w / ambient.h).toBeCloseTo(16 / 9, 5);
    expect(fs.statSync(`public${ambient.src}`).size).toBeLessThan(4_000);
  });
  const scene = SCENES["beyond-orbit"];
  it("preserves the complete 16:9 plate with a bounded web payload", () => {
    expect(scene.assets.background.w / scene.assets.background.h).toBeCloseTo(16 / 9, 5);
    expect(fs.statSync(`public${scene.assets.background.src}`).size).toBeLessThan(600_000);
  });
  it.each(["glaucia", "prince"] as const)("anchors all %s poses on the connection port and clears the text", actor => {
    const stage = ACTORS[actor];
    expect(Object.keys(scene.assets.actors[actor])).toEqual(["float-idle", "float-b", "float-c", "float-d"]);
    for (const [pose, sprite] of Object.entries(scene.assets.actors[actor])) {
      const box = poseBox(scene, actor, pose);
      const anchor = stage.flip ? sprite.w - sprite.feetX : sprite.feetX;
      expect(box.left + box.width * anchor / sprite.w).toBeCloseTo(stage.x, 2);
      expect(box.top + box.height * sprite.anchorY / sprite.h).toBeCloseTo(stage.y, 2);
      expect(box.left).toBeGreaterThan(45);
      expect(box.left + box.width).toBeLessThan(95);
      expect(box.top).toBeGreaterThan(35);
      expect(box.top + box.height).toBeLessThan(90);
    }
  });
  it.each(["glaucia", "prince"] as const)("publishes crisp transparent %s sprites, preserving the light suit", async actor => {
    for (const sprite of Object.values(scene.assets.actors[actor])) {
      const { data, info } = await sharp(`public${sprite.src}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height]).toEqual(sprite.px);
      let solid = 0; let light = 0; let partial = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0 && data[i + 3] !== 255) partial++;
        if (data[i + 3]) { solid++; if (Math.min(data[i], data[i + 1], data[i + 2]) > 160) light++; }
      }
      expect(partial).toBe(0);
      expect(solid / (info.width * info.height)).toBeGreaterThan(.3);
      expect(solid / (info.width * info.height)).toBeLessThan(.9);
      expect(light / solid).toBeGreaterThan(.15);
      expect(data[3]).toBe(0);
    }
  });
});
