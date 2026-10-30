"use client";
import { MOBILE_EGG_QUERY } from "@/lib/mobile-eggs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { locales, localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { SocialLinks } from "./SocialLinks";
import { PageEffects } from "./PageEffects";
import { SmoothScroll } from "./motion/SmoothScroll";
import { FxLayer } from "./motion/FxLayer";
import { getAudioLevels, isSoundEnabled, setAudioLevels, setSoundEnabled } from "@/lib/sfx";
import { KONAMI_GESTURES, discover, emitEgg, gestureOf, konamiStep, onEgg } from "@/lib/eggs";
import { Comlink } from "./Comlink";
import { StickyCta } from "./StickyCta";
import { DeepNight } from "./eggs/ExtraEggs";
import { whenBootDone } from "@/lib/boot";

const SOUND_INVITE_KEY = "sound-invite-seen";

// Secret star map: the stars draw "GL" and, beside it, Prince's paw.
const MAP_STARS = [[6, 6], [2, 10], [2, 18], [6, 22], [11, 20], [11, 15], [8, 15], [17, 6], [17, 22], [24, 22], [33, 14], [30, 9], [33, 7], [36, 9], [39, 12], [32, 18], [38, 18]] as const;
const MAP_LINES = "M6 6 2 10V18L6 22 11 20V15H8M17 6V22H24";
function StarMap() {
  return <svg className="star-map" viewBox="0 0 42 28" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <path className="star-map__line" d={MAP_LINES} pathLength={1} />
    {MAP_STARS.map(([x, y], index) => <rect className={index > 9 ? "star-map__star star-map__star--paw" : "star-map__star"} key={index} x={x - .5} y={y - .5} width="1" height="1" style={{ animationDelay: `${index * 60}ms` }} />)}
  </svg>;
}

// Reading order: who I am, what I built, where I spoke, how to hire me; content (mostly external links) last.
export const routes = [["home", ""], ["about", "sobre"], ["projects", "projetos"], ["events", "eventos"], ["services", "servicos"], ["content", "conteudo"]] as const;

