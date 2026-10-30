"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "es" | "en";

const es = {
  langLabel: "Idioma",
  hero: {
    marry: "Nos casamos",
    weekday: "Sábado",
    date: "31 de julio de 2027",
    city: "Toledo",
    thanks1: "Gracias por estar aquí.",
    thanks2: "Será un día muy especial y no sería lo mismo sin vosotros.",
    toledoAlt: "Dibujo de Toledo con el Alcázar, la catedral y el puente de Alcántara",
  },
  countdown: {
    title: "Falta muy poco",
    cta: "Descubre nuestro gran día",
    aria: "Cuenta atrás hasta la boda",
    days: "días",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    today: "¡Hoy es el gran día! Nos vemos en Toledo.",
  },
  event: {
    title: "El gran día",
    locations: "Ubicaciones",
    ceremony: "Ceremonia · 18:30 h",
    celebration: "Celebración",
    ceremonyName: "Parroquia Santiago el Mayor de Toledo",
    mapPrefix: "Mapa",
    openMaps: "Abrir en Google Maps",
  },
  footer: {
    reopen: "Volver a abrir el sobre",
    coupleAlt: "Diego + Elena, 31.07.2027",
  },
  envelope: {
    openAria: "Abrir la invitación de boda de Diego y Elena",
    hint: "Pulsa para abrir nuestra invitación",
    marry: "Nos casamos",
  },
  party: { cheer: "¡Vivan los novios!" },
  rsvp: {
    title: "Confirma tu asistencia",
    intro: "Una sola persona por grupo rellena el formulario por su pareja o familia. Podrás añadir a quienes vengan contigo.",
    deadline: "Cuéntanos si vienes, qué menú prefieres y si hay alergias o intolerancias.",
    yourName: "Tu nombre y apellidos",
    phone: "Teléfono de contacto",
    attending: "¿Vienes a la boda?",
    yes: "¡Sí, allí estaré!",
    no: "No podré ir",
    group: "¿Quién viene?",
    groupHelp: "Tú y todas las personas que vienen contigo (pareja, familia, niños…).",
    you: "Tú",
    guestName: "Nombre y apellidos",
    adult: "Adulto",
    child: "Niño",
    addAdult: "+ Añadir adulto",
    addChild: "+ Añadir niño",
    remove: "Quitar",
    age: "Edad",
    menu: "Menú",
    menus: { normal: "Normal", vegetariano: "Vegetariano", vegano: "Vegano", infantil: "Infantil" },
    allergens: "Alergias e intolerancias",
    allergensNone: "Ninguna",
    otherAllergies: "Otras alergias o comentarios",
    summary: (a: number, c: number, k: number) =>
      `${a} ${a === 1 ? "adulto" : "adultos"} · ${c} ${c === 1 ? "niño" : "niños"} · ${k} ${k === 1 ? "menú infantil" : "menús infantiles"}`,
    white: "¿Vienes vestido/a de blanco?",
    whiteYes: "Sí",
    whiteNo: "No, claro que no",
    whiteJoke: "¡Pues quedas desinvitado/a de la boda! Solo una persona puede ir de blanco… (es broma. Más o menos).",
    song: "Una canción que no puede faltar",
    songHelp: "Enlace de Spotify o YouTube, o el título.",
    songPlaceholder: "https://open.spotify.com/… o «Título – Artista»",
    songInvalid: "Si es un enlace, que sea de Spotify o YouTube.",
    message: "¿Algo más que quieras contarnos?",
    consent: "Acepto que se guarden estos datos solo para organizar la boda. Se borrarán después del evento.",
    send: "Enviar confirmación",
    sending: "Enviando…",
    required: "Revisa los campos obligatorios.",
    consentRequired: "Necesitamos tu consentimiento para guardar los datos.",
    error: "No hemos podido enviar tu respuesta. Inténtalo de nuevo en un rato o escríbenos.",
    notConfigured: "El formulario aún no está activo.",
    okYesTitle: "¡Gracias! Os esperamos en Toledo",
    okYes: "Hemos recibido tu confirmación. ¡Qué ganas!",
    okNoTitle: "Gracias por avisarnos",
    okNo: "Sentimos que no puedas venir. Te echaremos de menos.",
    again: "Enviar otra respuesta",
  },
  allergens: {
    gluten: "Gluten",
    crustaceos: "Crustáceos",
    huevo: "Huevo",
    pescado: "Pescado",
    cacahuete: "Cacahuete",
    soja: "Soja",
    lactosa: "Lácteos / lactosa",
    frutos_secos: "Frutos secos",
    apio: "Apio",
    mostaza: "Mostaza",
    sesamo: "Sésamo",
    sulfitos: "Sulfitos",
    altramuces: "Altramuces",
    moluscos: "Moluscos",
  },
};

type Dict = typeof es;

