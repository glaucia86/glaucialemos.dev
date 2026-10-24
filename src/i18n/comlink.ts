import type { EggId } from "@/lib/eggs";

type Entry = { name: string; hint: string };
export type ComlinkCopy = {
  open: string; title: string; channel: string; counter: string; master: string; placeholder: string; send: string;
  sent: string; unknown: string; elsewhere: string; play: string; close: string; hidden: string; fresh: string;
  reset: string; resetConfirm: string; resetDone: string;
  pages: { home: string; about: string };
  eggs: Record<EggId, Entry>;
};

export const comlink: Record<"pt" | "en" | "es", ComlinkCopy> = {
  pt: {
    open: "Abrir o canal secreto", title: "Canal secreto", channel: "COMLINK // ALIANÇA", counter: "Segredos descobertos", master: "Mestre dos Segredos",
    placeholder: "digite uma transmissão…", send: "Transmitir", sent: "Sinal enviado.", unknown: "Transmissão desconhecida. Tente uma das dicas abaixo.",
    elsewhere: "Sinal fora de alcance. Tente na página {page}.", play: "Reproduzir", close: "Fechar canal", hidden: "Sinal criptografado", fresh: "Novo segredo descoberto!",
    reset: "Apagar memória", resetConfirm: "Confirmar: apagar {n} segredos?", resetDone: "Memória apagada, como a do C-3PO no fim do Episódio III. A caçada recomeça.",
    pages: { home: "Início", about: "Sobre" },
    eggs: {
      konami: { name: "Código Konami", hint: "Um código antigo: cima, cima, baixo, baixo… No celular, deslize o dedo e toque duas vezes." },
      "force-push": { name: "Empurrão da Força", hint: "No pântano da página inicial, um toque rápido basta." },
      "force-hold": { name: "X-wing do pântano", hint: "Na página inicial, segure a cena e não solte." },
      deflect: { name: "Rebater disparos", hint: "Um card de Jedi sabe se defender." },
      ion: { name: "Canhão de íons", hint: "O domo da Base Eco não está ali de enfeite." },
      holo: { name: "Holomensagem", hint: "Uma princesa precisa de ajuda. Peça por ela… ou segure a Leia." },
      iknow: { name: "“Eu sei.”", hint: "Declare seu amor e o Han responde. Ou toque duas vezes no título do dossiê." },
      blizzard: { name: "Nevasca", hint: "Diga o nome do planeta, ou toque três vezes no termômetro." },
      ice: { name: "Degelo total", hint: "Depois da nevasca, liberte tudo o que congelou." },
      probe: { name: "Sonda imperial", hint: "Alguma coisa vigia a base lá do céu." },
      tauntaun: { name: "Tauntaun", hint: "A neve esconde um amigo de duas patas." },
      "threepio-arm": { name: "Braço do C-3PO", hint: "Insista um pouco com o droide de protocolo." },
      settle: { name: "Neve acumulada", hint: "Fique paradinha e deixe Hoth trabalhar." },
    },
  },
  en: {
    open: "Open the secret channel", title: "Secret channel", channel: "COMLINK // ALLIANCE", counter: "Secrets discovered", master: "Master of Secrets",
    placeholder: "type a transmission…", send: "Transmit", sent: "Signal sent.", unknown: "Unknown transmission. Try one of the hints below.",
    elsewhere: "Signal out of range. Try it on the {page} page.", play: "Replay", close: "Close channel", hidden: "Encrypted signal", fresh: "New secret discovered!",
    reset: "Wipe memory", resetConfirm: "Confirm: wipe {n} secrets?", resetDone: "Memory wiped, just like C-3PO's at the end of Episode III. The hunt starts over.",
    pages: { home: "Home", about: "About" },
    eggs: {
      konami: { name: "Konami Code", hint: "An ancient code: up, up, down, down… On a phone, swipe and then tap twice." },
      "force-push": { name: "Force push", hint: "In the swamp on the home page, a quick tap is enough." },
      "force-hold": { name: "Swamp X-wing", hint: "On the home page, hold the scene and don't let go." },
      deflect: { name: "Deflect the bolts", hint: "A Jedi card knows how to defend itself." },
      ion: { name: "Ion cannon", hint: "Echo Base's dome isn't just decoration." },
      holo: { name: "Holomessage", hint: "A princess needs help. Ask for it… or hold Leia." },
      iknow: { name: "“I know.”", hint: "Declare your love and Han will answer. Or double-tap the dossier title." },
      blizzard: { name: "Blizzard", hint: "Say the planet's name, or tap the thermometer three times." },
      ice: { name: "Total thaw", hint: "After the blizzard, free everything that froze." },
      probe: { name: "Imperial probe", hint: "Something is watching the base from the sky." },
      tauntaun: { name: "Tauntaun", hint: "The snow hides a two-legged friend." },
      "threepio-arm": { name: "C-3PO's arm", hint: "Keep bothering the protocol droid." },
      settle: { name: "Settling snow", hint: "Stay still and let Hoth do its thing." },
    },
  },
  es: {
    open: "Abrir el canal secreto", title: "Canal secreto", channel: "COMLINK // ALIANZA", counter: "Secretos descubiertos", master: "Maestra de los Secretos",
    placeholder: "escribe una transmisión…", send: "Transmitir", sent: "Señal enviada.", unknown: "Transmisión desconocida. Prueba una de las pistas.",
    elsewhere: "Señal fuera de alcance. Prueba en la página {page}.", play: "Reproducir", close: "Cerrar canal", hidden: "Señal cifrada", fresh: "¡Nuevo secreto descubierto!",
    reset: "Borrar memoria", resetConfirm: "¿Confirmas? Borrar {n} secretos", resetDone: "Memoria borrada, como la de C-3PO al final del Episodio III. La búsqueda vuelve a empezar.",
    pages: { home: "Inicio", about: "Sobre mí" },
    eggs: {
      konami: { name: "Código Konami", hint: "Un código antiguo: arriba, arriba, abajo, abajo… En el móvil, desliza y toca dos veces." },
      "force-push": { name: "Empujón de la Fuerza", hint: "En el pantano de la página de inicio basta un toque rápido." },
      "force-hold": { name: "X-wing del pantano", hint: "En la página de inicio, mantén pulsada la escena." },
      deflect: { name: "Desviar disparos", hint: "Una tarjeta Jedi sabe defenderse." },
      ion: { name: "Cañón de iones", hint: "La cúpula de la Base Eco no está de adorno." },
      holo: { name: "Holomensaje", hint: "Una princesa necesita ayuda. Pídela… o mantén pulsada a Leia." },
      iknow: { name: "“Lo sé.”", hint: "Declara tu amor y Han responde. O toca dos veces el título del expediente." },
      blizzard: { name: "Ventisca", hint: "Di el nombre del planeta, o toca tres veces el termómetro." },
      ice: { name: "Deshielo total", hint: "Después de la ventisca, libera todo lo que se congeló." },
      probe: { name: "Sonda imperial", hint: "Algo vigila la base desde el cielo." },
      tauntaun: { name: "Tauntaun", hint: "La nieve esconde un amigo de dos patas." },
      "threepio-arm": { name: "Brazo de C-3PO", hint: "Insiste un poco con el droide de protocolo." },
      settle: { name: "Nieve acumulada", hint: "Quédate quieta y deja que Hoth haga lo suyo." },
    },
  },
};
