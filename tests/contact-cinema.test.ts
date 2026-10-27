import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactCinema } from '@/components/services/ContactCinema';
import { mountContactCinema } from '@/components/services/contact-cinema';
import { ContactForm } from '@/components/ContactForm';
import { aurelia } from '@/i18n/aurelia';
import pt from '@/i18n/dictionaries/pt';

// Browser boundaries only: controller, visibility policy and canvas renderer are real.
function harness(motion = true, initialStatus = 'idle', invitation = 'Um canal aberto. Sua mensagem é a próxima semente.') {
  const root = { dataset: {} } as HTMLElement;
  const panel = { dataset: { contactStatus: initialStatus } } as unknown as HTMLElement;
  const typed = { textContent: 'Um canal aberto. Sua mensagem é a próxima semente.' } as HTMLElement;
  const ctx = { clearRect: vi.fn(), fillRect: vi.fn(), globalAlpha: 1, fillStyle: '', imageSmoothingEnabled: true };
  const canvas = { clientWidth: 390, clientHeight: 1400, width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement;
  const celebrate = vi.fn();
  const dispose = mountContactCinema({ root, panel, canvas, typed, motion, celebrate, invitation });
  return { root, panel, typed, canvas, ctx, celebrate, dispose,
    visible(value: boolean) { intersections.forEach(o => o.callback([{ isIntersecting: value }])); },
    status(value: string) { panel.dataset.contactStatus = value; mutations.filter(o => o.target === panel).forEach(o => o.callback()); },
  };
}
let intersections: { callback: (entries: { isIntersecting: boolean }[]) => void; disconnect: ReturnType<typeof vi.fn> }[];
let mutations: { callback: () => void; target?: unknown; disconnect: ReturnType<typeof vi.fn> }[];
let resizes: { disconnect: ReturnType<typeof vi.fn> }[];
let frames: Map<number, FrameRequestCallback>, nextId: number, now: number;
let doc: EventTarget & { hidden: boolean; documentElement: { classList: { contains: () => boolean } } };
function tick(milliseconds: number) {
  const end = now + milliseconds;
  while (now < end) {
    now = Math.min(now + 20, end);
    const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now));
  }
}
beforeEach(() => {
  intersections = []; mutations = []; resizes = []; frames = new Map(); nextId = 0; now = 0;
  doc = Object.assign(new EventTarget(), { hidden: false, documentElement: { classList: { contains: () => false } } });
  vi.stubGlobal('document', doc);
  vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: false }));
  vi.stubGlobal('IntersectionObserver', class {
    disconnect = vi.fn(); constructor(public callback: typeof intersections[number]['callback']) { intersections.push(this); } observe() {}
  });
  vi.stubGlobal('MutationObserver', class {
    target?: unknown; disconnect = vi.fn(); constructor(public callback: () => void) { mutations.push(this); } observe(target: unknown) { this.target = target; }
  });
  vi.stubGlobal('ResizeObserver', class { disconnect = vi.fn(); constructor() { resizes.push(this); } observe() {} });
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { frames.set(++nextId, fn); return nextId; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => vi.unstubAllGlobals());

