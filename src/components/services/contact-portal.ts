import { gsap } from '@/lib/gsap';
import { motionAllowed } from '@/lib/use-motion';
import { whenBootDone } from '@/lib/boot';
import type { SoundKind } from '@/lib/sfx';
import { createPortalSky, createSignalSky, portalRadius, type LaunchState } from './portal-sky';

export const PORTAL_HASH = '#contato';
export type CrewFaces = { glaucia: string; prince: string };
export type PortalCopy = { close: string; sending: string; delivered: string; failed: string };

/** A contact CTA on this page opens the portal; one that changes `?assunto=` navigates first and the new form opens it. */
export function portalTarget(href: string, here: { pathname: string; search: string; href: string }) {
  let url: URL;
  try { url = new URL(href, here.href); } catch { return null; }
  if (url.hash !== PORTAL_HASH || url.origin !== new URL(here.href).origin || url.pathname !== here.pathname) return null;
  return url.search === here.search ? 'open' as const : 'navigate' as const;
}

/** Glaucia and Prince follow the form: one approved portrait each, never an invented pose. */
export function crewReaction({ status, step, flaw }: { status?: string; step?: string; flaw: boolean }): CrewFaces {
  if (status === 'ok') return { glaucia: 'face-smile', prince: 'face-joy' };
  if (status === 'pending') return { glaucia: 'face-look', prince: 'face-curious' };
  if (flaw || status === 'invalid' || status === 'error' || status === 'captcha') return { glaucia: 'face-neutral', prince: 'face-curious' };
  if (step === '1') return { glaucia: 'face-look', prince: 'face-happy' };
  if (step === '2') return { glaucia: 'face-thoughtful', prince: 'face-happy' };
  return { glaucia: 'face-smile', prince: 'face-idle' };
}

type PortalElements = {
  root: HTMLElement; dock: HTMLElement; portal: HTMLElement; stage: HTMLElement; panel: HTMLElement; close: HTMLButtonElement;
  vortex: HTMLCanvasElement; launch: HTMLElement; signal: HTMLCanvasElement; caption: HTMLElement; crew: HTMLElement | null;
  copy: () => PortalCopy; sound: (kind: SoundKind) => void;
};
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
const visible = (element: HTMLElement) => typeof element.checkVisibility === 'function' ? element.checkVisibility() : element.offsetParent !== null;
// Set by a click that changes ?assunto=: the remounted form (same hash) opens the portal once.
let pendingOpen = false;

/**
 * The contact panel itself lifts into the top layer (popover) as a full-screen portal: nothing is cloned or moved,
 * so the form keeps its state, and without JS it simply stays where it is.
 */
