"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { shouldReduceMotion } from "@/lib/motion";

const storageKey = "intro-dismissed";

export function OpeningCrawl({ copy }: { copy: Dictionary["home"] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dismissed = false;
    let manual = document.documentElement.classList.contains("reduce-motion");
    try {
      dismissed = localStorage.getItem(storageKey) === "true";
      manual ||= localStorage.getItem("reduce-motion") === "true";
    } catch {
      // The intro remains usable when browser storage is unavailable.
    }

    const replay = new URLSearchParams(window.location.search).get("intro") === "1";
    if ((replay || !dismissed) && !shouldReduceMotion(media.matches, manual)) {
      dialog.showModal();
    }

    const syncMotion = () => {
      if (shouldReduceMotion(media.matches, document.documentElement.classList.contains("reduce-motion"))) {
        dialog.close();
      }
    };
    const observer = new MutationObserver(syncMotion);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    media.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  const onClose = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Dismissal must still work without storage.
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return <>
    <section className="crawl-story" aria-labelledby="crawl-story-title">
      <h2 id="crawl-story-title">{copy.crawlTitle}</h2>
      {copy.crawl.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
    <dialog ref={dialogRef} className="opening-crawl" aria-label={copy.crawlTitle} onClose={onClose}>
      <p className="opening-crawl__lead">{copy.crawlOpening}</p>
      <div className="opening-crawl__logo" aria-hidden="true">
        <span>GLAUCIA<br />LEMOS</span>
      </div>
      <div className="opening-crawl__horizon">
        <div className="opening-crawl__plane">
          <div className="opening-crawl__text" onAnimationEnd={(event) => {
            if (event.animationName === "opening-story") dialogRef.current?.close();
          }}>
            <h2>{copy.crawlTitle}</h2>
            {copy.crawl.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </div>
      <button className="opening-crawl__skip" type="button" autoFocus onClick={() => dialogRef.current?.close()}>
        {copy.crawlSkip}<span aria-hidden="true"> ↗</span>
      </button>
    </dialog>
  </>;
}
