export const niveoraStories = {
  pt: {
    between: "Há uma história entre essas linhas", title: "Engenharia, ensino e comunidade.",
    intro: "Alguns caminhos correm juntos. Estes registros conectam o trabalho com código ao compartilhamento de conhecimento.",
    records: [
      { title: "Ensinar também faz parte do caminho", text: "A atuação como instrutora técnica na Udemy aparece na trajetória desde novembro de 2017." },
      { title: "Código que atravessa idiomas", text: "Em dezembro de 2018, a trajetória registra a participação no grupo de internacionalização da Node.js Foundation." },
      { title: "Construir e tornar acessível", text: "No Generative AI for Beginners, as contribuições incluem exemplos em TypeScript e tradução para português." },
    ],
    source: "Consultar o registro", close: "Fechar anotação", footprint: "O Prince encontrou uma estrela. Seguir a pegada", hint: "Uma estrela emprestada espera perto do convite final.",
    star: "Abrir a estrela emprestada", noteTitle: "Inspeção do copiloto",
    note: "Inspeção concluída. Esta estrela estava precisando de companhia.", signature: "— Prince, copiloto da expedição", returnStar: "Guardar o bilhete",
    letterFallback: "Carta aos curiosos",
  },
  en: {
    between: "There is a story between these lines", title: "Engineering, teaching and community.",
    intro: "Some paths run alongside each other. These records connect working with code and sharing knowledge.",
    records: [
      { title: "Teaching is part of the journey", text: "The career record includes work as a technical instructor on Udemy from November 2017." },
      { title: "Code across languages", text: "In December 2018, the career record includes participation in the Node.js Foundation Internationalization Working Group." },
      { title: "Building and making accessible", text: "Contributions to Generative AI for Beginners include TypeScript examples and Portuguese translation." },
    ],
    source: "View the record", close: "Close the note", footprint: "Prince found a star. Follow the paw print", hint: "A borrowed star awaits near the final invitation.",
    star: "Open the borrowed star", noteTitle: "The copilot's inspection",
    note: "Inspection complete. This star could use some company.", signature: "— Prince, expedition copilot", returnStar: "Keep the note",
    letterFallback: "Letter to the curious",
  },
  es: {
    between: "Hay una historia entre estas líneas", title: "Ingeniería, enseñanza y comunidad.",
    intro: "Algunos caminos avanzan juntos. Estos registros conectan el trabajo con código y el intercambio de conocimiento.",
    records: [
      { title: "Enseñar también es parte del camino", text: "La trayectoria incluye el trabajo como instructora técnica en Udemy desde noviembre de 2017." },
      { title: "Código que cruza idiomas", text: "En diciembre de 2018, la trayectoria registra la participación en el grupo de internacionalización de Node.js Foundation." },
      { title: "Construir y hacer accesible", text: "Las contribuciones a Generative AI for Beginners incluyen ejemplos en TypeScript y traducción al portugués." },
    ],
    source: "Consultar el registro", close: "Cerrar la nota", footprint: "Prince encontró una estrella. Seguir la huella", hint: "Una estrella prestada espera cerca de la invitación final.",
    star: "Abrir la estrella prestada", noteTitle: "Inspección del copiloto",
    note: "Inspección terminada. A esta estrella le hacía falta compañía.", signature: "— Prince, copiloto de la expedición", returnStar: "Guardar la nota",
    letterFallback: "Carta para los curiosos",
  },
};
export type NiveoraStoriesCopy = typeof niveoraStories.pt;

export const curiousLetter = {
  pt: { title: "Carta aos curiosos", open: "Você encontrou uma carta. Abrir", locked: "Faltam {n} descobertas diferentes para abrir a carta.", close: "Guardar a carta", body: "Obrigada por explorar com calma. Entre código, comunidades e novas ideias, este espaço reúne caminhos que continuo construindo. Espero que você tenha encontrado algo para levar consigo — uma pergunta, uma referência ou vontade de experimentar. Até a próxima descoberta.", signature: "— Glaucia e Prince" },
  en: { title: "Letter to the curious", open: "You found a letter. Open it", locked: "Discover {n} more different secrets to open the letter.", close: "Keep the letter", body: "Thank you for taking the time to explore. Between code, communities and new ideas, this space brings together paths I am still building. I hope you found something to take with you — a question, a reference or the desire to experiment. Until the next discovery.", signature: "— Glaucia and Prince" },
  es: { title: "Carta para los curiosos", open: "Encontraste una carta. Abrir", locked: "Faltan {n} descubrimientos diferentes para abrir la carta.", close: "Guardar la carta", body: "Gracias por explorar con calma. Entre código, comunidades y nuevas ideas, este espacio reúne caminos que sigo construyendo. Espero que hayas encontrado algo para llevar contigo — una pregunta, una referencia o ganas de experimentar. Hasta el próximo descubrimiento.", signature: "— Glaucia y Prince" },
};
