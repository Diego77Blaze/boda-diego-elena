"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useSpring } from "motion/react";
import OliveBranch from "./OliveBranch";
import { RibbonFrame } from "./Ribbon";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
import sello from "@/assets/logo-sello.webp";

/** Definiciones compartidas: textura de papel y cera de lacre. */
function Defs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="3" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0.16  0 0 0 0 0.18  0 0 0 0 0.1  0.9 0 0 0 -0.32" result="speck" />
          <feComposite in="speck" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="fibres" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.5" numOctaves="2" seed="11" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.42" result="f" />
          <feComposite in="f" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="shadowUp" x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx="0" dy="-3" stdDeviation="3.5" floodColor="#1d2a20" floodOpacity="0.45" />
        </filter>
        <filter id="shadowDown" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4.5" floodColor="#1d2a20" floodOpacity="0.4" />
        </filter>
        <filter id="wax" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="9" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="1.8" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="26" lightingColor="#ffd8d8" result="spec">
            <feDistantLight azimuth="225" elevation="48" />
          </feSpecularLighting>
          <feComposite in="spec" in2="shape" operator="in" result="specIn" />
          <feComposite in="shape" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0" />
        </filter>
        <pattern id="liner" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M13 3 q5 5 0 11 q-5 -6 0 -11z" fill="#9b4a5c" opacity="0.55" />
          <circle cx="0" cy="20" r="1.1" fill="#9b4a5c" opacity="0.5" />
          <circle cx="26" cy="20" r="1.1" fill="#9b4a5c" opacity="0.5" />
        </pattern>
        <radialGradient id="waxBase" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#A24A5E" />
          <stop offset="0.5" stopColor="#74303F" />
          <stop offset="1" stopColor="#4A1B27" />
        </radialGradient>
        <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4B1A27" />
          <stop offset="1" stopColor="#6A2B3A" />
        </linearGradient>
        <linearGradient id="gLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8B9167" />
          <stop offset="1" stopColor="#737952" />
        </linearGradient>
        <linearGradient id="gRight" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#80865D" />
          <stop offset="1" stopColor="#686E49" />
        </linearGradient>
        <linearGradient id="gBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C825A" />
          <stop offset="1" stopColor="#8A9066" />
        </linearGradient>
        <linearGradient id="gFlap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#868C63" />
          <stop offset="1" stopColor="#6C724B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Seal({ half }: { half?: "l" | "r" }) {
  const clip = half === "l" ? "inset(0 50% 0 0)" : half === "r" ? "inset(0 0 0 50%)" : undefined;
  return (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible" style={{ clipPath: clip }} aria-hidden>
      <g filter="url(#wax)">
        <circle cx="50" cy="50" r="40" fill="url(#waxBase)" />
        <circle cx="17" cy="66" r="6" fill="#5C2331" />
        <circle cx="86" cy="38" r="5" fill="#5C2331" />
        <circle cx="62" cy="91" r="5.5" fill="#5C2331" />
      </g>
      <image
        href={sello.src}
        x="17" y="17" width="66" height="66"
        style={{ opacity: 0.95 }}
      />
    </svg>
  );
}

