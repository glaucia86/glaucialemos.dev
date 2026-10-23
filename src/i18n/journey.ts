export type JourneyCopy = {
  intro: string;
  milestones: [string, string, string];
  demo: { title: string; note: string; incorrect: string; corrected: string; diagnostic: string; result: string; error: string; coercion: string; success: string; sum: string; explanation: string; course: string };
  projects: [string, string];
  map: { title: string; intro: string; history: string; label: string; countries: string; unlocated: string; all: string; count: string; countryNames: Record<string, string> };
  closing: { title: string; intro: string; actions: [string, string, string] };
};

export const journey: Record<'pt' | 'en' | 'es', JourneyCopy> = {
  pt: {
    intro: 'Comecei como desenvolvedora e levei o que aprendia para as comunidades. Na Microsoft, atuei na América Latina e depois em Cloud Advocacy global, ensinando JavaScript, TypeScript e nuvem. Hoje ajudo engenheiros e líderes a aplicar IA com código, prática e contexto.',
    milestones: ['Primeiros passos no desenvolvimento', 'Conexões pela América Latina', 'Cloud Advocacy global'],
    demo: {
      title: 'Antes da IA, entenda o que o código faz.',
      note: 'Exemplo didático com estados predefinidos. O código não é executado no navegador.',
      incorrect: 'Entrada incorreta', corrected: 'Entrada corrigida', diagnostic: 'O que TypeScript identifica', result: 'O que acontece',
      error: 'TS2345: uma string não pode ser passada para um parâmetro do tipo number.',
      coercion: 'Se ignorarmos o erro de tipo e executarmos o JavaScript equivalente, o operador + concatena: "2" + 3 resulta na string "23".',
      success: 'Os dois argumentos são números. A chamada respeita os tipos da função.',
      sum: '2 + 3 resulta no número 5. Corrigir a entrada muda a operação: agora temos uma soma.',
      explanation: 'Um tipo não converte o dado. Ele ajuda a perceber o erro antes de executar. Esse é o ponto de partida do meu curso TypeScript Zero to Hero: entender, testar e construir.',
      course: 'Comece o curso no GitHub',
    },
    projects: ['Curso gratuito de IA com JavaScript e TypeScript: dos fundamentos às aplicações.', 'Uma CLI com agentes para analisar a saúde de repositórios GitHub.'],
    map: { title: 'Código que virou encontro.', intro: 'De uma dúvida no código a uma conversa com a comunidade. Explore os encontros registrados por país.', history: 'Histórico registrado: 2017–2023', label: 'Mapa esquemático dos locais de eventos', countries: 'Explore por país', unlocated: 'Online / sem localização', all: 'Veja todos os eventos', count: 'eventos neste grupo', countryNames: { Brasil: 'Brasil', Grécia: 'Grécia', México: 'México', França: 'França', 'Estados Unidos': 'Estados Unidos', Canadá: 'Canadá', 'República Dominicana': 'República Dominicana', Argentina: 'Argentina' } },
    closing: { title: 'O próximo encontro pode ser com o seu time.', intro: 'Conte o que seu time precisa aprender ou decidir. Vamos escolher o formato a partir desse desafio.', actions: ['Planeje um workshop', 'Converse sobre mentoria', 'Convide para palestrar'] },
  },
  en: {
    intro: 'I started as a developer and shared what I learned with communities. At Microsoft, I worked across Latin America and then in global Cloud Advocacy, teaching JavaScript, TypeScript and cloud development. Today I help engineers and leaders apply AI through code, practice and context.',
    milestones: ['First steps in software development', 'Connecting Latin America', 'Global Cloud Advocacy'],
    demo: {
      title: 'Before AI, understand what the code does.',
      note: 'Teaching example with predefined states. Code does not run in your browser.',
      incorrect: 'Incorrect input', corrected: 'Corrected input', diagnostic: 'What TypeScript catches', result: 'What happens',
      error: 'TS2345: a string cannot be passed to a parameter of type number.',
      coercion: 'If we ignore the type error and run the equivalent JavaScript, + concatenates: "2" + 3 produces the string "23".',
      success: 'Both arguments are numbers. The call matches the function’s types.',
      sum: '2 + 3 produces the number 5. Correcting the input changes the operation: now it is addition.',
      explanation: 'A type does not convert a value. It helps you spot a mistake before running the code. That is where my TypeScript Zero to Hero course starts: understand, test and build.',
      course: 'Start the course on GitHub',
    },
    projects: ['A free AI course with JavaScript and TypeScript: from fundamentals to applications.', 'An agentic CLI for analyzing the health of GitHub repositories.'],
    map: { title: 'Code that brought us together.', intro: 'From a question about code to a conversation with the community. Explore recorded events by country.', history: 'Recorded history: 2017–2023', label: 'Schematic map of event locations', countries: 'Explore by country', unlocated: 'Online / no location', all: 'View all events', count: 'events in this group', countryNames: { Brasil: 'Brazil', Grécia: 'Greece', México: 'Mexico', França: 'France', 'Estados Unidos': 'United States', Canadá: 'Canada', 'República Dominicana': 'Dominican Republic', Argentina: 'Argentina' } },
    closing: { title: 'Your team could be the next stop.', intro: 'Tell me what your team needs to learn or decide. We will choose a format around that challenge.', actions: ['Plan a workshop', 'Discuss mentoring', 'Invite me to speak'] },
  },
  es: {
    intro: 'Empecé como desarrolladora y compartí lo que aprendía con las comunidades. En Microsoft trabajé en América Latina y después en Cloud Advocacy global, enseñando JavaScript, TypeScript y desarrollo en la nube. Hoy ayudo a profesionales de ingeniería y líderes a aplicar IA con código, práctica y contexto.',
    milestones: ['Primeros pasos en desarrollo', 'Conexiones por América Latina', 'Cloud Advocacy global'],
    demo: {
      title: 'Antes de la IA, entiende qué hace el código.',
      note: 'Ejemplo didáctico con estados predefinidos. El código no se ejecuta en el navegador.',
      incorrect: 'Entrada incorrecta', corrected: 'Entrada corregida', diagnostic: 'Lo que TypeScript detecta', result: 'Lo que ocurre',
      error: 'TS2345: no se puede pasar un string a un parámetro de tipo number.',
      coercion: 'Si ignoramos el error de tipo y ejecutamos el JavaScript equivalente, + concatena: "2" + 3 produce el string "23".',
      success: 'Ambos argumentos son números. La llamada respeta los tipos de la función.',
      sum: '2 + 3 produce el número 5. Corregir la entrada cambia la operación: ahora es una suma.',
      explanation: 'Un tipo no convierte el dato. Te ayuda a detectar el error antes de ejecutar. Ese es el punto de partida de mi curso TypeScript Zero to Hero: entender, probar y construir.',
      course: 'Empieza el curso en GitHub',
    },
    projects: ['Curso gratuito de IA con JavaScript y TypeScript: de los fundamentos a las aplicaciones.', 'Una CLI con agentes para analizar la salud de repositorios GitHub.'],
    map: { title: 'Código que nos reunió.', intro: 'De una duda sobre código a una conversación con la comunidad. Explora los encuentros registrados por país.', history: 'Historial registrado: 2017–2023', label: 'Mapa esquemático de los lugares de eventos', countries: 'Explora por país', unlocated: 'Online / sin ubicación', all: 'Ver todos los eventos', count: 'eventos en este grupo', countryNames: { Brasil: 'Brasil', Grécia: 'Grecia', México: 'México', França: 'Francia', 'Estados Unidos': 'Estados Unidos', Canadá: 'Canadá', 'República Dominicana': 'República Dominicana', Argentina: 'Argentina' } },
    closing: { title: 'El próximo encuentro puede ser con tu equipo.', intro: 'Cuéntame qué necesita aprender o decidir tu equipo. Elegiremos el formato a partir de ese desafío.', actions: ['Planea un taller', 'Conversemos sobre mentoría', 'Invítame a dar una charla'] },
  },
};