export function SiteChrome({ lang, dictionary, children }: Readonly<{ lang: Locale; dictionary: Dictionary; children: ReactNode }>) {
  const pathname = usePathname(); const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null); const [egg, setEgg] = useState(false); const [menuOpen, setMenuOpen] = useState(false);
  const [sound, setSound] = useState(false); const [scrolled, setScrolled] = useState(false); const [comlinkSlot, setComlinkSlot] = useState<HTMLSpanElement | null>(null);
  const [audioOpen, setAudioOpen] = useState(false);
  const [levels, setLevels] = useState({ music: .3, effects: 1 });
  // First visit: one quiet invitation to turn the sound on (nothing plays before a click); then the radio hint.
  const [invite, setInvite] = useState(false); const [guideReady, setGuideReady] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = whenBootDone(() => { timer = setTimeout(() => {
      let seen = true;
      try { seen = localStorage.getItem(SOUND_INVITE_KEY) === "1"; } catch { /* No storage: no invitation. */ }
      if (!seen && !isSoundEnabled()) setInvite(true); else setGuideReady(true);
    }, 1500); });
    return () => { stop(); clearTimeout(timer); };
  }, []);
  useEffect(() => {
    const toast = document.querySelector<HTMLElement>(".sound-invite");
    if (!invite || !toast) return;
    const update = () => document.documentElement.style.setProperty("--mobile-sound-space", `${toast.getBoundingClientRect().height + (parseFloat(getComputedStyle(toast).bottom) || 0)}px`);
    const observer = new ResizeObserver(update); observer.observe(toast); update();
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--mobile-sound-space"); };
  }, [invite]);
  const answerInvite = (on: boolean) => {
    setInvite(false); setGuideReady(true);
    try { localStorage.setItem(SOUND_INVITE_KEY, "1"); } catch { /* The choice still applies now. */ }
    if (on && !sound) { setSoundEnabled(true); setSound(true); }
  };
  useEffect(() => { try { setReduced(localStorage.getItem("reduce-motion") === "true"); } catch { setReduced(false); } setSound(isSoundEnabled()); setLevels(getAudioLevels()); }, []);
  useEffect(() => { if (reduced === null) return; document.documentElement.classList.toggle("reduce-motion", reduced); try { localStorage.setItem("reduce-motion", String(reduced)); } catch { /* Browsing without storage still supports the control. */ } }, [reduced]);
  useEffect(() => { const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let position = 0; const onKey = (event: KeyboardEvent) => { position = event.key?.toLowerCase() === code[position]?.toLowerCase() ? position + 1 : 0; if (position === code.length) { emitEgg("star-map"); position = 0; } }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  // Konami on touch screens: swipe ↑ ↑ ↓ ↓ ← → ← → and tap twice.
  useEffect(() => {
    let position = 0; let start: { x: number; y: number; t: number } | null = null;
    const down = (event: TouchEvent) => { if (matchMedia(MOBILE_EGG_QUERY).matches && (event.target as Element).closest(".page-hero")) { start = null; return; } const touch = event.touches[0]; start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY, t: performance.now() } : null; };
    const up = (event: TouchEvent) => {
      const touch = event.changedTouches[0]; if (!start || !touch) return;
      const gesture = gestureOf(touch.clientX - start.x, touch.clientY - start.y, performance.now() - start.t); start = null;
      if (!gesture) return;
      position = konamiStep(position, gesture);
      if (position === KONAMI_GESTURES.length) { position = 0; emitEgg("star-map"); }
    };
    addEventListener("touchstart", down, { passive: true }); addEventListener("touchend", up, { passive: true });
    const stop = onEgg("star-map", () => { discover("star-map"); setEgg(true); });
    return () => { removeEventListener("touchstart", down); removeEventListener("touchend", up); stop(); };
  }, []);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (egg && !reduced && !matchMedia("(prefers-reduced-motion: reduce)").matches && !dialog.open) dialog.showModal(); if ((!egg || reduced) && dialog.open) dialog.close(); }, [egg, reduced]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (menuOpen) document.querySelector<HTMLAnchorElement>("#primary-navigation a")?.focus();
  }, [menuOpen]);
  useEffect(() => {
    const wide = matchMedia("(min-width: 1440px)");
    const close = () => {
      setMenuOpen(false);
      if (!wide.matches && document.activeElement?.closest("#primary-navigation")) menuRef.current?.focus();
    };
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      document.documentElement.style.setProperty("--visible-height", `${viewport.height}px`);
      document.documentElement.style.setProperty("--visible-top", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update); viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update); viewport.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--visible-height"); document.documentElement.style.removeProperty("--visible-top");
    };
  }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuRef.current?.focus(); } }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, [menuOpen]);
  useEffect(() => { const onScroll = () => setScrolled(scrollY > 24); onScroll(); addEventListener("scroll", onScroll, { passive: true }); return () => removeEventListener("scroll", onScroll); }, []);
  const go = (href: string) => { setMenuOpen(false); router.push(href); };
  const toggleSound = () => { setSoundEnabled(!sound); setSound(!sound); };
  const top = () => { if (window.__lenis) window.__lenis.scrollTo(0); else scrollTo({ top: 0 }); document.getElementById("main")?.focus({ preventScroll: true }); };
  return <>
    <a className="skip-link" href="#main">{dictionary.accessibility.skip}</a>
    <header className="site-header" data-scrolled={scrolled}>
      <Link href={`/${lang}`} className="brand" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(`/${lang}`); }}><span className="brand__mark" aria-hidden="true" />GL<span>.</span></Link>
      <nav id="primary-navigation" className={menuOpen ? "is-open" : ""} aria-label={dictionary.accessibility.primaryNav}>{routes.map(([key, slug], index) => { const href = `/${lang}${slug ? `/${slug}` : ""}`; return <Link className={pathname === href ? "active" : ""} aria-current={pathname === href ? "page" : undefined} href={href} key={key} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(href); }}><span className="nav-index" aria-hidden="true">0{index + 1}</span>{dictionary.nav[key]}</Link>; })}<div className="nav-preferences">
        <button className="motion-toggle" type="button" aria-pressed={Boolean(reduced)} onClick={() => setReduced((value) => !value)}>{reduced ? dictionary.motion.enable : dictionary.motion.reduce}</button>
      </div></nav>
      <div className="header-tools">
        {/* Sound: always visible (also on phones). The icon toggles it; the chevron opens music and effects levels. */}
        <div className="sound-control">
          <button className="sound-toggle" type="button" aria-pressed={sound} aria-label={sound ? dictionary.holonet.sound.off : dictionary.holonet.sound.on} title={sound ? dictionary.holonet.sound.off : dictionary.holonet.sound.on} onClick={toggleSound}>
            <svg viewBox="0 0 16 16" width="16" height="16" shapeRendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 6h3V5h1V4h1V3h1v10H7v-1H6v-1H5v-1H2z" />{sound ? <path fill="currentColor" d="M10 6h1v4h-1zM12 4h1v8h-1zM14 2h1v12h-1z" /> : <path fill="currentColor" d="M10 5h1v1h1v1h1V6h1V5h1v1h-1v1h-1v2h1v1h1v1h-1v-1h-1V9h-1v1h-1v1h-1v-1h1V9h1V7h-1V6h-1z" />}</svg>
          </button>
          <div className="audio-settings" onKeyDown={event => { if (event.key === 'Escape' && audioOpen) { event.stopPropagation(); setAudioOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('.audio-settings__toggle')?.focus(); } }}>
            <button type="button" className="audio-settings__toggle" aria-expanded={audioOpen} aria-controls="audio-settings-panel" aria-label={dictionary.holonet.sound.settings} title={dictionary.holonet.sound.settings} onClick={() => setAudioOpen(value => !value)}><span aria-hidden="true">▾</span></button>
            <div id="audio-settings-panel" className="audio-settings__panel" hidden={!audioOpen}>
              {(['music', 'effects'] as const).map(channel => <label key={channel}>{dictionary.holonet.sound[channel]} <output>{Math.round(levels[channel] * 100)}%</output>
                <input type="range" min="0" max="100" value={Math.round(levels[channel] * 100)} onChange={event => { const next = { ...levels, [channel]: Number(event.target.value) / 100 }; setLevels(next); setAudioLevels(next); }} />
              </label>)}
            </div>
          </div>
        </div>
        <label className="sr-only" htmlFor="locale">{dictionary.nav.language}</label><select id="locale" value={lang} onChange={(event) => go(localizePath(pathname, event.target.value as Locale))}>{locales.map((locale) => <option value={locale} key={locale}>{locale.toUpperCase()}</option>)}</select>
        <span className="comlink-slot" ref={setComlinkSlot} />
      </div>
      <button ref={menuRef} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={dictionary.accessibility.primaryNav} onClick={() => setMenuOpen((open) => !open)}><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></button>
    </header>
    {children}
    <PageEffects />
    <SmoothScroll />
    <FxLayer />
    <StickyCta lang={lang} pathname={pathname} />
    <DeepNight lang={lang} />
    <footer>
      <div className="footer-hud" aria-hidden="true"><span>GL-OS // GALÁXIA ENCANTADA</span><span className="footer-hud__signal"><i /><i /><i /><i /></span><span>{dictionary.holonet.credits.end}</span></div>
      <div><strong>Glaucia Lemos</strong><p>{dictionary.footer.tagline}</p></div><SocialLinks labels={dictionary.footer.socialLabels} />
      <small>© {new Date().getFullYear()} · {dictionary.footer.rights}<button type="button" className="footer-top" onClick={top}>{dictionary.holonet.credits.top} <span aria-hidden="true">↑</span></button></small>
      <p className="footer-notice">{dictionary.footer.independenceNotice}</p>
    </footer>
    {invite && <aside className="sound-invite" aria-label={dictionary.holonet.sound.settings}>
      <p>{dictionary.holonet.sound.invite}</p>
      <div><button type="button" className="button primary" onClick={() => answerInvite(true)}>{dictionary.holonet.sound.inviteOn}</button><button type="button" className="sound-invite__later" onClick={() => answerInvite(false)}>{dictionary.holonet.sound.inviteOff}</button></div>
    </aside>}
    <Comlink copy={dictionary.comlink} pathname={pathname} slot={comlinkSlot} hintReady={guideReady} />
    <dialog ref={dialogRef} className="egg-overlay" aria-label={dictionary.easterEgg.message} onCancel={() => setEgg(false)}><StarMap /><p>{dictionary.easterEgg.message}</p><button autoFocus onClick={() => setEgg(false)}>{dictionary.easterEgg.close}</button></dialog>
  </>;
}
