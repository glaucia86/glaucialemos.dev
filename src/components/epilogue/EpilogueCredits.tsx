"use client";

import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";
import type { BeyondOrbitCopy } from "@/i18n/beyond-orbit";
import { useDiscoveries } from "@/lib/use-discoveries";
import { EGGS } from "@/lib/egg-catalog";
import { SCENES } from "@/lib/scenes";
import { DESTINATIONS, fill, journey, unchartedWorlds } from "@/lib/journey-constellation";
import { VOYAGE_WORLDS } from "@/lib/voyage";

const NEXT = unchartedWorlds();
const CHARTED = DESTINATIONS.filter((world) => !(NEXT as readonly string[]).includes(world));
const subscribeNothing = () => () => {};
const { actors } = SCENES["beyond-orbit"].assets;
const glaucia = actors.glaucia["float-idle"];
const prince = actors.prince["float-idle"];
// What illustrates each credit, by position in `copy.credits` (the same order in the three languages).
export const CREDIT_ART = ["director", "copilot", "crew", "secrets", "worlds"] as const;

// End credits and the post-credits transmission. Static HTML (server, no JS, reduced motion); with motion the voyage
// rolls the reel through a projector frame, and during the finale the director rolls an aria-hidden copy over the
// scene. The visitor's numbers fill in after hydration. Art uses <img>/attributes only, so the copy keeps it.
export function EpilogueCredits({ copy }: { copy: BeyondOrbitCopy }) {
  const found = useDiscoveries();
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const trip = journey(found);
  const seen = new Set(mounted ? found : []);
  const worlds = mounted ? trip.worlds.map((world) => copy.worlds[world]).join(" · ") || copy.noWorlds : CHARTED.map((world) => copy.worlds[world]).join(" · ");
  const values = { found: mounted ? trip.found : "—", total: trip.total, worlds };
  const art: Record<(typeof CREDIT_ART)[number], ReactNode> = {
    director: <Image className="beyond-orbit__credit-portrait" data-flip="" src={glaucia.src} width={glaucia.px[0]} height={glaucia.px[1]} alt="" unoptimized />,
    copilot: <Image className="beyond-orbit__credit-portrait" src={prince.src} width={prince.px[0]} height={prince.px[1]} alt="" unoptimized />,
    crew: <span className="beyond-orbit__credit-you">✦</span>,
    secrets: <span className="beyond-orbit__secret-strip">{EGGS.map((egg) => <i key={egg.id} data-lit={seen.has(egg.id) || undefined} />)}</span>,
    worlds: <span className="beyond-orbit__world-badges">{VOYAGE_WORLDS.filter((world) => world.plate && (!mounted || trip.worlds.includes(world.page))).map((world) =>
      <Image key={world.page} src={world.plate!} width={64} height={64} alt="" unoptimized />)}</span>,
  };
  return <section className="beyond-orbit__credits" aria-labelledby="epilogue-credits">
    <div className="beyond-orbit__credits-run"><div className="beyond-orbit__credits-stage">
      <span className="beyond-orbit__projector" aria-hidden="true" />
      <span className="beyond-orbit__film" aria-hidden="true"><i /><i /></span>
      <div className="beyond-orbit__credit-reel">
        <p className="beyond-orbit__credits-kicker">{copy.creditsKicker}</p>
        <h2 id="epilogue-credits">{copy.creditsTitle}</h2>
        <p className="beyond-orbit__count">{mounted ? fill(copy.found, values) : fill(copy.mapped, values)}</p>
        <dl className="beyond-orbit__credit-list">
          {copy.credits.map(({ role, name }, index) => {
            const kind = CREDIT_ART[index];
            return <div key={role} data-art={kind}>
              <dt>{role}</dt>
              <dd>{kind && <span className="beyond-orbit__credit-art" aria-hidden="true">{art[kind]}</span>}<span>{fill(name, values)}</span></dd>
            </div>;
          })}
        </dl>
        <p className="beyond-orbit__thanks">{copy.thanks}</p>
      </div>
    </div></div>
    <div className="beyond-orbit__post">
      <p className="beyond-orbit__post-bar" aria-hidden="true"><span>● REC</span><span>CH-08</span></p>
      <h3>{copy.postTitle}</h3>
      <p className="beyond-orbit__post-signal">{copy.postSignal}</p>
      {NEXT.length ? <>
        <p>{copy.postBody}</p>
        <ul>{NEXT.map((world) => <li key={world}>{copy.worlds[world]}</li>)}</ul>
      </> : <p>{copy.postNone}</p>}
      <span className="beyond-orbit__cursor" aria-hidden="true" />
    </div>
  </section>;
}
