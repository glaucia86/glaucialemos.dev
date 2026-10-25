"use client";
import { useSyncExternalStore } from "react";
import { getFoundSnapshot, subscribeFound, type EggId } from "./eggs";
const serverSnapshot = () => "";
export function useDiscoveries(): EggId[] {
  const snapshot = useSyncExternalStore(subscribeFound, getFoundSnapshot, serverSnapshot);
  return snapshot ? snapshot.split(",") as EggId[] : [];
}