const en: Dict = {
  langLabel: "Language",
  hero: {
    marry: "We're getting married",
    weekday: "Saturday",
    date: "July 31, 2027",
    city: "Toledo",
    thanks1: "Thank you for being here.",
    thanks2: "It will be a very special day and it wouldn't be the same without you.",
    toledoAlt: "Drawing of Toledo with the Alcázar, the cathedral and the Alcántara bridge",
  },
  countdown: {
    title: "Not long now",
    cta: "Discover our big day",
    aria: "Countdown to the wedding",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    today: "Today is the big day! See you in Toledo.",
  },
  event: {
    title: "The big day",
    locations: "Locations",
    ceremony: "Ceremony · 6:30 pm",
    celebration: "Celebration",
    ceremonyName: "Santiago el Mayor Parish, Toledo",
    mapPrefix: "Map",
    openMaps: "Open in Google Maps",
  },
  footer: {
    reopen: "Open the envelope again",
    coupleAlt: "Diego + Elena, 31.07.2027",
  },
  envelope: {
    openAria: "Open Diego and Elena's wedding invitation",
    hint: "Tap to open our invitation",
    marry: "We're getting married",
  },
  party: { cheer: "Long live the happy couple!" },
  rsvp: {
    title: "RSVP",
    intro: "One person per group fills in the form for their partner or family. You'll be able to add everyone coming with you.",
    deadline: "Let us know if you're coming, which menu you prefer and any allergies or intolerances.",
    yourName: "Your full name",
    phone: "Contact phone",
    attending: "Will you join us?",
    yes: "Yes, I'll be there!",
    no: "I can't make it",
    group: "Who's coming?",
    groupHelp: "You and everyone coming with you (partner, family, kids…).",
    you: "You",
    guestName: "Full name",
    adult: "Adult",
    child: "Child",
    addAdult: "+ Add adult",
    addChild: "+ Add child",
    remove: "Remove",
    age: "Age",
    menu: "Menu",
    menus: { normal: "Regular", vegetariano: "Vegetarian", vegano: "Vegan", infantil: "Kids" },
    allergens: "Allergies and intolerances",
    allergensNone: "None",
    otherAllergies: "Other allergies or comments",
    summary: (a: number, c: number, k: number) =>
      `${a} ${a === 1 ? "adult" : "adults"} · ${c} ${c === 1 ? "child" : "children"} · ${k} kids ${k === 1 ? "menu" : "menus"}`,
    white: "Are you wearing white?",
    whiteYes: "Yes",
    whiteNo: "No, of course not",
    whiteJoke: "Then you're officially uninvited from the wedding! Only one person gets to wear white… (just kidding. Sort of).",
    song: "A song that can't be missed",
    songHelp: "A Spotify or YouTube link, or just the title.",
    songPlaceholder: "https://open.spotify.com/… or “Title – Artist”",
    songInvalid: "If it's a link, it must be from Spotify or YouTube.",
    message: "Anything else you'd like to tell us?",
    consent: "I agree to this data being stored only to organize the wedding. It will be deleted after the event.",
    send: "Send RSVP",
    sending: "Sending…",
    required: "Please check the required fields.",
    consentRequired: "We need your consent to store the data.",
    error: "We couldn't send your response. Please try again in a while or contact us.",
    notConfigured: "The form isn't active yet.",
    okYesTitle: "Thank you! See you in Toledo",
    okYes: "We've received your RSVP. We can't wait!",
    okNoTitle: "Thanks for letting us know",
    okNo: "We're sorry you can't make it. We'll miss you.",
    again: "Send another response",
  },
  allergens: {
    gluten: "Gluten",
    crustaceos: "Crustaceans",
    huevo: "Eggs",
    pescado: "Fish",
    cacahuete: "Peanuts",
    soja: "Soy",
    lactosa: "Dairy / lactose",
    frutos_secos: "Tree nuts",
    apio: "Celery",
    mostaza: "Mustard",
    sesamo: "Sesame",
    sulfitos: "Sulphites",
    altramuces: "Lupin",
    moluscos: "Molluscs",
  },
};

const DICTS: Record<Lang, Dict> = { es, en };
const KEY = "boda-idioma";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "es", t: es, setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const initial: Lang = saved === "es" || saved === "en" ? saved : navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
    setLangState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "es" ? "es-ES" : "en";
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      t: DICTS[lang],
      setLang: (l) => {
        localStorage.setItem(KEY, l);
        setLangState(l);
      },
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function LangToggle() {
  const { lang, t, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label={t.langLabel}
      className="fixed right-3 top-3 z-[70] flex overflow-hidden rounded-full border border-champan/70 bg-marfil/90 font-display text-lg leading-none shadow-sm backdrop-blur"
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`cursor-pointer px-3.5 py-1.5 uppercase transition focus-visible:outline-2 focus-visible:outline-burdeos ${
            lang === l ? "bg-burdeos text-marfil" : "text-bosque hover:bg-champan/25"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
