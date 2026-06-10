// Film-grain overlay — a fixed, non-interactive SVG noise layer that kills the
// "flat digital white" look. Pure markup (RSC-safe), no animation, so it needs
// no reduced-motion guard. Opacity is deliberately whisper-quiet.

export function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05] mix-blend-multiply"
    >
      <filter id="page-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#page-grain)" />
    </svg>
  );
}