export function mountContactPortal(el: PortalElements) {
  const { root, dock, portal, stage, panel } = el;
  const html = document.documentElement;
  const popover = typeof portal.showPopover === 'function';
  const sky = createPortalSky(el.vortex), signal = createSignalSky(el.signal);
  let open = false, destroyed = false, origin = { x: 0, y: 0 }, returnFocus: HTMLElement | null = null;
  let transition: gsap.core.Timeline | null = null, launch: gsap.core.Timeline | null = null, ambient = false;
  let flawTimer: ReturnType<typeof setTimeout> | undefined, flawUntil = 0, lastFlaw = panel.dataset.contactFlaw;
  let lastStatus = panel.dataset.contactStatus;
  const state: LaunchState = { rise: 0, burst: 0, fall: 0 };

  const tick = (_: number, delta: number) => {
    if (html.classList.contains('reduce-motion')) return;
    sky.tick(delta / 1000);
  };
  const stopAmbient = () => { if (ambient) gsap.ticker.remove(tick); ambient = false; };
  const startAmbient = () => { if (!ambient && open && motionAllowed()) { gsap.ticker.add(tick); ambient = true; } };

  const lift = () => {
    dock.style.minHeight = `${dock.offsetHeight}px`;
    portal.setAttribute('role', 'dialog'); portal.setAttribute('aria-modal', 'true'); portal.setAttribute('aria-labelledby', 'contact-title');
    portal.dataset.open = 'true'; root.dataset.portal = 'open'; html.dataset.contactPortal = 'open';
    if (popover) { portal.setAttribute('popover', 'manual'); try { portal.showPopover(); } catch { /* Already shown. */ } }
    el.close.hidden = false;
    window.__lenis?.stop();
    sky.resize(); signal.resize();
  };
  const land = () => {
    stopAmbient(); transition?.kill(); transition = null; resetLaunch();
    if (popover && portal.hasAttribute('popover')) { try { portal.hidePopover(); } catch { /* Already hidden. */ } portal.removeAttribute('popover'); }
    for (const name of ['role', 'aria-modal', 'aria-labelledby']) portal.removeAttribute(name);
    delete portal.dataset.open; root.dataset.portal = 'closed'; delete html.dataset.contactPortal;
    el.close.hidden = true; dock.style.minHeight = '';
    gsap.set([portal, stage], { clearProps: 'clipPath,opacity,transform' });
    sky.clear();
    window.__lenis?.start();
  };
  // The dialog's title takes focus: context for screen readers, and no virtual keyboard popping up on phones.
  const focusInside = () => {
    const title = panel.querySelector<HTMLElement>('h2');
    if (!title) { el.close.focus({ preventScroll: true }); return; }
    title.tabIndex = -1; title.focus({ preventScroll: true });
  };

  function openPortal(point?: { x: number; y: number }, instant = false) {
    if (open || destroyed) return;
    open = true;
    returnFocus = document.activeElement instanceof HTMLElement && !portal.contains(document.activeElement) ? document.activeElement : null;
    origin = point ?? { x: innerWidth / 2, y: innerHeight / 2 };
    lift();
    focusInside();
    if (instant || !motionAllowed()) { sky.open(1); startAmbient(); return; }
    el.sound('relay');
    const radius = portalRadius(origin.x, origin.y, innerWidth, innerHeight);
    const iris = { p: 0 };
    transition = gsap.timeline({ onComplete: () => { gsap.set(portal, { clearProps: 'clipPath' }); startAmbient(); } })
      .fromTo(portal, { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`, duration: .95, ease: 'expo.inOut' }, 0)
      .to(iris, { p: 1, duration: 1.4, ease: 'power3.out', onUpdate: () => sky.open(iris.p) }, 0)
      .fromTo(stage, { opacity: 0, y: 34, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out', clearProps: 'opacity,transform' }, .4);
  }
  function closePortal() {
    if (!open || destroyed) return;
    open = false;
    const finish = () => {
      land();
      if (location.hash === PORTAL_HASH) history.replaceState(history.state, '', location.pathname + location.search);
      const back = returnFocus?.isConnected ? returnFocus : root.querySelector<HTMLElement>('.contact-cinema__invitation');
      if (back && back === root.querySelector('.contact-cinema__invitation')) back.tabIndex = -1;
      back?.focus({ preventScroll: true }); returnFocus = null;
    };
    stopAmbient(); transition?.kill();
    if (!motionAllowed()) { finish(); return; }
    transition = gsap.timeline({ onComplete: finish })
      .to(stage, { opacity: 0, y: 18, duration: .25, ease: 'power2.in' }, 0)
      .fromTo(portal, { clipPath: `circle(${portalRadius(origin.x, origin.y, innerWidth, innerHeight)}px at ${origin.x}px ${origin.y}px)` },
        { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`, duration: .55, ease: 'expo.in' }, .1);
  }

  // The launch: charge while the action runs, then climb to the stars (ok) or falter and fall (any failure).
  const drawSignal = () => signal.draw(state);
  function resetLaunch() {
    launch?.kill(); launch = null; Object.assign(state, { rise: 0, burst: 0, fall: 0 });
    delete el.launch.dataset.launch; el.caption.textContent = ''; gsap.set(el.launch, { clearProps: 'opacity' }); signal.clear();
  }
  function charge() {
    resetLaunch();
    el.launch.dataset.launch = 'charging'; el.caption.textContent = el.copy().sending;
    el.sound('launch');
    launch = gsap.timeline().fromTo(el.launch, { opacity: 0 }, { opacity: 1, duration: .35 }, 0)
      .to(state, { rise: .34, duration: 1.1, ease: 'power2.out', onUpdate: drawSignal }, 0);
  }
  function resolve(ok: boolean) {
    if (!launch) return;
    const done = () => {
      resetLaunch();
      const target = ok ? panel.querySelector<HTMLElement>('h2') : panel.querySelector<HTMLElement>('button[type=submit]');
      if (open && target && !portal.contains(document.activeElement)) { if (ok) target.tabIndex = -1; target.focus({ preventScroll: true }); }
    };
    if (ok) launch
      .to(state, { rise: 1, duration: 1.1, ease: 'power3.in', onUpdate: drawSignal })
      .call(() => { el.launch.dataset.launch = 'delivered'; el.caption.textContent = el.copy().delivered; })
      .to(state, { burst: 1, duration: 1.3, ease: 'power2.out', onUpdate: drawSignal })
      .to(el.launch, { opacity: 0, duration: .5 }, '+=.35').call(done);
    else launch
      .to(state, { rise: Math.min(.62, state.rise + .2), duration: .55, ease: 'power1.out', onUpdate: drawSignal })
      .call(() => { el.launch.dataset.launch = 'failed'; el.caption.textContent = el.copy().failed; el.sound('error'); })
      .to(state, { fall: 1, duration: 1.1, ease: 'power2.in', onUpdate: drawSignal })
      .to(el.launch, { opacity: 0, duration: .4 }, '+=.2').call(done);
    launch.play();
  }

  const react = () => {
    const status = panel.dataset.contactStatus, flaw = panel.dataset.contactFlaw;
    if (flaw !== lastFlaw) {
      lastFlaw = flaw;
      if (flaw) { flawUntil = performance.now() + 2400; el.sound('greenhouse'); }
      clearTimeout(flawTimer); flawTimer = setTimeout(react, 2450);
    }
    const faces = crewReaction({ status, step: panel.dataset.contactStaged ? panel.dataset.contactStep : undefined, flaw: performance.now() < flawUntil });
    const changed = root.dataset.glaucia !== faces.glaucia || root.dataset.prince !== faces.prince;
    root.dataset.glaucia = faces.glaucia; root.dataset.prince = faces.prince;
    if (changed && el.crew && motionAllowed() && typeof el.crew.animate === 'function')
      el.crew.querySelectorAll<HTMLElement>('.contact-crew__face').forEach((face, index) => face.animate(
        [{ translate: '0 0' }, { translate: '0 -6px' }, { translate: '0 0' }], { duration: 360, delay: index * 90, easing: 'steps(4)' }));
    if (status === lastStatus) return;
    const previous = lastStatus; lastStatus = status;
    if (status === 'pending') {
      if (!motionAllowed()) return;
      if (!open) openPortal(undefined, true);
      charge();
    } else if (previous === 'pending') resolve(status === 'ok');
  };
  let lastStep = panel.dataset.contactStep;
  const observer = new MutationObserver(() => {
    if (destroyed) return;
    if (panel.dataset.contactStep !== lastStep) { const forward = Number(panel.dataset.contactStep) > Number(lastStep); lastStep = panel.dataset.contactStep; if (forward) el.sound('seed'); }
    react();
  });
  observer.observe(panel, { attributes: true, attributeFilter: ['data-contact-status', 'data-contact-step', 'data-contact-flaw', 'data-contact-staged'] });
  react();

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    if (!link || portal.contains(link) || (link.target && link.target !== '_self')) return;
    const target = portalTarget(link.getAttribute('href') ?? '', location);
    if (target === 'navigate') { pendingOpen = true; return; }
    if (target !== 'open') return;
    event.preventDefault(); event.stopPropagation();
    const box = link.getBoundingClientRect();
    openPortal(event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : { x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };
  const onKey = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closePortal(); return; }
    if (event.key !== 'Tab') return;
    const items = Array.from(portal.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1], active = document.activeElement;
    if (!portal.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  };
  const onFocus = (event: FocusEvent) => { if (open && event.target instanceof Node && !portal.contains(event.target)) focusInside(); };
  const onResize = () => { if (open) { sky.resize(); signal.resize(); } };
  const closeClick = () => closePortal();
  addEventListener('click', onClick, true);
  addEventListener('keydown', onKey, true);
  document.addEventListener('focusin', onFocus);
  addEventListener('resize', onResize);
  el.close.addEventListener('click', closeClick);
  root.dataset.portal = 'closed';

  // Arriving with #contato (another page's CTA, a bookmark or a subject change) opens the portal after the intro.
  let stopBoot = () => {};
  if (location.hash === PORTAL_HASH || pendingOpen) {
    pendingOpen = false;
    stopBoot = whenBootDone(() => requestAnimationFrame(() => openPortal()));
  }

  return {
    open: openPortal, close: closePortal,
    destroy() {
      destroyed = true; stopBoot(); observer.disconnect(); clearTimeout(flawTimer);
      removeEventListener('click', onClick, true); removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', onFocus); removeEventListener('resize', onResize);
      el.close.removeEventListener('click', closeClick);
      if (open) { open = false; land(); }
      resetLaunch();
    },
  };
}
