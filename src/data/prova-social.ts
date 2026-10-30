import type { Locale } from '@/i18n/config';

type LocalImage = { src: string; width: number; height: number };
type Localized = Record<Locale, string>;
type Experience = {
  kind: 'employment'; company: string; source: string;
  // Official GitHub organization avatar when it is the real logo; otherwise the name is shown with its initials.
  logo?: LocalImage & { source: string }; context: Localized;
};

// Employment references, never endorsements or a list of paying customers.
// Links and dates checked against experiencia.json on 2026-10-27.
export const experience: readonly Experience[] = [
  { kind: 'employment', company: 'Microsoft',
    source: 'https://www.linkedin.com/posts/glaucialemos_como-muitos-j%C3%A1-sabem-essa-semana-estou-encerrando-activity-7328778074047647744-JMQ7',
    logo: { src: '/prova-social/microsoft.webp', width: 96, height: 96, source: 'https://github.com/microsoft' },
    context: { pt: 'Developer Advocacy · 2019–2025', en: 'Developer Advocacy · 2019–2025', es: 'Developer Advocacy · 2019–2025' },
  },
  { kind: 'employment', company: 'Itaú Unibanco', source: 'https://www.linkedin.com/in/glaucialemos',
    logo: { src: '/prova-social/itau.webp', width: 96, height: 96, source: 'https://github.com/itau' },
    context: { pt: 'Engenharia e IA · desde 2026', en: 'Engineering and AI · since 2026', es: 'Ingeniería e IA · desde 2026' },
  },
  { kind: 'employment', company: 'Zup Innovation', source: 'https://www.linkedin.com/in/glaucialemos',
    logo: { src: '/prova-social/zup.webp', width: 96, height: 96, source: 'https://github.com/ZupIT' },
    context: { pt: 'IA aplicada · 2025–2026', en: 'Applied AI · 2025–2026', es: 'IA aplicada · 2025–2026' },
  },
  { kind: 'employment', company: 'Packt', source: 'https://www.linkedin.com/in/glaucialemos',
    logo: { src: '/prova-social/packt.webp', width: 96, height: 96, source: 'https://github.com/PacktPublishing' },
    context: { pt: 'Coautora e revisora técnica · desde 2025', en: 'Co-author and technical reviewer · since 2025', es: 'Coautora y revisora técnica · desde 2025' },
  },
  { kind: 'employment', company: 'Pagar.me', source: 'https://www.linkedin.com/in/glaucialemos',
    logo: { src: '/prova-social/pagarme.webp', width: 96, height: 96, source: 'https://github.com/pagarme' },
    context: { pt: 'Desenvolvimento de software · 2016', en: 'Software development · 2016', es: 'Desarrollo de software · 2016' },
  },
  // GlobalLogic's GitHub organization has no logo (default avatar), so it is shown by name only.
  { kind: 'employment', company: 'GlobalLogic LATAM', source: 'https://github.com/glaucia86/glaucialemos/blob/752b1694d24b9691de4697fb7f5cb1ba7e578312/src/content/resume/index.md',
    context: { pt: 'Desenvolvimento de software · 2015', en: 'Software development · 2015', es: 'Desarrollo de software · 2015' },
  },
];

export type Photograph = {
  id: string; kind: 'portrait' | 'activity'; status: 'pending' | 'approved';
  source: string; original: string; image: LocalImage;
  context: 'portrait' | 'talk' | 'volunteering' | 'recording' | 'announcement';
  alt: Localized; caption: Localized;
};

