type Props = { className?: string; flip?: boolean; rotate?: number; style?: React.CSSProperties };

import olive from "@/assets/olive.webp";

// Rama de olivo dibujada a mano (assets/olive.webp). Se puede girar y reflejar para componer.
export default function OliveBranch({ className, flip, rotate = 0, style }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={olive.src}
      alt=""
      aria-hidden
      draggable={false}
      width={900}
      height={1350}
      className={className}
      style={{ transform: `${flip ? "scaleX(-1) " : ""}rotate(${rotate}deg)`, ...style }}
    />
  );
}
