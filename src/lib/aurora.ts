import articles from "@/data/artigos.json";
export { auroraCopy } from "@/i18n/aurora";

// Explicit editorial selection: language tags in the archive are not reliable.
const record = (url: string) => {
  const article = articles.find(item => item.url === url);
  if (!article) throw new Error(`Missing curated aurora article: ${url}`);
  return { titulo: article.titulo, data: article.data, plataforma: article.plataforma, url };
};
export const auroraRecords = {
  pt: record("https://dev.to/glaucia86/github-copilot-sdk-construindo-aplicacoes-agenticas-com-ia-na-pratica-com-repo-doctor-25a6"),
  en: record("https://dev.to/glaucia86/repo-doctor-ai-powered-github-repository-health-analyzer-136n"),
  es: record("https://dev.to/azure/aplicacion-de-referencia-empresarial-en-javascript-contoso-real-estate-63i"),
};
export type AuroraRecords = typeof auroraRecords;
