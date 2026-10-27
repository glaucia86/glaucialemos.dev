"use client";

import { useEffect } from "react";
import { eggsFor, emitEgg, matchTail, normalizePhrase, type EggId } from "@/lib/eggs";

const PAGE_EGGS = eggsFor("services").filter((egg) => egg.page === "services").map((egg) => egg.id) as EggId[];

// Phrases typed straight onto the page play any Aurélia secret; each island that owns the effect listens for its id.
// Typing inside forms or dialogs never triggers anything.
export function AureliaEggs() {
  useEffect(() => {
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing || document.documentElement.dataset.boot === "pending" || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      if ((event.target as Element | null)?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-24);
      const id = matchTail(buffer, PAGE_EGGS);
      if (id) { buffer = ""; emitEgg(id); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return null;
}
