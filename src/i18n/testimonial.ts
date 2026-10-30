import type { Locale } from './config';

export type TestimonialCopy = {
  title: string; intro: string; name: string; role: string; linkedin: string; context: string;
  contexts: { talk: string; workshop: string; mentoring: string };
  quote: string; consent: string; purpose: string; send: string; sending: string;
  rateLimited: string; success: string; error: string; invalid: string; captcha: string; unavailable: string; empty: string;
  errors: { name: string; role: string; linkedin: string; context: string; quote: string; consent: string };
};

export const testimonialCopy: Record<Locale, TestimonialCopy> = {
  pt: {
    rateLimited: 'Recebemos muitas tentativas de envio. Por favor, aguarde um pouco antes de tentar novamente.',
    title: 'Deixe um depoimento', intro: 'Participou de uma palestra, workshop ou mentoria? Conte como foi. Eu leio cada depoimento e só publico com a sua autorização.',
    name: 'Nome', role: 'Cargo e empresa', linkedin: 'Perfil no LinkedIn (opcional)', context: 'Onde nos conhecemos',
    contexts: { talk: 'Palestra', workshop: 'Workshop', mentoring: 'Mentoria' },
    quote: 'Seu depoimento', consent: 'Autorizo publicar este depoimento no site com meu nome e cargo.',
    purpose: 'Usamos estes dados só para avaliar e publicar o depoimento. Você pode pedir a remoção a qualquer momento.',
    send: 'Enviar depoimento', sending: 'Enviando…', success: 'Obrigada! Recebi o seu depoimento e vou revisá-lo antes de publicar.',
    error: 'Não foi possível enviar agora. Tente de novo em instantes.', invalid: 'Revise os campos destacados.',
    captcha: 'Confirme a verificação de segurança para enviar.', unavailable: 'O envio de depoimentos está temporariamente indisponível.',
    empty: 'Os primeiros depoimentos aprovados aparecem aqui.',
    errors: { name: 'Informe seu nome.', role: 'Informe seu cargo e empresa.', linkedin: 'Use um perfil do LinkedIn (linkedin.com/in/...) ou deixe em branco.', context: 'Escolha onde nos conhecemos.', quote: 'Escreva entre 20 e 600 caracteres.', consent: 'Autorize a publicação para enviar.' },
  },
  en: {
    rateLimited: 'We have received too many submission attempts. Please wait a while before trying again.',
    title: 'Leave a testimonial', intro: 'Attended a talk, workshop or mentoring session? Tell me how it went. I read every testimonial and only publish it with your permission.',
    name: 'Name', role: 'Role and company', linkedin: 'LinkedIn profile (optional)', context: 'Where we met',
    contexts: { talk: 'Talk', workshop: 'Workshop', mentoring: 'Mentoring' },
    quote: 'Your testimonial', consent: 'I allow this testimonial to be published on the site with my name and role.',
    purpose: 'This data is only used to review and publish the testimonial. You can ask for its removal at any time.',
    send: 'Send testimonial', sending: 'Sending…', success: 'Thank you! I received your testimonial and will review it before publishing.',
    error: 'It could not be sent right now. Please try again shortly.', invalid: 'Please review the highlighted fields.',
    captcha: 'Complete the security check to send.', unavailable: 'Testimonials are temporarily unavailable.',
    empty: 'The first approved testimonials will appear here.',
    errors: { name: 'Enter your name.', role: 'Enter your role and company.', linkedin: 'Use a LinkedIn profile (linkedin.com/in/...) or leave it blank.', context: 'Choose where we met.', quote: 'Write between 20 and 600 characters.', consent: 'Allow publication to send it.' },
  },
  es: {
    rateLimited: 'Hemos recibido demasiados intentos de envío. Espera un poco antes de intentarlo de nuevo.',
    title: 'Deja un testimonio', intro: '¿Participaste en una charla, taller o mentoría? Cuéntame cómo fue. Leo cada testimonio y solo lo publico con tu autorización.',
    name: 'Nombre', role: 'Cargo y empresa', linkedin: 'Perfil de LinkedIn (opcional)', context: 'Dónde nos conocimos',
    contexts: { talk: 'Charla', workshop: 'Taller', mentoring: 'Mentoría' },
    quote: 'Tu testimonio', consent: 'Autorizo publicar este testimonio en el sitio con mi nombre y cargo.',
    purpose: 'Usamos estos datos solo para revisar y publicar el testimonio. Puedes pedir que se elimine en cualquier momento.',
    send: 'Enviar testimonio', sending: 'Enviando…', success: '¡Gracias! Recibí tu testimonio y lo revisaré antes de publicarlo.',
    error: 'No se pudo enviar ahora. Inténtalo de nuevo en unos momentos.', invalid: 'Revisa los campos destacados.',
    captcha: 'Completa la verificación de seguridad para enviar.', unavailable: 'El envío de testimonios no está disponible temporalmente.',
    empty: 'Los primeros testimonios aprobados aparecerán aquí.',
    errors: { name: 'Escribe tu nombre.', role: 'Escribe tu cargo y empresa.', linkedin: 'Usa un perfil de LinkedIn (linkedin.com/in/...) o déjalo en blanco.', context: 'Elige dónde nos conocimos.', quote: 'Escribe entre 20 y 600 caracteres.', consent: 'Autoriza la publicación para enviarlo.' },
  },
};
