import "./globals.css";
import { PageHero } from "@/components/PageHero";
export default function RootNotFound() { return <html lang="pt-BR" className="not-found-document"><body><main id="main" className="not-found"><PageHero eyebrow="404" title="Esta não é a página que você procura" subtitle="A rota se perdeu em uma galáxia distante." image="/pixel/404-stormtrooper.jpg" imageAlt="Stormtrooper em um corredor da Estrela da Morte" primary={{ href: "/pt", label: "Voltar ao início" }} /></main></body></html>; }
