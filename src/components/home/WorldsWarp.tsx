import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { SCENES } from "@/lib/scenes";
import { WorldsWarpMotion } from "./WorldsWarpMotion";

// "Salto pelos 7 mundos": just before the final invitation, the scroll becomes a hyperspace trip through the real plate
// of every world, ending on the proposal button. Static HTML is a row of the 7 worlds (no JS, reduced motion, phones).
const COPY = {
  pt: { kicker: "A viagem até aqui", title: "Sete mundos. Uma tripulação.", intro: "Tudo o que você viu nesta galáxia cabe num salto.", next: "Seu time é a próxima parada.", secret: "Uma estrela fora do mapa", names: ["Observatório", "Nivéora", "Marte", "Atlas", "Aurélia", "Lúmina", "???"] },
  en: { kicker: "The journey so far", title: "Seven worlds. One crew.", intro: "Everything you saw in this galaxy fits in one jump.", next: "Your team is the next stop.", secret: "A star off the map", names: ["Observatory", "Nivéora", "Mars", "Atlas", "Aurélia", "Lúmina", "???"] },
  es: { kicker: "El viaje hasta aquí", title: "Siete mundos. Una tripulación.", intro: "Todo lo que viste en esta galaxia cabe en un salto.", next: "Tu equipo es la próxima parada.", secret: "Una estrella fuera del mapa", names: ["Observatorio", "Nivéora", "Marte", "Atlas", "Aurélia", "Lúmina", "???"] },
} as const;
export const WARP_WORLDS = [
  { scene: "earth-observatory", path: "" },
  { scene: "niveora", path: "/sobre" },
  { scene: "mars-lab", path: "/projetos" },
  { scene: "earth-orbit", path: "/eventos" },
  { scene: "aurelia", path: "/servicos" },
  { scene: "lumina", path: "/conteudo" },
  { scene: "beyond-orbit", path: null },
] as const;

export function WorldsWarp({ lang }: { lang: Locale }) {
  const copy = COPY[lang];
  return <section className="worlds-warp" aria-labelledby="worlds-warp-title">
    <div className="worlds-warp__stage">
      <canvas className="worlds-warp__sky" aria-hidden="true" />
      <header className="worlds-warp__heading">
        <p className="worlds-warp__kicker">{copy.kicker}</p>
        <h2 id="worlds-warp-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </header>
      <ol className="worlds-warp__worlds">{WARP_WORLDS.map((world, index) => {
        const plate = SCENES[world.scene].assets.background;
        const label = <><span className="worlds-warp__number">{String(index + 1).padStart(2, "0")}</span><span className="worlds-warp__name">{world.path === null ? copy.secret : copy.names[index]}</span></>;
        return <li key={world.scene} className="worlds-warp__world" data-secret={world.path === null || undefined} style={{ ["--i" as string]: index }}>
          <span className="worlds-warp__portal" aria-hidden="true"><Image src={plate.src} alt="" width={480} height={270} sizes="(max-width: 700px) 45vw, 480px" loading="lazy" /></span>
          {world.path === null ? <span className="worlds-warp__label">{label}</span> : <a className="worlds-warp__label" href={`/${lang}${world.path}`}>{label}</a>}
        </li>;
      })}</ol>
      <p className="worlds-warp__next" aria-hidden="true">{copy.next}</p>
      <i className="worlds-warp__flash" aria-hidden="true" />
    </div>
    <WorldsWarpMotion />
  </section>;
}
