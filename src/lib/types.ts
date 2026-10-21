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
  preco: z.literal("sob consulta"),
});

export type Evento = z.infer<typeof eventoSchema>;
export type Cargo = z.infer<typeof cargoSchema>;
export type Projeto = z.infer<typeof projetoSchema>;
export type Artigo = z.infer<typeof artigoSchema>;
export type Servico = z.infer<typeof servicoSchema>;
