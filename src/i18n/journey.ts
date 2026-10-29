export type JourneyCopy = {
  intro: string;
  milestones: [string, string, string, string];
  demo: {
    title: string; note: string; grounded: string; ungrounded: string; diagnostic: string; result: string;
    groundedDiagnostic: string; ungroundedDiagnostic: string; groundedResult: string; ungroundedResult: string;
    explanation: string; cta: string; context: string;
  };
  projects: Record<string, string>;
  map: { title: string; intro: string; history: string; label: string; countries: string; unlocated: string; all: string; count: string; countryNames: Record<string, string> };
  closing: { title: string; intro: string; actions: [string, string, string] };
};

export const journey: Record<'pt' | 'en' | 'es', JourneyCopy> = {
  pt: {
    intro: 'Comecei como desenvolvedora e levei o que aprendia para as comunidades. Na Microsoft, foram mais de seis anos em Developer Advocacy, levando JavaScript, TypeScript e IA a devs do mundo todo. Hoje, como AI Transformation Lead no Itaú, lidero a adoção de IA generativa e agêntica em squads de engenharia, com código, prática e contexto.',
    milestones: ['Primeiros passos no desenvolvimento', 'Conexões pela América Latina', 'Developer Advocacy global com IA', 'Transformação com IA no Itaú'],
    demo: {
      title: 'IA com contexto, não com achismo.',
      note: 'Exemplo didático com estados predefinidos. Trecho real de packages/api/src/functions/chats-post.ts, do projeto oficial da Microsoft em que sou coautora. O código não roda no navegador.',
      grounded: 'Pergunta com fonte', ungrounded: 'Pergunta sem fonte', diagnostic: 'O que o pipeline faz', result: 'O que a pessoa recebe',
      groundedDiagnostic: 'O retriever busca 3 trechos no vector store (Cosmos DB) e a chain injeta esses trechos como SOURCES no prompt do Azure OpenAI.',
      ungroundedDiagnostic: 'O retriever ainda devolve 3 trechos, mas nenhum fala sobre a França. O system prompt proíbe responder sem fonte.',
      groundedResult: 'Uma resposta curta que cita o arquivo de origem no formato [arquivo] e sugere 3 perguntas de follow-up, em streaming.',
      ungroundedResult: 'O modelo diz que não sabe, em vez de inventar. Sem fonte, não há resposta.',
      explanation: 'RAG não é mágica: o modelo só responde bem com as fontes certas e regras claras. Ajudei a construir este chat serverless oficial da Microsoft, do upload de documentos ao streaming da resposta.',
      cta: 'Veja o projeto no GitHub',
      context: 'Um exemplo real do meu trabalho na Microsoft: a mesma pergunta respondida pela IA sem fonte e com fonte. Clique em “Pergunta com fonte” e veja a resposta mudar. É o que ensino nos workshops: IA que responde com base nos documentos da empresa, sem inventar.',
    },
    projects: {
      'curso-typescript-zero-to-hero': 'Curso de TypeScript do zero ao avançado: a base para construir com IA.',
      'ai-js-course': 'Curso de IA com JavaScript e TypeScript: dos fundamentos às aplicações.',
      repocheckai: 'Uma CLI com agentes para analisar a saúde de repositórios GitHub.',
      'js-101-beginners-ms': 'Todos os códigos da série da Microsoft de JavaScript para iniciantes.',
      'frontend-bootcamp-online': 'Bootcamp online de Front-End: HTML, CSS e JavaScript na prática.',
      glaucia_lemos86: 'Meu cartão pessoal no terminal, via npx.',
      'workshop-mean-serverless': 'Workshop de MEAN Stack com Serverless e Azure Functions.',
      'microblog-ai-nextjs': 'App com Next.js e IA para criar e gerar conteúdo inteligente.',
      'weather-mcp-server': 'Um servidor MCP de clima robusto em TypeScript.',
      'jwt-node-vue': 'Autenticação com JWT em Node.js e Vue, da série Coding Stuff.',
    },
    map: { title: 'Código que virou encontro.', intro: 'De uma dúvida no código a uma conversa com a comunidade. Explore os encontros registrados por país.', history: 'Histórico registrado: 2017–2026', label: 'Mapa esquemático dos locais de eventos', countries: 'Explore por país', unlocated: 'Online / sem localização', all: 'Veja todos os eventos', count: 'eventos neste grupo', countryNames: { Brasil: 'Brasil', Grécia: 'Grécia', México: 'México', França: 'França', 'Estados Unidos': 'Estados Unidos', Canadá: 'Canadá', 'República Dominicana': 'República Dominicana', Argentina: 'Argentina', 'África do Sul': 'África do Sul' } },
    closing: { title: 'O próximo encontro pode ser com o seu time.', intro: 'Conte o que seu time precisa aprender ou decidir. Vamos escolher o formato a partir desse desafio.', actions: ['Planeje um workshop', 'Converse sobre mentoria', 'Convide para palestrar'] },
  },
  en: {
    intro: 'I started as a developer and shared what I learned with communities. At Microsoft, I spent more than six years in Developer Advocacy, bringing JavaScript, TypeScript and AI to developers worldwide. Today, as AI Transformation Lead at Itaú, I lead the adoption of generative and agentic AI across engineering squads through code, practice and context.',
    milestones: ['First steps in software development', 'Connecting Latin America', 'Global Developer Advocacy with AI', 'Leading AI transformation at Itaú'],
    demo: {
      title: 'AI grounded in context, not guesswork.',
      note: 'Teaching example with predefined states. Real excerpt from packages/api/src/functions/chats-post.ts, part of the official Microsoft project I co-authored. Code does not run in your browser.',
      grounded: 'Question with sources', ungrounded: 'Question without sources', diagnostic: 'What the pipeline does', result: 'What the user gets',
      groundedDiagnostic: 'The retriever fetches 3 chunks from the vector store (Cosmos DB) and the chain injects them as SOURCES into the Azure OpenAI prompt.',
      ungroundedDiagnostic: 'The retriever still returns 3 chunks, but none of them mention France. The system prompt forbids answering without a source.',
      groundedResult: 'A short streamed answer that cites the source file as [filename] and suggests 3 follow-up questions.',
      ungroundedResult: 'The model says it does not know instead of making something up. No source, no answer.',
      explanation: 'RAG is not magic: a model only answers well with the right sources and clear rules. I helped build this official Microsoft serverless chat, from document upload to streamed answers.',
      cta: 'See the project on GitHub',
      context: 'A real example from my work at Microsoft: the same question answered by AI without a source and with one. Click “Question with sources” and watch the answer change. This is what I teach in workshops: AI that answers from the company’s own documents instead of making things up.',
    },
    projects: {
      'curso-typescript-zero-to-hero': 'A TypeScript course from zero to advanced: the foundation for building with AI.',
      'ai-js-course': 'An AI course with JavaScript and TypeScript: from fundamentals to applications.',
      repocheckai: 'An agentic CLI for analyzing the health of GitHub repositories.',
      'js-101-beginners-ms': 'All the code from Microsoft’s JavaScript for Beginners series.',
      'frontend-bootcamp-online': 'An online Front-End bootcamp: hands-on HTML, CSS and JavaScript.',
      glaucia_lemos86: 'My personal business card in the terminal, via npx.',
      'workshop-mean-serverless': 'A MEAN Stack workshop with Serverless and Azure Functions.',
      'microblog-ai-nextjs': 'A Next.js and AI app to create and generate smart content.',
      'weather-mcp-server': 'A robust weather MCP server in TypeScript.',
      'jwt-node-vue': 'JWT authentication with Node.js and Vue, from the Coding Stuff series.',
    },
    map: { title: 'Code that brought us together.', intro: 'From a question about code to a conversation with the community. Explore recorded events by country.', history: 'Recorded history: 2017–2026', label: 'Schematic map of event locations', countries: 'Explore by country', unlocated: 'Online / no location', all: 'View all events', count: 'events in this group', countryNames: { Brasil: 'Brazil', Grécia: 'Greece', México: 'Mexico', França: 'France', 'Estados Unidos': 'United States', Canadá: 'Canada', 'República Dominicana': 'Dominican Republic', Argentina: 'Argentina', 'África do Sul': 'South Africa' } },
    closing: { title: 'Your team could be the next stop.', intro: 'Tell me what your team needs to learn or decide. We will choose a format around that challenge.', actions: ['Plan a workshop', 'Discuss mentoring', 'Invite me to speak'] },
  },
  es: {
    intro: 'Empecé como desarrolladora y compartí lo que aprendía con las comunidades. En Microsoft pasé más de seis años en Developer Advocacy, llevando JavaScript, TypeScript e IA a desarrolladores de todo el mundo. Hoy, como AI Transformation Lead en Itaú, lidero la adopción de IA generativa y agéntica en squads de ingeniería, con código, práctica y contexto.',
    milestones: ['Primeros pasos en desarrollo', 'Conexiones por América Latina', 'Developer Advocacy global con IA', 'Transformación con IA en Itaú'],
    demo: {
      title: 'IA con contexto, no con suposiciones.',
      note: 'Ejemplo didáctico con estados predefinidos. Fragmento real de packages/api/src/functions/chats-post.ts, del proyecto oficial de Microsoft del que soy coautora. El código no se ejecuta en el navegador.',
      grounded: 'Pregunta con fuentes', ungrounded: 'Pregunta sin fuentes', diagnostic: 'Lo que hace el pipeline', result: 'Lo que recibe la persona',
      groundedDiagnostic: 'El retriever busca 3 fragmentos en el vector store (Cosmos DB) y la chain los inyecta como SOURCES en el prompt de Azure OpenAI.',
      ungroundedDiagnostic: 'El retriever aún devuelve 3 fragmentos, pero ninguno habla de Francia. El system prompt prohíbe responder sin fuente.',
      groundedResult: 'Una respuesta breve, en streaming, que cita el archivo de origen como [archivo] y sugiere 3 preguntas de seguimiento.',
      ungroundedResult: 'El modelo dice que no lo sabe en lugar de inventar. Sin fuente, no hay respuesta.',
      explanation: 'RAG no es magia: el modelo solo responde bien con las fuentes correctas y reglas claras. Ayudé a construir este chat serverless oficial de Microsoft, desde la carga de documentos hasta la respuesta en streaming.',
      cta: 'Mira el proyecto en GitHub',
      context: 'Un ejemplo real de mi trabajo en Microsoft: la misma pregunta respondida por la IA sin fuente y con fuente. Haz clic en “Pregunta con fuentes” y mira cómo cambia la respuesta. Es lo que enseño en los talleres: IA que responde a partir de los documentos de la empresa, sin inventar.',
    },
    projects: {
      'curso-typescript-zero-to-hero': 'Curso de TypeScript desde cero hasta avanzado: la base para construir con IA.',
      'ai-js-course': 'Curso de IA con JavaScript y TypeScript: de los fundamentos a las aplicaciones.',
      repocheckai: 'Una CLI con agentes para analizar la salud de repositorios GitHub.',
      'js-101-beginners-ms': 'Todo el código de la serie de Microsoft de JavaScript para principiantes.',
      'frontend-bootcamp-online': 'Bootcamp online de Front-End: HTML, CSS y JavaScript en la práctica.',
      glaucia_lemos86: 'Mi tarjeta personal en la terminal, vía npx.',
      'workshop-mean-serverless': 'Taller de MEAN Stack con Serverless y Azure Functions.',
      'microblog-ai-nextjs': 'App con Next.js e IA para crear y generar contenido inteligente.',
      'weather-mcp-server': 'Un servidor MCP de clima robusto en TypeScript.',
      'jwt-node-vue': 'Autenticación con JWT en Node.js y Vue, de la serie Coding Stuff.',
    },
    map: { title: 'Código que nos reunió.', intro: 'De una duda sobre código a una conversación con la comunidad. Explora los encuentros registrados por país.', history: 'Historial registrado: 2017–2026', label: 'Mapa esquemático de los lugares de eventos', countries: 'Explora por país', unlocated: 'Online / sin ubicación', all: 'Ver todos los eventos', count: 'eventos en este grupo', countryNames: { Brasil: 'Brasil', Grécia: 'Grecia', México: 'México', França: 'Francia', 'Estados Unidos': 'Estados Unidos', Canadá: 'Canadá', 'República Dominicana': 'República Dominicana', Argentina: 'Argentina', 'África do Sul': 'Sudáfrica' } },
    closing: { title: 'El próximo encuentro puede ser con tu equipo.', intro: 'Cuéntame qué necesita aprender o decidir tu equipo. Elegiremos el formato a partir de ese desafío.', actions: ['Planea un taller', 'Conversemos sobre mentoría', 'Invítame a dar una charla'] },
  },
};
