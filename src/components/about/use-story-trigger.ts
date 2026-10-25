"use client";
import { useEffect, useRef } from "react";
import { matchTail, normalizePhrase, onEgg, type EggId } from "@/lib/eggs";

// Visible controls, radio and typed phrases all enter the same action.
export function useStoryTrigger(id: EggId, run: () => void) {
  const action = useRef(run);
  useEffect(() => { action.current = run; }, [run]);
  useEffect(() => {
    const stop = onEgg(id, () => action.current());
    let buffer = "";
    const typed = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || (event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      buffer = (buffer + normalizePhrase(event.key)).slice(-32);
      if (matchTail(buffer, [id])) { buffer = ""; action.current(); }
    };
    addEventListener("keydown", typed);
    return () => { stop(); removeEventListener("keydown", typed); };
  }, [id]);
}
