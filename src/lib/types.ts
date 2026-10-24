import { z } from "zod";

export const eventoSchema = z.object({
  nome: z.string(),
  ano: z.number().int(),
  cidade: z.string(),
  pais: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  idioma: z.enum(["pt-BR", "en", "es"]),
  tipo: z.enum(["palestra", "workshop", "organizacao"]),
  publico: z.string(),
  fonte: z.url(),
});

export const cargoSchema = z.object({
  empresa: z.string(),
  cargo: z.string(),
  periodo: z.string(),
  fonte: z.url(),
});

export const projetoSchema = z.object({
  nome: z.string(),
  url: z.url(),
  estrelas: z.number().int().nonnegative(),
  linguagem: z.string().nullable(),
  descricao: z.string(),
  forks: z.number().int().nonnegative().default(0),
  topicos: z.array(z.string()).default([]),
  criado: z.string().default(""),
  atualizado: z.string().default(""),
});

const countSchema = z.object({ name: z.string(), count: z.number().int().nonnegative() });

// Fallback for the Projects telemetry when the GitHub API is unavailable.
export const githubStatsSchema = z.object({
  followers: z.number().int().nonnegative(),
  gists: z.number().int().nonnegative(),
  publicRepos: z.number().int().nonnegative(),
  since: z.number().int(),
  originals: z.number().int().nonnegative(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  languages: z.array(countSchema),
  years: z.array(z.object({ year: z.number().int(), count: z.number().int().nonnegative() })),
  mergedPrs: z.number().int().nonnegative(),
  prsByRepo: z.record(z.string(), z.number().int().nonnegative()),
});

export const artigoSchema = z.object({
  titulo: z.string(),
  url: z.url(),
  plataforma: z.string(),
  data: z.iso.date(),
  idioma: z.enum(["pt-BR", "en", "es"]),
});

const textoLocalizadoSchema = z.object({
  pt: z.string(),
  en: z.string(),
  es: z.string(),
});

export const servicoSchema = z.object({
  id: z.string(),
  titulo: textoLocalizadoSchema,
  descricao: textoLocalizadoSchema,
  preco: z.enum(["sob consulta", "gratuito"]),
});

export const contribuicaoSchema = z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  url: z.url(),
  estrelas: z.number().int().nonnegative(),
  linguagem: z.string(),
  papel: textoLocalizadoSchema,
  descricao: textoLocalizadoSchema,
  prs: z.url(),
});

export type Evento = z.infer<typeof eventoSchema>;
export type Contribuicao = z.infer<typeof contribuicaoSchema>;
export type Cargo = z.infer<typeof cargoSchema>;
export type Projeto = z.infer<typeof projetoSchema>;
export type GithubStats = z.infer<typeof githubStatsSchema>;
export type Artigo = z.infer<typeof artigoSchema>;
export type Servico = z.infer<typeof servicoSchema>;