// Selection belongs to Glaucia. Candidates are invisible until explicitly approved.
// Approved by Glaucia on 2026-10-28: portrait-sdd and talk-archive.
// Local public assets are only produced for the chosen photographs.
export const photographs: readonly Photograph[] = [
  { id: 'portrait-sdd', kind: 'portrait', status: 'approved', context: 'portrait',
    source: 'https://github.com/glaucia86/palestra-sdd/blob/main/resources/images/foto_perfil.png',
    original: 'https://raw.githubusercontent.com/glaucia86/palestra-sdd/main/resources/images/foto_perfil.png',
    image: { src: '/prova-social/glaucia-sdd.webp', width: 631, height: 649 },
    alt: { pt: 'Retrato de Glaucia Lemos diante de uma estante de livros.', en: 'Portrait of Glaucia Lemos in front of a bookshelf.', es: 'Retrato de Glaucia Lemos frente a una estantería de libros.' },
    caption: { pt: 'Glaucia Lemos · retrato publicado nos materiais de Spec-Driven Development.', en: 'Glaucia Lemos · portrait published in her Spec-Driven Development materials.', es: 'Glaucia Lemos · retrato publicado en sus materiales de Spec-Driven Development.' },
  },
  { id: 'portrait-2019', kind: 'portrait', status: 'pending', context: 'portrait',
    source: 'https://github.com/glaucia86/glaucialemos/blob/master/src/assets/images/perfil-glaucia-2019.png',
    original: 'https://raw.githubusercontent.com/glaucia86/glaucialemos/master/src/assets/images/perfil-glaucia-2019.png',
    image: { src: '/prova-social/glaucia-2019.webp', width: 250, height: 252 },
    alt: { pt: 'Glaucia Lemos sorrindo, com óculos e gorro colorido.', en: 'Glaucia Lemos smiling, wearing glasses and a colorful hat.', es: 'Glaucia Lemos sonriendo, con gafas y un gorro de colores.' },
    caption: { pt: 'Glaucia Lemos · retrato do site anterior, arquivo de 2019.', en: 'Glaucia Lemos · portrait from her previous website, 2019 file.', es: 'Glaucia Lemos · retrato de su sitio anterior, archivo de 2019.' },
  },
  { id: 'talk-archive', kind: 'activity', status: 'approved', context: 'talk',
    source: 'https://github.com/glaucia86/glaucialemos/blob/master/src/assets/images/palestra.jpg',
    original: 'https://raw.githubusercontent.com/glaucia86/glaucialemos/master/src/assets/images/palestra.jpg',
    image: { src: '/prova-social/glaucia-palestra.webp', width: 900, height: 600 },
    alt: { pt: 'Glaucia Lemos falando ao microfone diante de uma projeção e do público.', en: 'Glaucia Lemos speaking into a microphone in front of a projected slide and an audience.', es: 'Glaucia Lemos hablando al micrófono frente a una proyección y al público.' },
    caption: { pt: 'Glaucia Lemos em uma palestra presencial. Registro publicado no seu site anterior.', en: 'Glaucia Lemos giving an in-person talk. Photo published on her previous website.', es: 'Glaucia Lemos en una charla presencial. Foto publicada en su sitio anterior.' },
  },
];

export const publishedPhotos = (photos: readonly Photograph[] = photographs) => photos.filter(photo => photo.status === 'approved');

// "Onde já palestrei": names only (no third-party logos), each linked to the most recent documented event in
// eventos.json whose name starts with `match`. A venue that disappears from the data breaks the tests, never the page.
export const speakingVenues = [
  { name: 'AgentCon', match: 'AgentCon' },
  { name: 'BrazilJS Conf', match: 'BrazilJS' },
  { name: 'CityJS Brazil', match: 'CityJs' },
  { name: 'IEEE CS80 Rio', match: 'IEEE CS80' },
  { name: 'VS Code Live', match: 'VS Code Live' },
  { name: 'Microsoft Reactor', match: 'Microsoft Reactor' },
  { name: 'Global AI Bootcamp', match: 'Global AI Bootcamp' },
  { name: 'WoMakersCode', match: 'WoMakersCode' },
] as const;

export function venueSources(events: readonly { nome: string; ano: number; fonte: string; tipo: string }[]) {
  return speakingVenues.flatMap(venue => {
    const event = events.filter(item => item.nome.startsWith(venue.match) && item.tipo !== 'organizacao').sort((a, b) => b.ano - a.ano)[0];
    return event ? [{ name: venue.name, source: event.fonte, year: event.ano }] : [];
  });
}

// Testimonials arrive by e-mail through the site's own form (Resend) with explicit permission to publish; Glaucia
// approves each one and only then adds it here. The section stays hidden while this list is empty.
export type Testimonial = { name: string; role: string; quote: string; lang: Locale; context: 'talk' | 'workshop' | 'mentoring'; link?: string; received: string };
export const testimonials: readonly Testimonial[] = [];

// Recorded talks shown in the gallery. The poster is a local copy of the video's own YouTube thumbnail; the player
// (youtube-nocookie) only loads after a click, and without JS the card is a plain link to YouTube.
export type TalkVideo = { id: string; event: string; year: number; title: string; channel: string; poster: LocalImage; url: string };
export const talkVideos: readonly TalkVideo[] = [
  { id: 'E8fKJ1LE40E', event: 'BrazilJS Conf', year: 2024, channel: 'BrazilJS',
    title: 'Crie aplicações inteligentes com JS: integrando RAG, Azure OpenAI e Langchain.js',
    poster: { src: '/prova-social/braziljs-2024-rag.webp', width: 960, height: 540 },
    url: 'https://www.youtube.com/watch?v=E8fKJ1LE40E' },
];
