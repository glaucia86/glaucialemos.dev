"use client";

import { useMemo } from "react";
import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import { useDiscoveries } from "@/lib/use-discoveries";
import { REGIONS, constellation, journey, pathData, unchartedWorlds } from "@/lib/journey-constellation";
import type { EggPage } from "@/lib/egg-catalog";

const STARS = constellation();
const UNCHARTED = new Set<EggPage>(unchartedWorlds());

// One pixel star per secret in the calm sky left of the Veil. Discoveries glow and join in the order they were made;
// worlds without secrets yet wait as faint, uncharted patches. Decorative: the count is read in the credits.
export function JourneyConstellation({ copy }: { copy: BeyondOrbitCopy }) {
  const found = useDiscoveries();
  const { path } = useMemo(() => journey(found, STARS), [found]);
  const lit = useMemo(() => new Set(path.map((star) => star.id)), [path]);
  return <svg className="beyond-orbit__constellation" viewBox="0 0 1600 900" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    {(Object.keys(REGIONS) as EggPage[]).map((world) => {
      const region = REGIONS[world];
      const empty = UNCHARTED.has(world);
      return <g key={world} className="beyond-orbit__world" data-uncharted={empty || undefined}>
        {empty && <rect className="beyond-orbit__uncharted" x={region.x} y={region.y} width={region.w} height={region.h} />}
        <text x={region.x} y={region.y - 12}>{empty ? "???" : copy.worlds[world]}</text>
      </g>;
    })}
    <path className="beyond-orbit__journey" d={pathData(path)} />
    {STARS.map((star) => <rect key={star.id} className="beyond-orbit__node" data-node={star.id} data-lit={lit.has(star.id) || undefined}
      x={star.x - 3} y={star.y - 3} width={6} height={6} />)}
  </svg>;
}
