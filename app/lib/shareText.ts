const SHARE_TEXT: Record<string, string> = {
  en: "I joined the RentOut early access list — a marketplace where people book your skills by the hour. Free to join:",
  es: "Me uní a la lista de acceso anticipado de RentOut: un marketplace donde la gente reserva tus habilidades por hora. Unirse es gratis:",
  pt: "Entrei na lista de acesso antecipado do RentOut: um marketplace onde as pessoas reservam suas habilidades por hora. É grátis:",
  fr: "J'ai rejoint la liste d'accès anticipé de RentOut : une marketplace où l'on réserve vos compétences à l'heure. Inscription gratuite :",
  hi: "मैंने RentOut की early access list join की — एक marketplace जहाँ लोग आपकी skills को घंटे के हिसाब से book करते हैं। Join करना free है:",
  id: "Aku baru gabung daftar akses awal RentOut — marketplace tempat orang memesan keahlianmu per jam. Gratis untuk bergabung:",
  tl: "Sumali ako sa early access list ng RentOut — isang marketplace kung saan bino-book ng mga tao ang skills mo per hour. Libre sumali:",
  ar: "انضممت إلى قائمة الوصول المبكر في RentOut — سوق يحجز فيه الناس مهاراتك بالساعة. الانضمام مجاني:",
};

export function getShareText(): string {
  if (typeof navigator === "undefined") return SHARE_TEXT.en;
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return SHARE_TEXT[lang] || SHARE_TEXT.en;
}
