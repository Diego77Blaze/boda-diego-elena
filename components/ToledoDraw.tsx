"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ToledoHandle = { play: () => void };

/** Vídeo con fondo transparente: cada fotograma se pinta en un canvas quitando el color crema. */
const ToledoDraw = forwardRef<ToledoHandle, { className?: string }>(function ToledoDraw({ className }, ref) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  const paint = () => {
    const v = video.current, c = canvas.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const p = img.data;
    for (let i = 0; i < p.length; i += 4) {
      const d = Math.max(247 - p[i], 245 - p[i + 1], 236 - p[i + 2], 0);
      const a = (d - 6) / 50;
      p[i + 3] = a <= 0 ? 0 : a >= 1 ? 255 : a * 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  const loop = () => {
    paint();
    const v = video.current;
    if (v && !v.paused && !v.ended) raf.current = requestAnimationFrame(loop);
  };

  useImperativeHandle(ref, () => ({
    play: () => {
      const v = video.current;
      if (!v) return;
      v.currentTime = 0;
      void v.play().then(() => loop()).catch(() => {});
    },
  }));

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onEnd = () => paint();
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("ended", onEnd);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <video ref={video} src={`${BASE}/toledo.mp4`} muted playsInline preload="auto" className="hidden" />
      <canvas
        ref={canvas}
        width={960}
        height={606}
        role="img"
        aria-label="Dibujo de Toledo con el Alcázar, la catedral y el puente de Alcántara"
        className={className}
      />
    </>
  );
});

export default ToledoDraw;
