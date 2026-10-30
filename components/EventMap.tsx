"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

const PLACES = [
  {
    id: "ceremonia",
    name: "Parroquia Santiago el Mayor de Toledo",
    address: "Plaza de Santiago del Arrabal, Toledo",
    query: "Parroquia Santiago el Mayor, Plaza de Santiago del Arrabal, Toledo",
  },
  {
    id: "celebracion",
    name: "El Cigarral de las Mercedes",
    address: "Carretera de Piedrabuena, 72, Toledo",
    query: "Cigarral de las Mercedes, Carretera de Piedrabuena 72, Toledo",
  },
] as const;

export default function EventMap() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);
  const place = PLACES[active];
  const labels = [t.event.ceremony, t.event.celebration];
  const names = [t.event.ceremonyName, PLACES[1].name];
  const q = encodeURIComponent(place.query);

  return (
    <div className="mt-12">
      <div role="tablist" aria-label={t.event.locations} className="grid gap-4 sm:grid-cols-2">
        {PLACES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={i === active}
            aria-controls="mapa-evento"
            onClick={() => setActive(i)}
            className={`cursor-pointer rounded-2xl border-2 px-5 py-5 text-center transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champan ${
              i === active ? "border-champan bg-marfil/10" : "border-marfil/15 hover:border-marfil/40"
            }`}
          >
            <span className="block font-display text-2xl text-champan">{labels[i]}</span>
            <span className="mx-auto mt-2 block max-w-[18rem] text-balance font-display text-2xl sm:max-w-none sm:text-3xl">{names[i]}</span>
            <span className="mt-1 block text-marfil/75">{p.address}</span>
          </button>
        ))}
      </div>

      <div id="mapa-evento" role="tabpanel" aria-labelledby={`tab-${place.id}`} className="mt-6 overflow-hidden rounded-2xl border-2 border-champan/60 bg-marfil/5">
        <iframe
          key={place.id}
          title={`${t.event.mapPrefix}: ${names[active]}`}
          src={`https://www.google.com/maps?q=${q}&output=embed&hl=${lang}`}
          className="block h-72 w-full sm:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-champan px-7 py-3 font-display text-xl text-bosque transition hover:bg-champan/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champan sm:text-2xl"
      >
        {t.event.openMaps}
      </a>
    </div>
  );
}
