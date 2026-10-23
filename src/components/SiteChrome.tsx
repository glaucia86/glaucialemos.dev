"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { locales, localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { SocialLinks } from "./SocialLinks";
import { PageEffects } from "./PageEffects";
import { SmoothScroll } from "./motion/SmoothScroll";
import { FxLayer } from "./motion/FxLayer";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sfx";

const routes = [["home", ""], ["about", "sobre"], ["projects", "projetos"], ["content", "conteudo"], ["events", "eventos"], ["services", "servicos"]] as const;

export function SiteChrome({ lang, dictionary, children }: { lang: Locale; dictionary: Dictionary; children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null); const [egg, setEgg] = useState(false); const [menuOpen, setMenuOpen] = useState(false);
  const [sound, setSound] = useState(false); const [scrolled, setScrolled] = useState(false);
  useEffect(() => { try { setReduced(localStorage.getItem("reduce-motion") === "true"); } catch { setReduced(false); } setSound(isSoundEnabled()); }, []);
  useEffect(() => { if (reduced === null) return; document.documentElement.classList.toggle("reduce-motion", reduced); try { localStorage.setItem("reduce-motion", String(reduced)); } catch { /* Browsing without storage still supports the control. */ } }, [reduced]);
  useEffect(() => { const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let position = 0; const onKey = (event: KeyboardEvent) => { position = event.key.toLowerCase() === code[position]?.toLowerCase() ? position + 1 : 0; if (position === code.length) { setEgg(true); position = 0; } }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (egg && !reduced && !matchMedia("(prefers-reduced-motion: reduce)").matches && !dialog.open) dialog.showModal(); if ((!egg || reduced) && dialog.open) dialog.close(); }, [egg, reduced]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  useEffect(() => { const onScroll = () => setScrolled(scrollY > 24); onScroll(); addEventListener("scroll", onScroll, { passive: true }); return () => removeEventListener("scroll", onScroll); }, []);
  const go = (href: string) => { setMenuOpen(false); router.push(href); };
  const toggleSound = () => { setSoundEnabled(!sound); setSound(!sound); };
  const top = () => { if (window.__lenis) window.__lenis.scrollTo(0); else scrollTo({ top: 0 }); document.getElementById("main")?.focus({ preventScroll: true }); };
  return <>
    <a className="skip-link" href="#main">{dictionary.accessibility.skip}</a>
    <header className="site-header" data-scrolled={scrolled}>
      <Link href={`/${lang}`} className="brand" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(`/${lang}`); }}><span className="brand__mark" aria-hidden="true" />GL<span>.</span></Link>
      <nav id="primary-navigation" className={menuOpen ? "is-open" : ""} aria-label={dictionary.accessibility.primaryNav}>{routes.map(([key, slug], index) => { const href = `/${lang}${slug ? `/${slug}` : ""}`; return <Link className={pathname === href ? "active" : ""} aria-current={pathname === href ? "page" : undefined} href={href} key={key} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(href); }}><span className="nav-index" aria-hidden="true">0{index}</span>{dictionary.nav[key]}</Link>; })}</nav>
      <div className="header-tools">
        <label className="sr-only" htmlFor="locale">{dictionary.nav.language}</label><select id="locale" value={lang} onChange={(event) => go(localizePath(pathname, event.target.value as Locale))}>{locales.map((locale) => <option value={locale} key={locale}>{locale.toUpperCase()}</option>)}</select>
        <button className="sound-toggle" type="button" aria-pressed={sound} aria-label={sound ? dictionary.holonet.sound.off : dictionary.holonet.sound.on} title={sound ? dictionary.holonet.sound.off : dictionary.holonet.sound.on} onClick={toggleSound}>
          <svg viewBox="0 0 16 16" width="16" height="16" shapeRendering="crispEdges" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 6h3V5h1V4h1V3h1v10H7v-1H6v-1H5v-1H2z" />{sound ? <path fill="currentColor" d="M10 6h1v4h-1zM12 4h1v8h-1zM14 2h1v12h-1z" /> : <path fill="currentColor" d="M10 5h1v1h1v1h1V6h1V5h1v1h-1v1h-1v2h1v1h1v1h-1v-1h-1V9h-1v1h-1v1h-1v-1h1V9h1V7h-1V6h-1z" />}</svg>
        </button>
        <button className="motion-toggle" type="button" aria-pressed={Boolean(reduced)} onClick={() => setReduced((value) => !value)}>{reduced ? dictionary.motion.enable : dictionary.motion.reduce}</button>
      </div>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={dictionary.accessibility.primaryNav} onClick={() => setMenuOpen((open) => !open)}><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></button>
    </header>
    {children}
    <PageEffects />
    <SmoothScroll />
    <FxLayer />
    <footer>
      <div className="footer-hud" aria-hidden="true"><span>GL-OS // HOLONET</span><span className="footer-hud__signal"><i /><i /><i /><i /></span><span>{dictionary.holonet.credits.end}</span></div>
      <div><strong>Glaucia Lemos</strong><p>{dictionary.footer.tagline}</p></div><SocialLinks labels={dictionary.footer.socialLabels} />
      <small>© {new Date().getFullYear()} · {dictionary.footer.rights}<button type="button" className="footer-top" onClick={top}>{dictionary.holonet.credits.top} <span aria-hidden="true">↑</span></button></small>
    </footer>
    <dialog ref={dialogRef} className="egg-overlay" aria-label={dictionary.easterEgg.message} onCancel={() => setEgg(false)}><div className="lightsaber" /><p>{dictionary.easterEgg.message}</p><button autoFocus onClick={() => setEgg(false)}>{dictionary.easterEgg.close}</button></dialog>
  </>;
}
