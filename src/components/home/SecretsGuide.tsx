"use client";

import { COMLINK_OPEN_EVENT } from "@/components/Comlink";

// Home: say up front that the site hides secrets and that only finding them unlocks the 2 secret pages.
// The button opens the star radio (works with keyboard and touch); without JS the text alone still explains it.
export function SecretsGuide({ text, cta }: { text: string; cta: string }) {
  return <p className="secrets-guide">
    <span className="secrets-guide__star" aria-hidden="true">✦</span>
    <span>{text}</span>
    <button type="button" onClick={() => dispatchEvent(new Event(COMLINK_OPEN_EVENT))}>{cta}</button>
  </p>;
}