describe('ContactCinema — SSR', () => {
  it.each(['pt', 'en', 'es'] as const)('keeps the invitation and original form accessible without JS (%s)', lang => {
    const html = renderToStaticMarkup(createElement(ContactCinema, { copy: aurelia[lang].contact.cinema },
      createElement(ContactForm, { copy: pt.services, lang, enabled: true, siteKey: 'test' })));
    expect(html).toContain(aurelia[lang].contact.cinema);
    expect(html).toContain('data-cinema="static"');
    expect(html).toMatch(/<canvas[^>]*aria-hidden="true"/);
    expect(html.match(/id="contato"/g)).toHaveLength(1);
    expect(html).toMatch(/<input[^>]*id="contact-name"[^>]*required=""/);
    expect(html).not.toMatch(/<form[^>]*(hidden|inert)/);
    expect(html).toContain('data-contact-status="idle"');
  });
});
describe('ContactCinema — lifecycle', () => {
  it('plays arrival only on intersection, finishes typing and stops instead of looping', () => {
    const h = harness();
    expect(frames.size).toBe(0);
    h.visible(true); expect(h.root.dataset.cinema).toBe('arriving');
    tick(500); expect(h.typed.textContent!.length).toBeGreaterThan(0); expect(h.typed.textContent!.length).toBeLessThan(49);
    expect(h.ctx.fillRect).toHaveBeenCalled();
    tick(2200); expect(h.root.dataset.cinema).toBe('ready'); expect(frames.size).toBe(0);
    expect(h.typed.textContent).toBe('Um canal aberto. Sua mensagem é a próxima semente.');
    h.visible(false); h.visible(true); expect(frames.size).toBe(0);
    h.dispose();
  });
  it('freezes elapsed time offscreen and in hidden tabs, resuming without a time jump', () => {
    const h = harness(); h.visible(true); tick(400);
    const text = h.typed.textContent;
    h.visible(false); expect(frames.size).toBe(0); tick(6000); expect(h.typed.textContent).toBe(text);
    h.visible(true); doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
    expect(h.root.dataset.paused).toBe('true'); expect(frames.size).toBe(0);
    tick(6000); doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); tick(20);
    expect(h.typed.textContent).toBe(text);
    tick(2400); expect(h.root.dataset.cinema).toBe('ready'); h.dispose();
  });
  it('celebrates only ok, once per successful submission, for 2–3 seconds', () => {
    const h = harness(); h.visible(true); tick(2700);
    for (const status of ['pending', 'invalid', 'captcha', 'error', 'unavailable']) h.status(status);
    expect(h.root.dataset.cinema).toBe('ready'); expect(h.celebrate).not.toHaveBeenCalled();
    h.status('ok'); tick(20); expect(h.root.dataset.cinema).toBe('celebrating'); expect(h.celebrate).toHaveBeenCalledTimes(1);
    h.status('ok'); tick(2100); expect(h.root.dataset.cinema).toBe('celebrating');
    tick(600); expect(h.root.dataset.cinema).toBe('success'); expect(frames.size).toBe(0);
    h.status('pending'); expect(h.root.dataset.cinemaSuccess).toBeUndefined(); h.status('ok'); tick(20);
    expect(h.celebrate).toHaveBeenCalledTimes(2); h.dispose();
  });
  it('queues a hidden-tab success without rendering or sound until visible', () => {
    const h = harness(); h.visible(true); doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
    h.status('ok'); tick(5000); expect(frames.size).toBe(0); expect(h.celebrate).not.toHaveBeenCalled();
    doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); tick(20);
    expect(h.celebrate).toHaveBeenCalledTimes(1); expect(h.root.dataset.cinema).toBe('celebrating'); h.dispose();
  });
  it('keeps the success duration below three seconds even at ten frames per second', () => {
    const h = harness(); h.visible(true); h.status('ok'); tick(20);
    for (let i = 0; i < 27; i++) {
      now += 100;
      const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now));
    }
    expect(h.root.dataset.cinema).toBe('success'); expect(frames.size).toBe(0); h.dispose();
  });
  it('reduced motion shows final copy and sprout without frames; sound remains opt-in independently', () => {
    const h = harness(false); h.status('ok');
    expect(h.root.dataset.cinema).toBe('success'); expect(h.root.dataset.cinemaSuccess).toBe('true');
    expect(h.typed.textContent).toContain('próxima semente');
    expect(intersections).toHaveLength(0); expect(resizes).toHaveLength(0); expect(frames.size).toBe(0);
    expect(h.ctx.fillRect).not.toHaveBeenCalled(); expect(h.celebrate).toHaveBeenCalledTimes(1); h.dispose();
  });
  it('cleanup settles mid-celebration, disconnects observers and ignores queued callbacks', () => {
    const h = harness(); h.visible(true); h.status('ok'); tick(300);
    const queued = [...frames.values()]; h.dispose();
    expect(h.root.dataset.cinema).toBe('success'); expect(h.typed.textContent).toContain('próxima semente');
    expect(frames.size).toBe(0);
    for (const observer of [...intersections, ...mutations, ...resizes]) expect(observer.disconnect).toHaveBeenCalledOnce();
    queued.forEach(fn => fn(10000)); h.visible(true); h.status('pending'); doc.dispatchEvent(new Event('visibilitychange'));
    expect(h.root.dataset.cinema).toBe('success'); expect(frames.size).toBe(0);
  });
  it('enabling motion after a static success never replays the celebration', () => {
    const h = harness(true, 'ok'); h.visible(true); tick(3000);
    expect(h.root.dataset.cinema).toBe('success'); expect(frames.size).toBe(0); expect(h.celebrate).not.toHaveBeenCalled(); h.dispose();
  });
  it('uses the current locale copy, even if an effect cleanup left old text in the DOM', () => {
    const h = harness(false, 'idle', 'Un canal abierto. Tu mensaje es la próxima semilla.');
    expect(h.typed.textContent).toBe('Un canal abierto. Tu mensaje es la próxima semilla.'); h.dispose();
  });
  it('switching to reduced motion mid-arrival preserves complete copy and cancels all frames', () => {
    const h = harness(); h.visible(true); tick(500); h.dispose();
    const dispose = mountContactCinema({ ...h, invitation: 'Um canal aberto. Sua mensagem é a próxima semente.', motion: false });
    expect(h.typed.textContent).toBe('Um canal aberto. Sua mensagem é a próxima semente.');
    expect(h.root.dataset.cinema).toBe('ready'); expect(frames.size).toBe(0);
    dispose();
  });
});
