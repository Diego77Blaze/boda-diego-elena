"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "es" | "en";

const es = {
  oracle: {
    open: "Oráculo del Cigarral",
    title: "Oráculo del Cigarral",
    sub: "Consulta tu futuro en la boda",
    intro: "Los astros ya tienen opinión sobre ti.",
    button: "Girar la ruleta del destino",
    again: "Girar otra vez",
    thinking: "El destino está girando…",
    close: "Cerrar",
    predictions: [
      "Prometerás que solo te comes una croqueta. No cumplirás.",
      "Bailarás «Accidentalmente enamorados» como si te fuera la vida en ello. Y te irá bien.",
      "Llorarás en la ceremonia. Dirás que se te ha metido una pestaña. Nadie te creerá.",
      "Dirás «me quedo solo un ratito» y verás amanecer.",
      "Alguien te pedirá una foto de grupo. Serán catorce fotos.",
      "Tu móvil se quedará sin batería justo antes del baile del ramo.",
      "Descubrirás que bailas mejor de lo que pensabas. Spoiler: no.",
      "Brindarás con alguien a quien no conoces. Al final de la noche, mejores amigos.",
      "Una abuela te dará un consejo que te cambiará el resto de la semana.",
      "Te dará un ataque de risa en el peor momento posible. Será el mejor momento.",
      "Un camarero te traerá el plato justo cuando acabes de decir que no tienes hambre.",
      "Te sentarán justo al lado de la persona con la que querías hablar. O no. Sorpresa.",
      "Encontrarás la pista de baile a las 23:47 y ya no la soltarás.",
      "Harás una foto perfecta… con el dedo tapando media lente.",
      "Te convertirás en máquina de kebab.",
      "Un gatito se cruzará en tu camino y te hará más ilusión que todo el banquete. Miau.",
      "Encontrarás un quesito manchego que te acompañará toda la noche. No lo sueltes.",
      "Sonará «All Star» y cantarás como si fuera el himno de Shrek. Lo es.",
      "Alguien te dirá que eres como un ogro: tienes capas. Es un cumplido. Creo.",
      "Y A VECES SE ME OLVIDAAA… dónde has dejado la chaqueta. Estará en el respaldo de tu silla.",
      "Dirás «yo no bailo» y serás el último en irte de la pista.",
      "El DJ pondrá tu canción favorita justo cuando vayas al baño.",
      "Un primo lejano te explicará cómo habría organizado él la boda.",
      "Alguien llorará con los discursos. Spoiler: serás tú otra vez.",
      "Pedirás «la última» a las 3:00. Y otra «última» a las 3:15.",
      "Prometerás no subir stories. Subirás 47.",
      "Las zapatillas de repuesto serán la mejor decisión de tu vida.",
      "Tu abuelo bailará mejor que tú. Y lo sabrá.",
      "Te preguntarán siete veces «¿tú de parte de quién vienes?». Responderás distinto cada vez.",
      "Te harás íntimo amigo de un desconocido por culpa de un croquetón. Pacto de por vida.",
      "El jamón se acabará antes que la pista de baile. Corre.",
      "Un gato te mirará fijamente desde una esquina. No te juzga. Bueno, un poco sí.",
      "Mañana te acordarás de este oráculo. Y de la última copa.",
      "Dirás «qué guapo/a voy» sin que nadie te lo pregunte. Y tendrás razón.",
      "Alguien te preguntará «¿y vosotros para cuándo?» y le pondrás cara de oráculo.",
      "Habrá un momento en que bailarás con una silla. Será memorable.",
    ],
  },
  secrets: {
    hint: (n: number) => `Toledo guarda 3 secretos… toca los monumentos (${n}/3)`,
    found: "Símbolo encontrado",
    close: "Cerrar",
    done: "¡Los tres símbolos! Ya conocéis Toledo casi tan bien como nosotros.",
    sites: {
      catedral: { name: "La Catedral", symbol: "⛪", text: "La Catedral Primada tardó casi 270 años en construirse (1226-1493). Nosotros prometemos que la boda no se hace tan larga." },
      alcazar: { name: "El Alcázar", symbol: "🏰", text: "Corona el punto más alto de la ciudad. Carlos V lo convirtió en palacio, y desde aquí arriba se ve todo Toledo." },
      puente: { name: "El puente de Alcántara", symbol: "🌉", text: "«Alcántara» viene del árabe al-qantara: «el puente». Así que se llama, literalmente, «puente del puente»." },
    },
  },
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
  oracle: {
    open: "Oracle of the Cigarral",
    title: "Oracle of the Cigarral",
    sub: "See your wedding fortune",
    intro: "The stars already have an opinion about you.",
    button: "Spin the wheel of fate",
    again: "Spin again",
    thinking: "Fate is spinning…",
    close: "Close",
    predictions: [
      "You'll promise to eat just one croquette. You won't.",
      "You'll dance to “Accidentalmente enamorados” like your life depends on it. And it'll go well.",
      "You'll cry during the ceremony. You'll say an eyelash got in your eye. Nobody will believe you.",
      "You'll say “I'll just stay a little while” and see the sunrise.",
      "Someone will ask you to take a group photo. It will be fourteen photos.",
      "Your phone will die right before the bouquet toss.",
      "You'll discover you dance better than you thought. Spoiler: you don't.",
      "You'll toast with someone you don't know. By the end of the night, best friends.",
      "A grandma will give you advice that changes the rest of your week.",
      "You'll get a fit of laughter at the worst possible moment. It will be the best moment.",
      "A waiter will bring your plate right after you said you weren't hungry.",
      "You'll be seated right next to the person you wanted to talk to. Or not. Surprise.",
      "You'll find the dance floor at 11:47 pm and never leave it.",
      "You'll take a perfect photo… with your finger covering half the lens.",
      "You'll turn into a kebab machine.",
      "A kitten will cross your path and you'll be more excited about it than the whole banquet. Meow.",
      "You'll find a little Manchego cheese wedge that will keep you company all night. Don't let go.",
      "“All Star” will play and you'll sing it like it's Shrek's national anthem. It is.",
      "Someone will tell you you're like an ogre: you have layers. It's a compliment. I think.",
      "AND SOMETIMES I FORGEEET… where you left your jacket. It'll be on the back of your chair.",
      "You'll say “I don't dance” and be the last one to leave the dance floor.",
      "The DJ will play your favorite song right when you go to the bathroom.",
      "A distant cousin will explain how he would have organized the wedding.",
      "Someone will cry at the speeches. Spoiler: it'll be you again.",
      "You'll ask for “the last one” at 3:00. And another “last one” at 3:15.",
      "You'll promise not to post stories. You'll post 47.",
      "The spare sneakers will be the best decision of your life.",
      "Your grandpa will dance better than you. And he'll know it.",
      "They'll ask you “who are you here with?” seven times. You'll answer differently every time.",
      "You'll become best friends with a stranger over a giant croquette. Lifelong pact.",
      "The ham will run out before the dance floor does. Run.",
      "A cat will stare at you from a corner. It's not judging you. Okay, a little.",
      "Tomorrow you'll remember this oracle. And the last drink.",
      "You'll say “I look so good” without anyone asking. And you'll be right.",
      "Someone will ask “so when are you two next?” and you'll give them your best oracle face.",
      "At some point you'll dance with a chair. It will be memorable.",
    ],
  },
  secrets: {
    hint: (n: number) => `Toledo hides 3 secrets… tap the landmarks (${n}/3)`,
    found: "Symbol found",
    close: "Close",
    done: "All three symbols! You now know Toledo almost as well as we do.",
    sites: {
      catedral: { name: "The Cathedral", symbol: "⛪", text: "The Primate Cathedral took almost 270 years to build (1226-1493). We promise the wedding won't take that long." },
      alcazar: { name: "The Alcázar", symbol: "🏰", text: "It crowns the highest point of the city. Charles V turned it into a palace, and from up here you can see all of Toledo." },
      puente: { name: "Alcántara Bridge", symbol: "🌉", text: "“Alcántara” comes from the Arabic al-qantara: “the bridge”. So it's literally called “the bridge bridge”." },
    },
  },
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
