"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { commercial } from "@/i18n/commercial";

// Pages where the visitor reads about Glaucia; Services already has the form, the secret pages tell their own story.
export const STICKY_CTA_SLUGS = ["", "sobre", "projetos", "eventos", "conteudo"] as const;
export const stickyCtaVisible = (pathname: string, lang: Locale) => STICKY_CTA_SLUGS.some(slug => pathname === `/${lang}${slug ? `/${slug}` : ""}`);
const DISMISSED = "cta-nudge-dismissed";

type Mode = "hidden" | "bar" | "nudge";

// Always-present way to start a conversation: a small bar after the first screen; at the end of the page it opens into
// a short invitation ("Made it this far?"). Never a blocking pop-up: "Not now" keeps only the bar, for this session.
export function StickyCta({ lang, pathname }: { lang: Locale; pathname: string }) {
  const [mode, setMode] = useState<Mode>("hidden");
  const enabled = stickyCtaVisible(pathname, lang);
  useEffect(() => {
    if (!enabled) { setMode("hidden"); return; }
    let end = false; let dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISSED) === "1"; } catch { /* Without storage it can be shown again. */ }
    const update = () => {
      const html = document.documentElement;
      const busy = html.dataset.boot === "pending" || "contactPortal" in html.dataset;
      const past = scrollY > innerHeight * .8;
      setMode(busy || !past ? "hidden" : end && !dismissed ? "nudge" : "bar");
    };
    const footer = new IntersectionObserver(([entry]) => { end = entry.isIntersecting; update(); });
    const target = document.querySelector("footer");
    if (target) footer.observe(target);
    const onDismiss = () => { dismissed = true; update(); };
    addEventListener("scroll", update, { passive: true }); addEventListener("resize", update); addEventListener("cta-nudge-dismiss", onDismiss);
    update();
    return () => { footer.disconnect(); removeEventListener("scroll", update); removeEventListener("resize", update); removeEventListener("cta-nudge-dismiss", onDismiss); };
  }, [enabled]);
  if (!enabled) return null;
  const copy = commercial[lang];
  const dismiss = () => { try { sessionStorage.setItem(DISMISSED, "1"); } catch { /* The bar stays. */ } dispatchEvent(new Event("cta-nudge-dismiss")); };
  return <aside className="sticky-cta" data-mode={mode} aria-label={copy.cta} hidden={mode === "hidden"}>
    {mode === "nudge" && <div className="sticky-cta__nudge"><p className="sticky-cta__title">{copy.nudgeTitle}</p><p>{copy.nudgeBody}</p></div>}
    <div className="sticky-cta__actions">
      <Link className="button primary sticky-cta__link" href={`/${lang}/servicos#contato`} aria-describedby="sticky-cta-note">{copy.cta}</Link>
      <small className="sticky-cta__note" id="sticky-cta-note">{copy.ctaNote}</small>
      {mode === "nudge" && <button type="button" className="sticky-cta__close" onClick={dismiss}>{copy.nudgeClose}</button>}
    </div>
  </aside>;
}
