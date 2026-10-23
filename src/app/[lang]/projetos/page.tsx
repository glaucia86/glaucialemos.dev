import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContribuicoesComEstrelas, getTopRepos } from "@/lib/github";
import { PROJECTS_PAGE_SIZE } from "@/lib/home-curation";
type Props = { params: Promise<{ lang: string }> }; export const revalidate = 2592000;
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).projects.metadata : {}; }
export default async function Projects({ params }: Props) {
  const { lang } = await params; if (!isLocale(lang)) notFound(); const d = getDictionary(lang);
  const [projects, contributions] = await Promise.all([getTopRepos(PROJECTS_PAGE_SIZE), getContribuicoesComEstrelas()]);
  const format = new Intl.NumberFormat(lang);
  return <main id="main" className="inner-page"><PageHero eyebrow={d.projects.eyebrow} title={d.projects.title} subtitle={d.projects.intro} image="/pixel/projetos-r2d2.jpg" imageAlt={d.projects.heroImageAlt} strongOverlay primary={{ href: "https://github.com/glaucia86", label: d.projects.primaryCta }} secondary={{ href: "#projetos", label: d.projects.secondaryCta }} />
    <section id="projetos" className="card-grid">{projects.map((project) => <article className="project-card" key={project.nome}><div><span className="tag">{project.linguagem ?? d.common.unavailable}</span><strong>★ {format.format(project.estrelas)} {d.common.stars}</strong></div><h2>{project.nome}</h2><p>{d.journey.projects[project.nome] ?? project.descricao}</p><a href={project.url}>GitHub ↗</a></article>)}</section>
    <section id="open-source" className="section-heading" aria-labelledby="open-source-title"><h2 id="open-source-title">{d.projects.ossTitle}</h2><p>{d.projects.ossIntro}</p>
      <div className="card-grid">{contributions.map((contribution) => <article className="project-card contribution-card" key={contribution.repo}><div><span className="tag">{contribution.papel[lang]}</span><strong>★ {format.format(contribution.estrelas)} {d.common.stars}</strong></div><h3>{contribution.repo}</h3><p>{contribution.descricao[lang]}</p><p className="contribution-card__links"><a href={contribution.url}>GitHub ↗</a> <a href={contribution.prs}>{d.projects.ossPrs} ↗</a></p></article>)}</div>
    </section></main>;
}
