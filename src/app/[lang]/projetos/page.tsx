import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProjetosComEstrelas } from "@/lib/github";
type Props = { params: Promise<{ lang: string }> }; export const revalidate = 86400;
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).projects.metadata : {}; }
export default async function Projects({ params }: Props) { const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang); const projects = (await getProjetosComEstrelas()).sort((a,b) => b.estrelas-a.estrelas); return <main id="main" className="inner-page"><PageHero sceneLabels={d.motion} eyebrow={d.projects.eyebrow} title={d.projects.title} subtitle={d.projects.intro} image="/pixel/projetos-r2d2.jpg" imageAlt={d.projects.heroImageAlt} strongOverlay primary={{ href: "https://github.com/glaucia86", label: d.projects.primaryCta }} secondary={{ href: "#projetos", label: d.projects.secondaryCta }} /><section id="projetos" className="card-grid">{projects.map((project) => <article className="project-card" key={project.nome}><div><span className="tag">{project.linguagem ?? d.common.unavailable}</span><strong>★ {project.estrelas.toLocaleString()} {d.common.stars}</strong></div><h2>{project.nome}</h2><p>{project.descricao}</p><a href={project.url}>GitHub ↗</a></article>)}</section></main>; }
