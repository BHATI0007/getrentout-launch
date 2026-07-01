const SHARE_TEXT: Record<string, string> = {
  en: "Just got early access to RentOut — something big is coming. Get yours:",
  es: "Acabo de conseguir acceso anticipado a RentOut — algo grande está por llegar. Consigue el tuyo:",
  pt: "Acabei de conseguir acesso antecipado ao RentOut — algo grande está chegando. Garanta o seu:",
  fr: "Je viens d'obtenir un accès anticipé à RentOut — quelque chose de grand arrive. Obtenez le vôtre :",
  hi: "मुझे RentOut का early access मिल गया — कुछ बड़ा आने वाला है। अपना भी लो:",
  id: "Aku baru dapat akses awal ke RentOut — sesuatu yang besar akan datang. Ambil punyamu:",
  tl: "Nakakuha na ako ng early access sa RentOut — may malaki paparating. Kunin mo rin:",
  ar: "حصلت للتو على وصول مبكر إلى RentOut — هناك شيء كبير قادم. احصل على نصيبك:",
};

export function getShareText(): string {
  if (typeof navigator === "undefined") return SHARE_TEXT.en;
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return SHARE_TEXT[lang] || SHARE_TEXT.en;
}
