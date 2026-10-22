import type { SocialNetwork } from "@/data/social";

type BioSegment = string | { text: string; href: string } | { text: string; italic: true };

export type Dictionary = {
  metadata: { title: string; description: string };
  nav: { home: string; about: string; projects: string; content: string; events: string; services: string; language: string };
  accessibility: { skip: string; primaryNav: string; highlights: string };
  motion: { reduce: string; enable: string };
  common: { source: string; stars: string; language: string; all: string; unavailable: string };
  home: { eyebrow: string; heading: string; value: string; primaryCta: string; secondaryCta: string; stats: [string,string,string,string]; servicesEyebrow: string; servicesTitle: string; servicesBody: string; crawlOpening: string; crawlSkip: string; crawlTitle: string; crawl: [string,string,string]; heroImageAlt: string; aboutTitle: string; aboutImageAlt: string };
  about: { bio: BioSegment[][]; primaryCta: string; secondaryCta: string; metadata: { title: string; description: string }; eyebrow: string; title: string; intro: string; mvp: string; timeline: string; heroImageAlt: string };
  projects: { primaryCta: string; secondaryCta: string; metadata: { title: string; description: string }; eyebrow: string; title: string; intro: string; heroImageAlt: string };
  content: { primaryCta: string; secondaryCta: string; metadata: { title: string; description: string }; eyebrow: string; title: string; intro: string; filter: string; heroImageAlt: string };
  events: { primaryCta: string; secondaryCta: string; metadata: { title: string; description: string }; eyebrow: string; title: string; intro: string; labels: [string,string,string]; languageBreakdown: string; typeBreakdown: string; history: string; note: string; audienceNote: string; heroImageAlt: string; types: { palestra: string; workshop: string; organizacao: string } };
  services: { talkMessage: string; metadata: { title: string; description: string }; eyebrow: string; title: string; intro: string; price: string; formTitle: string; name: string; email: string; message: string; send: string; sending: string; success: string; error: string; missing: string; linkedin: string; heroImageAlt: string; speech: string };
  footer: { socialLabels: Record<SocialNetwork, string>; tagline: string; rights: string };
  notFound: { title: string; body: string; back: string; heroImageAlt: string };
  easterEgg: { message: string; close: string };
};

