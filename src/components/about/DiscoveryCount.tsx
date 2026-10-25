"use client";
import { EGGS } from "@/lib/eggs";
import { useDiscoveries } from "@/lib/use-discoveries";
const about = EGGS.filter(egg => egg.page === "about");
export function DiscoveryCount({ label }: { label: string }) {
  const found = useDiscoveries();
  const count = about.filter(egg => found.includes(egg.id)).length;
  return <p className="niveora-discoveries" role="status">{label.replace("{n}", String(count)).replace("{total}", String(about.length))}</p>;
}
