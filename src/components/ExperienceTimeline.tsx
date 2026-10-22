"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { shouldReduceMotion } from "@/lib/motion";
import type { Cargo } from "@/lib/types";

type Props = {
  entries: Cargo[];
  lang: Locale;
  labels: Dictionary["about"]["timelineLabels"];
  sourceLabel: string;
};

export function ExperienceTimeline({ entries, lang, labels, sourceLabel }: Props) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let reduced = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const { top, height } = timeline.getBoundingClientRect();
      // The blade follows a reading point three quarters down the viewport.
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.75 - top - 48) / Math.max(1, height - 48)));
      timeline.style.setProperty("--saber-progress", String(progress));
    };
    const schedule = () => {
      if (visible && !reduced && !frame) frame = requestAnimationFrame(update);
    };
    const syncMotion = () => {
      reduced = shouldReduceMotion(media.matches, document.documentElement.classList.contains("reduce-motion"));
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced) timeline.style.setProperty("--saber-progress", "1");
      else schedule();
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const motionObserver = new MutationObserver(syncMotion);
    // Opening a panel changes the length of the blade, even without scrolling.
    const resize = new ResizeObserver(schedule);
    intersection.observe(timeline);
    resize.observe(timeline);
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    media.addEventListener("change", syncMotion);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    syncMotion();

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      motionObserver.disconnect();
      media.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div className="experience-timeline" ref={timelineRef}>
    <div className="timeline-saber" aria-hidden="true">
      <span className="timeline-saber__hilt" />
      <span className="timeline-saber__blade" />
    </div>
    <ol className="timeline">
      {entries.map((entry) => {
        const open = expanded.includes(entry.id);
        const triggerId = `experience-${entry.id}`;
        const panelId = `${triggerId}-panel`;
        return <li key={entry.id}>
          <h3 className="timeline__heading">
            <button
              id={triggerId}
              className="timeline__trigger"
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setExpanded((current) => open ? current.filter((id) => id !== entry.id) : [...current, entry.id])}
            >
              <span className="timeline__period">{entry.periodo[lang]}</span>
              <span className="timeline__summary"><span className="timeline__company">{entry.empresa}</span><span>{entry.cargo[lang]}</span></span>
              <span className="timeline__indicator" aria-hidden="true">{open ? "−" : "+"}</span>
            </button>
          </h3>
          <div id={panelId} className="timeline__panel" role="region" aria-labelledby={triggerId} hidden={!open}>
            <dl className="timeline__details">
              <div><dt>{labels.role}</dt><dd>{entry.cargo[lang]}</dd></div>
              <div><dt>{labels.period}</dt><dd>{entry.periodo[lang]}</dd></div>
            </dl>
            {entry.descricao && <p>{entry.descricao[lang]}</p>}
            {entry.conquistas[lang].length > 0 && <>
              <h4>{labels.achievements}</h4>
              <ul className="timeline__achievements">{entry.conquistas[lang].map((item) => <li key={item}>{item}</li>)}</ul>
            </>}
            {entry.tecnologias.length > 0 && <>
              <h4>{labels.tech}</h4>
              <ul className="timeline__chips">{entry.tecnologias.map((tech) => <li key={tech}>{tech}</li>)}</ul>
            </>}
            <a href={entry.fonte} target="_blank" rel="noopener noreferrer">{sourceLabel} <span aria-hidden="true">↗</span></a>
          </div>
        </li>;
      })}
    </ol>
  </div>;
}
