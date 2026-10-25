"use client";
import { EGGS, type EggPage } from "@/lib/eggs";
import { useDiscoveries } from "@/lib/use-discoveries";
export function DiscoveryCount({ label, page = "about", className = "niveora-discoveries" }: { label: string; page?: Exclude<EggPage, "global">; className?: string }) {
  const found = useDiscoveries();
  const eggs = EGGS.filter(egg => egg.page === page);
  const count = eggs.filter(egg => found.includes(egg.id)).length;
  return <p className={className} role="status">{label.replace("{n}", String(count)).replace("{total}", String(eggs.length))}</p>;
}
