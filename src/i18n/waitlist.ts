import type { Locale } from './config';

type WaitlistCopy = {
  title: string; intro: string; details: string; name: string; email: string; interest: string; website: string;
  offerings: { 'workshop-corporativo': string; 'mentoria-grupo-noite': string; 'curso-gravado': string };
  purpose: string; consent: string; submit: string; sending: string; rateLimited: string; success: string; error: string; unavailable: string;
  errors: { name: string; email: string; interest: string; consent: string };
};
export const waitlistCopy = {
  pt: {
    rateLimited: 'Recebemos muitas tentativas de envio. Por favor, aguarde um pouco antes de tentar novamente.',
    title: 'Lista de espera', intro: 'Receba uma notificação quando a modalidade escolhida estiver disponível.',
    details: 'Seus dados', name: 'Nome', email: 'E-mail', interest: 'Tenho interesse em', website: 'Site',
    offerings: { 'workshop-corporativo': 'Workshop corporativo', 'mentoria-grupo-noite': 'Mentoria em grupo à noite', 'curso-gravado': 'Curso gravado' },
    purpose: 'Seus dados serão usados apenas para avisar sobre a modalidade escolhida, conforme a LGPD. Sem spam ou inscrição em outras listas.',
    consent: 'Concordo com o uso dos meus dados exclusivamente para receber esse aviso (LGPD).',
    submit: 'Entrar na lista de espera', sending: 'Enviando…',
    success: 'Inscrição recebida. Obrigada pelo interesse! Você receberá um aviso quando a modalidade escolhida estiver disponível.',
    error: 'Não foi possível registrar sua inscrição. Tente novamente.',
    unavailable: 'A lista de espera está indisponível no momento. Você pode falar comigo pelo LinkedIn.',
    errors: { name: 'Informe seu nome (até 120 caracteres).', email: 'Informe um e-mail válido (até 254 caracteres).', interest: 'Selecione uma das três modalidades.', consent: 'É necessário consentir com o uso dos dados para receber o aviso.' },
  },
  en: {
    rateLimited: 'We have received too many submission attempts. Please wait a while before trying again.',
    title: 'Waitlist', intro: 'Get notified when your chosen offering becomes available.',
    details: 'Your details', name: 'Name', email: 'Email', interest: 'I am interested in', website: 'Website',
    offerings: { 'workshop-corporativo': 'Corporate workshop', 'mentoria-grupo-noite': 'Evening group mentoring', 'curso-gravado': 'Recorded course' },
    purpose: 'Your data will only be used to notify you about your chosen offering, in accordance with the LGPD. No spam or subscriptions to other lists.',
    consent: 'I consent to the use of my data exclusively to receive this notification (LGPD).',
    submit: 'Join the waitlist', sending: 'Sending…',
    success: 'Registration received. Thank you for your interest! You will be notified when your chosen offering becomes available.',
    error: 'Your registration could not be submitted. Please try again.',
    unavailable: 'The waitlist is currently unavailable. You can contact me on LinkedIn.',
    errors: { name: 'Enter your name (up to 120 characters).', email: 'Enter a valid email (up to 254 characters).', interest: 'Select one of the three offerings.', consent: 'Consent is required to use your data to send the notification.' },
  },
  es: {
    rateLimited: 'Hemos recibido demasiados intentos de envío. Espera un poco antes de intentarlo de nuevo.',
    title: 'Lista de espera', intro: 'Recibe un aviso cuando la modalidad elegida esté disponible.',
    details: 'Tus datos', name: 'Nombre', email: 'Correo electrónico', interest: 'Me interesa', website: 'Sitio web',
    offerings: { 'workshop-corporativo': 'Taller corporativo', 'mentoria-grupo-noite': 'Mentoría en grupo por la noche', 'curso-gravado': 'Curso grabado' },
    purpose: 'Tus datos se usarán únicamente para avisarte sobre la modalidad elegida, conforme a la LGPD. Sin spam ni suscripciones a otras listas.',
    consent: 'Acepto el uso de mis datos exclusivamente para recibir este aviso (LGPD).',
    submit: 'Unirme a la lista de espera', sending: 'Enviando…',
    success: 'Inscripción recibida. ¡Gracias por tu interés! Recibirás un aviso cuando la modalidad elegida esté disponible.',
    error: 'No fue posible registrar tu inscripción. Inténtalo de nuevo.',
    unavailable: 'La lista de espera no está disponible en este momento. Puedes contactarme por LinkedIn.',
    errors: { name: 'Indica tu nombre (hasta 120 caracteres).', email: 'Indica un correo electrónico válido (hasta 254 caracteres).', interest: 'Selecciona una de las tres modalidades.', consent: 'Debes aceptar el uso de tus datos para recibir el aviso.' },
  },
} satisfies Record<Locale, WaitlistCopy>;