const pt: Dictionary = {
  metadata: { title: "Glaucia Lemos — IA para quem constrói", description: "Engenharia, liderança e adoção responsável de IA no desenvolvimento de software." },
  nav: { home: "Início", about: "Sobre", projects: "Projetos", content: "Conteúdo", events: "Eventos", services: "Serviços", language: "Idioma" },
  accessibility: { skip: "Pular para o conteúdo", primaryNav: "Navegação principal", highlights: "Destaques em números" },
  motion: { reduce: "Reduzir animações", enable: "Ativar animações" }, common: { source: "Fonte", stars: "estrelas", language: "Linguagem", all: "Todos", unavailable: "Não informada" },
  home: { eyebrow: "Engenharia • Liderança • IA", heading: "Glaucia Lemos", value: "Ensino engenheiros e líderes a adotar IA no ciclo de desenvolvimento — com prática, estratégia e responsabilidade.", primaryCta: "Contrate um workshop ou mentoria", secondaryCta: "Veja eventos", stats: ["eventos","países","idiomas","estrelas nos principais projetos"], servicesEyebrow: "Como posso ajudar", servicesTitle: "Da curiosidade à prática com IA", servicesBody: "Workshops para times, mentoria para lideranças e palestras que conectam tecnologia a decisões reais.", crawlOpening: "Há muito tempo, em uma comunidade não tão distante…", crawlSkip: "Pular introdução", crawlTitle: "Uma história em construção", crawl: ["De software developer a educadora global, Glaucia construiu sua trajetória compartilhando conhecimento.","Como Microsoft MVP e ex Cloud Advocate, aproximou comunidades da América Latina de JavaScript, TypeScript, nuvem e IA.","Hoje ajuda pessoas e organizações a transformar a adoção de IA em uma competência de engenharia — não apenas em uma ferramenta."], heroImageAlt: "Mestre Yoda em uma paisagem pantanosa de Dagobah", aboutTitle: "Sobre mim", aboutImageAlt: "Glaucia Lemos representada como Jedi, com túnica marrom e sabre de luz azul" },
  about: {
    bio: [
      [
        "Desenvolvedora, educadora e liderança técnica brasileira, Glaucia trabalha na interseção entre engenharia de software, comunidades e inteligência artificial.",
      ],
      [
        "Hoje é Principal Software Engineer e AI Transformation Lead no Itaú Unibanco, onde ajuda times de engenharia a levar IA generativa de experimentos isolados para entregas seguras, governadas e em escala, com arquitetura agêntica, RAG, context engineering e Spec-Driven Development.",
      ],
      [
        "É ",
        { text: "Microsoft MVP", href: "https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86" },
        ", ",
        { text: "OpenAI Codex Ambassador", href: "https://developers.openai.com/community/codex-ambassadors/directory?site_locale=en&ambassador=glaucia-lemos" },
        " e ",
        { text: "Devin Ambassador", href: "https://devin.ai/community" },
        ". Como ex-Cloud Advocate, passou mais de seis anos na Microsoft tornando JavaScript, TypeScript, nuvem e IA mais acessíveis para comunidades globais. Nesse período, alcançou mais de 100 mil devs com palestras e workshops em português, espanhol e inglês, além de mais de 100 vídeos e 30 artigos técnicos. Criou o Microblog AI, contribuiu com o currículo Generative AI for Beginners e liderou a modernização do Contoso Real Estate.",
      ],
      [
        "É coautora e revisora técnica do livro ",
        { text: "Building Agentic AI Apps with Next.js, TypeScript and MCP", italic: true },
        " (Packt). Fora do código, já mentorou muitas mulheres em tecnologia e segue defendendo uma comunidade tech mais diversa e inclusiva.",
      ],
    ],
    primaryCta: "Conheça minha trajetória", secondaryCta: "LinkedIn", metadata: { title: "Sobre — Glaucia Lemos", description: "Trajetória profissional, comunidade e atuação de Glaucia Lemos." }, eyebrow: "A jornada", title: "Tecnologia ganha sentido quando o conhecimento circula.", intro: "Desenvolvedora, educadora e liderança técnica brasileira, Glaucia trabalha na interseção entre engenharia de software, comunidades e inteligência artificial.", mvp: "Microsoft MVP e ex Cloud Advocate, dedicou anos a tornar JavaScript, TypeScript, nuvem e IA mais acessíveis para comunidades globais.", timeline: "Trajetória profissional", heroImageAlt: "Princesa Leia em uma paisagem gelada de Hoth" },
  projects: { primaryCta: "Ver no GitHub", secondaryCta: "Ver projetos", metadata: { title: "Projetos — Glaucia Lemos", description: "Projetos open source e suas estrelas atuais." }, eyebrow: "Código aberto", title: "Projetos que ensinam construindo", intro: "Repositórios práticos sobre TypeScript, JavaScript, IA e web. As estrelas são atualizadas pelo GitHub quando disponível.", heroImageAlt: "R2-D2 nas dunas claras de Tatooine" },
  content: { primaryCta: "Ler artigos", secondaryCta: "Assistir no YouTube", metadata: { title: "Conteúdo — Glaucia Lemos", description: "Artigos e materiais técnicos de Glaucia Lemos." }, eyebrow: "Biblioteca", title: "Conteúdo para aprender fazendo", intro: "Artigos em português, inglês e espanhol, publicados em diferentes plataformas.", filter: "Filtrar por plataforma", heroImageAlt: "Chewbacca em uma floresta de Kashyyyk" },
  events: { primaryCta: "Convide para palestrar", secondaryCta: "Ver eventos", metadata: { title: "Eventos — Glaucia Lemos", description: "Histórico de palestras, workshops e organização de eventos." }, eyebrow: "Ao redor do mundo", title: "Conhecimento sem fronteiras", intro: "Uma trajetória de encontros com comunidades, presencialmente e online.", labels: ["eventos","países","idiomas"], languageBreakdown: "Por idioma", typeBreakdown: "Por formato", history: "Histórico por ano", note: "Dados de 2017–2023; novos eventos em breve.", audienceNote: "O público não é somado: estimativas podem se sobrepor entre eventos e transmissões.", heroImageAlt: "Grogu em uma paisagem vulcânica de Nevarro", types: { palestra: "Palestras", workshop: "Workshops", organizacao: "Organização" } },
  services: { talkMessage: "Gostaria de convidar você para palestrar.", metadata: { title: "Serviços — Glaucia Lemos", description: "Workshops, mentoria, consultoria e palestras sobre IA e engenharia." }, eyebrow: "Trabalhe comigo", title: "IA aplicada ao trabalho real", intro: "Formatos adaptados ao contexto do seu time, da estratégia à prática.", price: "sob consulta", formTitle: "Conte um pouco sobre o desafio", name: "Nome", email: "Email", message: "Mensagem", send: "Enviar mensagem", sending: "Enviando…", success: "Mensagem enviada. Obrigada!", error: "Não foi possível enviar. Tente novamente.", missing: "O formulário ainda não está configurado. Você pode entrar em contato pelo LinkedIn.", linkedin: "Mandar DM no LinkedIn", heroImageAlt: "Darth Vader diante das nuvens de Bespin", speech: "Junte-se a mim" },
  footer: { socialLabels: { youtube: "YouTube de Glaucia Lemos", x: "X de Glaucia Lemos", linkedin: "LinkedIn de Glaucia Lemos", instagram: "Instagram de Glaucia Lemos" }, tagline: "Construindo pontes entre pessoas, software e IA.", rights: "Todos os direitos reservados." }, notFound: { title: "Esta não é a página que você procura", body: "A rota se perdeu em uma galáxia distante.", back: "Voltar ao início", heroImageAlt: "Stormtrooper em um corredor da Estrela da Morte" }, easterEgg: { message: "Que a Força esteja com você", close: "Fechar" }
};
export default pt;
