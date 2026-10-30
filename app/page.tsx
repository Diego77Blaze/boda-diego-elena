"use client";

import { useEffect, useRef, useState } from "react";
import PartyMode from "@/components/PartyMode";
import { motion, useReducedMotion } from "motion/react";
import Envelope from "@/components/Envelope";
import Countdown from "@/components/Countdown";
import ToledoDraw, { type ToledoHandle } from "@/components/ToledoDraw";
import { RibbonFrame } from "@/components/Ribbon";
import EventMap from "@/components/EventMap";
import RsvpForm from "@/components/RsvpForm";
import { useLang } from "@/lib/i18n";
import pareja from "@/assets/pareja.webp";
import anillos from "@/assets/anillos.webp";
import patronOro from "@/assets/patron-oro.webp";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const WEDDING = Date.parse("2027-07-31T18:30:00+02:00");
const SEEN_KEY = "boda-sobre-visto";

export default function Page() {
  const reduce = useReducedMotion();
  const { t } = useLang();
  const [envelope, setEnvelope] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const toledo = useRef<ToledoHandle>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    const show = !seen && !reduce;
    setEnvelope(show);
    setRevealed(!show);
  }, [reduce]);
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => toledo.current?.play(), 700);
    return () => clearTimeout(t);
  }, [revealed]);

  useEffect(() => {
    document.body.style.overflow = envelope ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [envelope]);

  const opened = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setEnvelope(false);
    setRevealed(true);
  };

  const [party, setParty] = useState(false);
  const [after, setAfter] = useState(false);
  useEffect(() => {
    const check = () => setAfter(Date.now() >= WEDDING);
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);
  const taps = useRef({ n: 0, last: 0 });
  const song = useRef<HTMLAudioElement>(null);
  const tapHeart = () => {
    const now = Date.now();
    const t = taps.current;
    t.n = now - t.last < 900 ? t.n + 1 : 1;
    t.last = now;
    if (t.n >= 3) {
      t.n = 0;
      const a = song.current;
      if (party) {
        a?.pause();
        setParty(false);
      } else {
        if (a) {
          a.currentTime = 0;
          a.play().catch(() => {});
        }
        setParty(true);
      }
    }
  };

  const replay = () => {
    window.scrollTo({ top: 0 });
    setRevealed(false);
    setEnvelope(true);
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 18 },
    transition: { duration: 0.9, delay: reduce ? 0 : delay, ease: "easeOut" as const },
  });

  return (
    <>
      {envelope === null && <div className="paper fixed inset-0 z-50 bg-marfil" />}
      {envelope && <Envelope onOpened={opened} />}

      <main>
        <section className="relative flex min-h-svh flex-col items-center overflow-hidden px-12 pt-14 sm:pt-20">
          <RibbonFrame bow className="pointer-events-none absolute inset-0 size-full" />


          <motion.p {...fade(0.1)} className="mt-14 font-display text-2xl text-oliva sm:mt-12">
            {t.hero.marry}
          </motion.p>
          <motion.h1 {...fade(0.25)} className="mt-4 text-center font-display leading-[0.85] text-bosque">
            <span className="block text-[clamp(3.6rem,17vw,8rem)]">Diego</span>
            <span className="block text-[clamp(2.2rem,9vw,4.5rem)] text-burdeos">&amp;</span>
            <span className="block text-[clamp(3.6rem,17vw,8rem)]">Elena</span>
          </motion.h1>
          <motion.div {...fade(0.45)} className="mt-6 text-center">
            <div className="relative mx-auto w-fit px-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={anillos.src} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 w-[13.5rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.16] sm:w-[18rem]" />
              <p className="relative font-display text-2xl text-bosque/80 sm:text-3xl">{t.hero.weekday}</p>
              <p className="relative font-display text-[1.9rem] leading-tight sm:text-5xl">{t.hero.date}</p>
            </div>
            <p className="mt-3 font-display text-2xl text-burdeos">{t.hero.city}</p>
            <div className="mx-auto mt-10 max-w-[17rem] font-display text-lg text-bosque/85 sm:max-w-sm">
              <p>{t.hero.thanks1}</p>
              <p className="mt-4 text-balance">{t.hero.thanks2}</p>
            </div>
          </motion.div>

          <motion.div {...fade(0.7)} className="relative z-10 mt-12 mb-14 w-full max-w-3xl">
            {reduce ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${BASE}/toledo.webp`} alt={t.hero.toledoAlt} width={960} height={606} className="h-auto w-full" />
            ) : (
              <ToledoDraw ref={toledo} className="h-auto w-full" />
            )}
          </motion.div>
        </section>

        <section className="bg-marfil px-6 py-20 text-center">
          <p className="mb-8 font-display text-3xl text-oliva">{t.countdown.title}</p>
          <Countdown />
          <a
            href="#evento"
            className="mt-12 inline-block rounded-full bg-burdeos whitespace-nowrap px-7 py-3 font-display text-xl sm:text-2xl text-marfil shadow-sm transition hover:bg-burdeos/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burdeos"
          >
            {t.countdown.cta}
          </a>
        </section>

        <section id="evento" className="relative bg-bosque px-6 py-24 text-marfil">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.28]" style={{ backgroundImage: `url(${patronOro.src})`, backgroundSize: "400px auto" }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-display text-5xl sm:text-6xl">{t.event.title}</h2>
            <EventMap />
            
          </div>
        </section>

        <RsvpForm />

        <footer className="bg-marfil px-6 pb-10 pt-14 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pareja.src}
            alt={t.footer.coupleAlt}
            width={700}
            height={700}
            onClick={tapHeart}
            className="mx-auto h-auto w-56 cursor-pointer select-none sm:w-72"
          />
          <button
            type="button"
            onClick={replay}
            className="mt-8 font-display text-xl text-oliva underline decoration-champan decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-burdeos"
          >
            {t.footer.reopen}
          </button>
        </footer>
      </main>
      <PartyMode active={party || (after && revealed)} />
      <audio ref={song} src={`${BASE}/cancion.mp3`} preload="none" onEnded={() => setParty(false)} />
    </>
  );
}
