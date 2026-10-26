"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import { discover, emitEgg, getFoundSnapshot, onEgg } from "@/lib/eggs";
import { epilogueUnlocked } from "@/lib/epilogue";
import { useDiscoveries } from "@/lib/use-discoveries";

export function EpilogueSignal({ lang, copy }: { lang: Locale; copy: BeyondOrbitCopy }) {
  const router = useRouter();
  const eligible = epilogueUnlocked(useDiscoveries());
  const navigating = useRef(false);

  useEffect(() => {
    if (!eligible) return;
    navigating.current = false;
    return onEgg("epilogue-signal", () => {
      if (navigating.current || !epilogueUnlocked(getFoundSnapshot().split(","))) return;
      navigating.current = true;
      discover("epilogue-signal");
      router.push(`/${lang}/alem-da-ultima-orbita`);
    });
  }, [eligible, lang, router]);

  if (!eligible) return null;
  return <section className="epilogue-signal" aria-labelledby="epilogue-signal-title">
    <h2 id="epilogue-signal-title">{copy.signalTitle}</h2>
    <p>{copy.signalBody}</p>
    <button type="button" onClick={() => emitEgg("epilogue-signal")}><span aria-hidden="true">✦</span> {copy.signalAction}</button>
  </section>;
}
