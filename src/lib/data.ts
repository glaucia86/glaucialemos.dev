import artigosJson from "@/data/artigos.json";
import eventosJson from "@/data/eventos.json";
import cargosJson from "@/data/experiencia.json";
import contribuicoesJson from "@/data/contribuicoes.json";
import projetosJson from "@/data/projetos.json";
import servicosJson from "@/data/servicos.json";
import {
  artigoSchema,
  cargoSchema,
  contribuicaoSchema,
  eventoSchema,
  projetoSchema,
  servicoSchema,
} from "./types";
import { z } from "zod";

const eventos = z.array(eventoSchema).parse(eventosJson);
const cargos = z.array(cargoSchema).parse(cargosJson);
const projetos = z.array(projetoSchema).parse(projetosJson);
const artigos = z.array(artigoSchema).parse(artigosJson);
const servicos = z.array(servicoSchema).parse(servicosJson);
const contribuicoes = z.array(contribuicaoSchema).parse(contribuicoesJson);

export const getEventos = () => eventos;
export const getCargos = () => cargos;
export const getProjetos = () => projetos;
export const getArtigos = () => artigos;
export const getServicos = () => servicos;
export const getContribuicoes = () => contribuicoes;

export function getEventCountries() {
  return [...new Set(
    eventos
      .map((evento) => evento.pais)
      .filter((pais): pais is string => pais !== null && pais !== "Global"),
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getEventStats() {

  return {
    eventos: eventos.length,
    paises: getEventCountries().length,
    idiomas: {
      "pt-BR": eventos.filter((evento) => evento.idioma === "pt-BR").length,
      en: eventos.filter((evento) => evento.idioma === "en").length,
      es: eventos.filter((evento) => evento.idioma === "es").length,
    },
  };
}