export default function Envelope({ onOpened }: { onOpened: () => void }) {
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const flapFront = useRef<SVGSVGElement>(null);
  const flapBack = useRef<SVGSVGElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const cardContent = useRef<HTMLDivElement>(null);
  const sealL = useRef<HTMLDivElement>(null);
  const sealR = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const tilting = useRef(true);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!tilting.current || e.pointerType === "touch") return;
      ry.set((e.clientX / window.innerWidth - 0.5) * 10);
      rx.set(-(e.clientY / window.innerHeight - 0.5) * 8);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [rx, ry]);

  async function open() {
    if (busy || !env.current || !flap.current || !card.current) return;
    setBusy(true);
    tilting.current = false;
    rx.set(0);
    ry.set(0);
    const ease = [0.65, 0, 0.35, 1] as const;

    animate(hint.current!, { opacity: 0 }, { duration: 0.3 });
    await animate(env.current, { scale: [1, 0.985, 1] }, { duration: 0.25 });
    animate(sealL.current!, { x: -34, y: 70, rotate: -24, opacity: [1, 1, 0] }, { duration: 0.8, ease: "easeIn" });
    await animate(sealR.current!, { x: 34, y: 78, rotate: 20, opacity: [1, 1, 0] }, { duration: 0.8, ease: "easeIn" });

    const front = flapFront.current!, back = flapBack.current!;
    const swing = (v: number) => {
      const c = Math.cos((v * Math.PI) / 180);
      front.style.visibility = v < 90 ? "visible" : "hidden";
      back.style.visibility = v > 90 ? "visible" : "hidden";
      front.style.transform = `scaleY(${Math.max(c, 0)})`;
      back.style.transform = `scaleY(${Math.min(c, 0)})`;
    };
    await animate(0, 90, { duration: 0.45, ease: "easeIn", onUpdate: swing });
    flap.current.style.zIndex = "1";
    await animate(90, 180, { duration: 0.5, ease: "easeOut", onUpdate: swing });

    const rise = env.current.getBoundingClientRect().height * 0.64;
    await animate(card.current, { y: -rise, rotate: [0, -1.2, 0] }, { duration: 1, ease: [0.22, 0.8, 0.3, 1] });

    card.current.style.zIndex = "20";
    const r = card.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = Math.max(vw / r.width, vh / r.height) * 1.04;
    animate("[data-shell]", { opacity: 0 }, { duration: 0.7 });
    animate(cardContent.current!, { opacity: 0 }, { duration: 0.3 });
    animate("[data-grain]", { opacity: 0 }, { duration: 0.3 });
    await animate(
      card.current,
      { x: vw / 2 - (r.left + r.width / 2), y: -rise + vh / 2 - (r.top + r.height / 2), scale },
      { duration: 1.2, ease },
    );

    await animate(root.current!, { opacity: 0 }, { duration: 0.7, ease: "easeInOut" });
    setGone(true);
    onOpened();
  }

  if (gone) return null;

  return (
    <div ref={root} className="paper fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-marfil px-4">
      <Defs />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "var(--patron)", backgroundSize: "480px auto", maskImage: "radial-gradient(circle at 100% 0, transparent 19rem, #000 23rem), radial-gradient(circle at 0 100%, transparent 19rem, #000 23rem)", maskComposite: "intersect", WebkitMaskImage: "radial-gradient(circle at 100% 0, transparent 19rem, #000 23rem), radial-gradient(circle at 0 100%, transparent 19rem, #000 23rem)", WebkitMaskComposite: "source-in" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#FBF8F1_0%,transparent_55%,rgba(199,173,133,0.32)_100%)]" />
      <OliveBranch className="pointer-events-none absolute -bottom-10 -left-10 w-40 opacity-80 sm:w-56" rotate={20} />
      <OliveBranch className="pointer-events-none absolute -right-10 -top-10 w-40 opacity-80 sm:w-56" rotate={200} />

      <p className="relative mb-12 text-center font-display text-[1.45rem] leading-tight text-oliva sm:text-3xl">Diego &amp; Elena · 31.07.2027</p>

      <button
        type="button"
        onClick={open}
        aria-label="Abrir la invitación de boda de Diego y Elena"
        className="relative cursor-pointer select-none outline-none [perspective:1600px] focus-visible:ring-2 focus-visible:ring-burdeos focus-visible:ring-offset-8 focus-visible:ring-offset-marfil"
      >
        <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
          <motion.div
            ref={env}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-[3/2] w-[min(88vw,460px)] [transform-style:preserve-3d]"
          >
            <div data-shell className="absolute inset-x-[4%] -bottom-[7%] h-[12%] rounded-[50%] bg-bosque/40 blur-xl" />

            <svg data-shell viewBox="0 0 600 400" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <rect width="600" height="400" rx="3" fill="url(#gBack)" />
              <rect width="600" height="400" rx="3" fill="url(#liner)" />
              <rect width="600" height="400" rx="3" filter="url(#grain)" fill="#000" />
            </svg>

            <div ref={card} className="absolute inset-x-[5%] inset-y-[4%] z-[2] overflow-hidden rounded-[2px] bg-[#FBF8F0] shadow-[0_2px_10px_rgba(40,20,20,0.3)]">
              <svg data-grain className="absolute inset-0 size-full" aria-hidden>
                <rect width="100%" height="100%" filter="url(#grain)" fill="#000" opacity="0.55" />
              </svg>
              <div ref={cardContent} className="absolute inset-0">
                <RibbonFrame className="absolute inset-[3%] size-[94%]" width={2.6} margin={3} top={3} amp={2.6} />

                <div className="relative flex size-full flex-col items-center justify-center text-center">
                  <p className="font-display text-[1.25rem] leading-none text-oliva sm:text-[1.6rem]">Nos casamos</p>
                  <p className="mt-0.5 font-display text-[1.8rem] leading-[1.15] text-bosque sm:text-[2.6rem]">
                    Diego <span className="text-burdeos">&amp;</span> Elena
                  </p>
                  <p className="mt-3.5 font-display text-[0.9rem] leading-none text-burdeos sm:text-[1.2rem]">31.07.2027 · Toledo</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${BASE}/toledo.webp`} alt="" className="mt-1 w-[44%]" draggable={false} />
                </div>
              </div>
            </div>

            <svg data-shell viewBox="0 0 600 400" preserveAspectRatio="none" className="absolute inset-0 z-[3] size-full overflow-visible" aria-hidden>
              <polygon points="0,0 300,232 0,400" fill="url(#gLeft)" />
              <polygon points="600,0 300,232 600,400" fill="url(#gRight)" />
              <g filter="url(#shadowUp)">
                <polygon points="0,400 300,214 600,400" fill="url(#gBottom)" />
              </g>
              <polygon points="0,0 300,232 0,400 600,400 600,0 300,232" fill="#fff" filter="url(#fibres)" opacity="0.16" />
              <polygon points="0,0 300,232 0,400 600,400 600,0 300,232" fill="#000" filter="url(#grain)" />
              <polyline points="0,400 300,214 600,400" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" />
              <polyline points="0,0 300,232 600,0" fill="none" stroke="#1d2a20" strokeOpacity="0.14" strokeWidth="1" />
              <rect x="0.5" y="0.5" width="599" height="399" rx="3" fill="none" stroke="#fff" strokeOpacity="0.14" />
            </svg>

            <div
              ref={flap}
              className="absolute inset-x-0 top-0 h-[58%] "
              style={{ zIndex: 4 }}
            >
              <svg
                data-shell
                viewBox="0 0 600 232"
                preserveAspectRatio="none"
                ref={flapFront}
                className="absolute inset-0 size-full origin-top overflow-visible"
                aria-hidden
              >
                <g filter="url(#shadowDown)">
                  <polygon points="0,0 600,0 300,232" fill="url(#gFlap)" />
                </g>
                <polygon points="0,0 600,0 300,232" fill="#fff" filter="url(#fibres)" opacity="0.16" />
                <polygon points="0,0 600,0 300,232" fill="#000" filter="url(#grain)" />
                <polyline points="0,0 300,232 600,0" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" />
              </svg>
              <svg
                data-shell
                viewBox="0 0 600 232"
                preserveAspectRatio="none"
                ref={flapBack}
                className="absolute inset-0 size-full origin-top overflow-visible"
                style={{ visibility: "hidden", transform: "scaleY(0)" }}
                aria-hidden
              >
                <polygon points="0,0 600,0 300,232" fill="url(#gBack)" />
                <polygon points="0,0 600,0 300,232" fill="url(#liner)" />
                <polygon points="0,0 600,0 300,232" fill="#000" filter="url(#grain)" />
                <polyline points="0,0 300,232 600,0" fill="none" stroke="#E7A9B4" strokeOpacity="0.25" strokeWidth="1.2" />
              </svg>
            </div>

            <div data-shell className="absolute left-1/2 top-[58%] z-[5] aspect-square w-[23%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_5px_rgba(30,8,14,0.5)]">
              <div className="size-full animate-[sealPulse_3s_ease-in-out_infinite]">
                <div ref={sealL} className="absolute inset-0">
                  <Seal half="l" />
                </div>
                <div ref={sealR} className="absolute inset-0">
                  <Seal half="r" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </button>

      <p ref={hint} className="relative mt-14 max-w-[18rem] text-balance text-center font-display text-[1.35rem] leading-snug text-oliva sm:max-w-none sm:text-2xl">
        <span className="inline-block animate-[hintFade_3s_ease-in-out_infinite]">Pulsa para abrir nuestra invitación</span>
      </p>

      <style>{`
        @keyframes sealPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes hintFade { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>
    </div>
  );
}
