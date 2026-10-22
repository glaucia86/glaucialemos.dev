"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { locales, localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { SocialLinks } from "./SocialLinks";
import { ReducedMotionContext, useMotionPreference } from "./MotionPreference";

const routes = [["home", ""], ["about", "sobre"], ["projects", "projetos"], ["content", "conteudo"], ["events", "eventos"], ["services", "servicos"]] as const;

export function SiteChrome({ lang, dictionary, children }: { lang: Locale; dictionary: Dictionary; children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { reduced, system, ready, toggle } = useMotionPreference();
  const [egg, setEgg] = useState(false); const [jumping, setJumping] = useState(false); const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let position = 0; const onKey = (event: KeyboardEvent) => { position = event.key.toLowerCase() === code[position]?.toLowerCase() ? position + 1 : 0; if (position === code.length) { setEgg(true); position = 0; } }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (egg && !reduced && !dialog.open) dialog.showModal(); if ((!egg || reduced) && dialog.open) dialog.close(); }, [egg, reduced]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  const go = (href: string) => { setMenuOpen(false); if (reduced === false) { setJumping(true); window.setTimeout(() => { router.push(href); window.setTimeout(() => setJumping(false), 520); }, 160); } else router.push(href); };
  return <ReducedMotionContext.Provider value={reduced}>
    <a className="skip-link" href="#main">{dictionary.accessibility.skip}</a>
    <header className="site-header">
      <Link href={`/${lang}`} className="brand" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(`/${lang}`); }}>GL<span>.</span></Link>
      <nav id="primary-navigation" className={menuOpen ? "is-open" : ""} aria-label={dictionary.accessibility.primaryNav}>{routes.map(([key, slug]) => { const href = `/${lang}${slug ? `/${slug}` : ""}`; return <Link className={pathname === href ? "active" : ""} href={href} key={key} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(href); }}>{dictionary.nav[key]}</Link>; })}</nav>
      <div className="header-tools"><label className="sr-only" htmlFor="locale">{dictionary.nav.language}</label><select id="locale" value={lang} onChange={(event) => go(localizePath(pathname, event.target.value as Locale))}>{locales.map((locale) => <option value={locale} key={locale}>{locale.toUpperCase()}</option>)}</select><button className="motion-toggle" type="button" aria-pressed={reduced} disabled={!ready || system} onClick={toggle}>{system ? dictionary.motion.system : reduced ? dictionary.motion.enable : dictionary.motion.reduce}</button></div>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={dictionary.accessibility.primaryNav} onClick={() => setMenuOpen((open) => !open)}><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></button>
    </header>
    {children}
    <footer><div><strong>Glaucia Lemos</strong><p>{dictionary.footer.tagline}</p></div><SocialLinks labels={dictionary.footer.socialLabels} /><small>© {new Date().getFullYear()} · {dictionary.footer.rights}</small></footer>
    <div className={`hyperspace ${jumping ? "is-active" : ""}`} aria-hidden="true" />
    <dialog ref={dialogRef} className="egg-overlay" aria-label={dictionary.easterEgg.message} onCancel={() => setEgg(false)}><div className="lightsaber" /><p>{dictionary.easterEgg.message}</p><button autoFocus onClick={() => setEgg(false)}>{dictionary.easterEgg.close}</button></dialog>
  </ReducedMotionContext.Provider>;
}
