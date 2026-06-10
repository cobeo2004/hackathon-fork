"use client";

// Full-bleed PINNED hero — a solar-farm scene scrubbed by scroll.
//
// The outer section is ~250vh tall; the inner panel sticks for the traverse.
// One spring-smoothed progress value drives the whole scene, fully reversible:
//   p=0   dawn — sun low on the LEFT, day sky, panels tilted toward the sun
//   p=0.5 noon — sun overhead-centre, panels level
//   p=1   midnight — sun has set on the RIGHT, navy sky, stars + moon,
//         panels tilted right, headline flips to paper-white
//
// Layers back→front: sky crossfades (day/dusk/night) → stars → sun + moon →
// mountains (day/night copies) → solar field rows (shared tilt MotionValue,
// single-axis-tracker look) → ground → centred content (Goodman-gallery style).
//
// Reduced motion: no pinning, no scrub — a static golden-hour scene (progress
// locked at 0.25) with the content in its final readable state.

import Link from "next/link";
import { Fragment, useRef, type CSSProperties, type ReactNode } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { MotionProvider, useMagnetic } from "./motion-features";

const HEAD_LEAD = ["We", "predict", "which", "solar", "assets", "fail", "next."];
const HEAD_ACCENT = ["and", "recover", "them", "on", "the", "cheapest", "route."];

// Deterministic star field (no Math.random — SSR/hydration must match).
// [x%, y%, radius]
const STARS: Array<[number, number, number]> = [
  [3, 12, 1.1], [7, 34, 0.7], [11, 8, 0.9], [14, 26, 0.6], [18, 15, 1.2],
  [22, 38, 0.7], [26, 6, 0.8], [29, 22, 1.0], [33, 31, 0.6], [37, 11, 0.9],
  [41, 27, 0.7], [44, 5, 1.1], [48, 18, 0.6], [52, 33, 0.9], [55, 9, 0.7],
  [59, 24, 1.2], [63, 14, 0.6], [66, 36, 0.8], [70, 7, 1.0], [73, 21, 0.7],
  [77, 30, 0.9], [81, 12, 0.6], [84, 25, 1.1], [88, 17, 0.8], [91, 35, 0.7],
  [94, 9, 1.0], [97, 28, 0.6], [5, 44, 0.8], [16, 41, 0.6], [35, 43, 0.8],
  [46, 40, 0.6], [58, 45, 0.9], [69, 42, 0.6], [80, 44, 0.8], [90, 41, 0.6],
  [25, 46, 0.7],
];

// Solar-field rows, front → back: nearer rows are larger and lower. `scale`
// sizes each PANEL in layout (no row transform) — a transformed row whose flex
// content overflows the viewport re-centres visually and the rows drift out of
// alignment at narrow widths. Sized panels can never overflow.
const FIELD_ROWS = [
  { scale: 1, bottom: "1%", count: 4, z: 3 },
  { scale: 0.72, bottom: "13%", count: 6, z: 2 },
  { scale: 0.52, bottom: "21%", count: 8, z: 1 },
];

export function HeroBand() {
  return (
    <MotionProvider>
      <HeroInner />
    </MotionProvider>
  );
}

function HeroInner() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrubbed = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  // Reduced motion: lock the whole scene at a static golden hour.
  const frozen = useMotionValue(0.25);
  const p = reduce ? frozen : scrubbed;

  // ── Sky / celestial ──
  const dayOpacity = useTransform(p, [0.35, 0.6], [1, 0]);
  const duskOpacity = useTransform(p, [0.3, 0.5, 0.72], [0, 1, 0]);
  const nightOpacity = useTransform(p, [0.55, 0.8], [0, 1]);
  const starsOpacity = useTransform(p, [0.7, 0.95], [0, 1]);
  const sunLeft = useTransform(p, [0, 1], ["6%", "94%"]);
  const sunTop = useTransform(p, (v) => `${68 - Math.sin(v * Math.PI) * 46}%`);
  const sunOpacity = useTransform(p, [0.78, 0.92], [1, 0]);
  const moonOpacity = useTransform(p, [0.78, 0.95], [0, 1]);

  // ── Field ──
  const panelTilt = useTransform(p, [0, 1], [-18, 18]);
  const glintOpacity = useTransform(p, (v) => Math.sin(v * Math.PI) * 0.4);

  // ── Content colors: ink by day, paper by night ──
  const fg = useTransform(p, [0.45, 0.7], ["#1a1611", "#f5f2ea"]);
  const fgMuted = useTransform(p, [0.45, 0.7], ["#564f43", "#d8d2c6"]);
  const btnBg = useTransform(p, [0.45, 0.7], ["#1a1611", "#f5f2ea"]);
  const btnFg = useTransform(p, [0.45, 0.7], ["#ffffff", "#1a1611"]);
  // Ghost CTA gets a SOLID floor (paper by day, ink by night) so the panel
  // field behind it never bleeds through the label.
  const ghostBg = useTransform(
    p,
    [0.45, 0.7],
    ["rgba(255,255,255,0.95)", "rgba(26,22,17,0.9)"],
  );
  const scrimDay = useTransform(p, [0.45, 0.7], [0.55, 0]);
  const scrimNight = useTransform(p, [0.45, 0.7], [0, 0.45]);

  const contentOpacity = useTransform(p, [0.92, 1], [1, 0]);
  const contentY = useTransform(p, [0.92, 1], [0, -50]);
  const cueOpacity = useTransform(p, [0, 0.12], [1, 0]);

  return (
    <section
      ref={ref}
      // Negative top margin pulls the scene to the page top: cancels main's
      // py-14 (3.5rem) AND the sticky header's height, so the sky runs behind
      // the translucent header — no white gap above the scene.
      className="relative left-1/2 w-screen -translate-x-1/2 mt-[calc(-3.5rem-64px)]"
      style={reduce ? undefined : { minHeight: "250vh" }}
    >
      <div
        className={
          reduce
            ? "relative min-h-[92vh] overflow-hidden"
            : "sticky top-0 h-screen overflow-hidden"
        }
      >
        {/* ── Sky (three stacked gradients crossfading) ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #b9d6ea 0%, #ddeae6 55%, #f6efdd 100%)",
          }}
        />
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: duskOpacity,
            background:
              "linear-gradient(to bottom, #8d86a8 0%, #d89266 45%, #f3b46b 75%, #f8d39a 100%)",
          }}
        />
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: nightOpacity,
            background:
              "linear-gradient(to bottom, #070b1d 0%, #0b1026 55%, #1a2240 100%)",
          }}
        />
        {/* dayOpacity is consumed by fading the day layer's residents (sun glow
            haze) — the base day gradient simply gets covered by dusk/night. */}

        {/* ── Stars ── */}
        <m.svg
          aria-hidden
          className="absolute inset-x-0 top-0 h-[55%] w-full"
          style={{ opacity: starsOpacity }}
          preserveAspectRatio="none"
          viewBox="0 0 100 50"
        >
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r * 0.18} fill="#e9e6da" />
          ))}
        </m.svg>

        {/* ── Sun ── */}
        <m.div
          aria-hidden
          className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-36 md:w-36"
          style={{
            left: sunLeft,
            top: sunTop,
            opacity: sunOpacity,
            background:
              "radial-gradient(circle, #fff3c4 0%, #ffd97a 28%, #f3a83b 48%, rgba(224,124,8,0.35) 64%, transparent 72%)",
          }}
        />
        {/* Daylight haze that follows the day sky out. */}
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: dayOpacity,
            background:
              "radial-gradient(900px 420px at 30% 18%, rgba(255,240,200,0.5), transparent 65%)",
          }}
        />

        {/* ── Moon (crescent via offset overlay) ── */}
        <m.div
          aria-hidden
          className="absolute right-[14%] top-[16%] h-12 w-12"
          style={{ opacity: moonOpacity }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full bg-[#ece7d8]">
            <div className="absolute -left-2 -top-2 h-full w-full rounded-full bg-[#0b1026]" />
          </div>
        </m.div>

        {/* ── Mountains (day + night copies crossfade) ── */}
        <Mountains nightOpacity={nightOpacity} />

        {/* ── Ground ── */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[26%]"
          style={{
            background: "linear-gradient(to bottom, #ded7c2 0%, #cfc6ab 100%)",
          }}
        />
        {/* App-texture echo: the body's whisper grid on the field, fading
            toward the horizon. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[26%]"
          style={{
            background:
              "linear-gradient(to right, rgba(26,22,17,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,22,17,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to top, black 30%, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
          }}
        />
        <m.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[26%]"
          style={{
            opacity: nightOpacity,
            background: "linear-gradient(to bottom, #131a36 0%, #0c1126 100%)",
          }}
        />

        {/* ── Solar field ── */}
        {FIELD_ROWS.map((row) => (
          <div
            key={row.bottom}
            aria-hidden
            className="absolute inset-x-0 flex items-end justify-between px-[4%] [--fp-w:clamp(84px,11vw,156px)] [--fp-h:clamp(72px,9.5vw,124px)]"
            style={{ bottom: row.bottom, zIndex: row.z }}
          >
            {Array.from({ length: row.count }, (_, i) => (
              <FieldPanel
                key={i}
                scale={row.scale}
                tilt={panelTilt}
                nightOpacity={nightOpacity}
                glintOpacity={glintOpacity}
              />
            ))}
          </div>
        ))}

        {/* ── Readability scrims behind the centred text ── */}
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: scrimDay,
            background:
              "radial-gradient(ellipse 60% 45% at 50% 46%, rgba(255,255,255,0.85), transparent 70%)",
          }}
        />
        <m.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: scrimNight,
            background:
              "radial-gradient(ellipse 60% 45% at 50% 46%, rgba(7,11,29,0.7), transparent 70%)",
          }}
        />

        {/* ── Centred content (Goodman-gallery composition) ── */}
        <m.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center"
          style={reduce ? { color: "#1a1611" } : { color: fg, opacity: contentOpacity, y: contentY }}
        >
          <m.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-solar align-middle" />
            Solar lifecycle &amp; recovery · Melbourne west &amp; north
          </m.p>

          {/* Headline in the display face (Archivo extrabold) — same font as
              the big "By the numbers" stat figures. */}
          <h1 className="mt-5 max-w-5xl font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-5xl md:text-[64px]">
            <span className="block">
              <Words words={HEAD_LEAD} reduce={!!reduce} startDelay={0.15} />
            </span>
            <span className="block text-solar">
              <Words
                words={HEAD_ACCENT}
                reduce={!!reduce}
                startDelay={0.15 + HEAD_LEAD.length * 0.05}
              />
            </span>
          </h1>

          <m.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15 + (HEAD_LEAD.length + HEAD_ACCENT.length) * 0.05,
            }}
            className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
          >
            <m.span style={reduce ? undefined : { color: fgMuted }}>
              Aging panels and inverters fail unpredictably. Today collection is
              reactive and wasteful. SolarCycle AI turns health data into a plan,
              in three steps.
            </m.span>
          </m.p>

          <m.nav
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25 + (HEAD_LEAD.length + HEAD_ACCENT.length) * 0.05,
            }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <MagneticLink
              href="/problem"
              style={reduce ? { backgroundColor: "#1a1611", color: "#ffffff" } : { backgroundColor: btnBg, color: btnFg }}
              className="rounded-lg px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide"
            >
              See the problem →
            </MagneticLink>
            <MagneticLink
              href="/demo"
              style={
                reduce
                  ? {
                      borderColor: "#1a1611",
                      color: "#1a1611",
                      backgroundColor: "rgba(255,255,255,0.95)",
                    }
                  : { borderColor: fg, color: fg, backgroundColor: ghostBg }
              }
              className="rounded-lg border px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide"
            >
              Jump to the live demo
            </MagneticLink>
          </m.nav>
        </m.div>

        {/* Scroll cue — invites the day→night scrub. */}
        <m.div
          aria-hidden
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
        >
          Scroll to sunset
          <span className="h-9 w-[1px] bg-gradient-to-b from-solar to-transparent" />
        </m.div>

        {/* Bottom blend back into the warm paper page. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-b from-transparent to-paper"
        />
      </div>
    </section>
  );
}

// Two silhouette ranges; the night-tinted copies fade in over the day ones.
function Mountains({ nightOpacity }: { nightOpacity: MotionValue<number> }) {
  const BACK = "M0 200 L120 110 L260 180 L420 70 L580 170 L760 90 L920 175 L1100 105 L1260 165 L1440 120 L1440 200 Z";
  const FRONT = "M0 200 L180 130 L340 190 L520 110 L700 185 L880 125 L1060 190 L1240 140 L1440 185 L1440 200 Z";
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-[24%] h-[34%]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d={BACK} fill="#d6d2c4" />
        <path d={FRONT} fill="#c3bda9" />
      </svg>
      <m.svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity: nightOpacity }}
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path d={BACK} fill="#1c2342" />
        <path d={FRONT} fill="#121833" />
      </m.svg>
    </div>
  );
}

// One field panel: a post + a tilting ink face. All panels share the same
// tilt/night/glint MotionValues → the whole farm tracks the sun in unison.
// Sized from the row's --fp-w/--fp-h vars × the row's depth scale, in LAYOUT
// (not transform), so rows always fit the viewport and stay edge-aligned.
function FieldPanel({
  scale,
  tilt,
  nightOpacity,
  glintOpacity,
}: {
  scale: number;
  tilt: MotionValue<number>;
  nightOpacity: MotionValue<number>;
  glintOpacity: MotionValue<number>;
}) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: `calc(var(--fp-w) * ${scale})`,
        height: `calc(var(--fp-h) * ${scale})`,
      }}
    >
      {/* Post */}
      <div className="absolute bottom-0 left-1/2 h-[26%] w-[4px] -translate-x-1/2 bg-[#6b675c]" />
      {/* Tilting face — warm-ink panel with the amber telemetry cell grid. */}
      <m.div
        className="absolute bottom-[24%] left-0 right-0 h-[70%] overflow-hidden rounded-[3px] border border-[#b8b2a6]"
        style={{
          rotate: tilt,
          transformOrigin: "50% 100%",
          background:
            "linear-gradient(105deg, #3a332a 0%, #241f18 55%, #1a1611 100%)",
        }}
      >
        {/* Cell grid — brand-amber lines, instrument-panel signature. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(224,124,8,0.55) 0 1.5px, transparent 1.5px 18px), repeating-linear-gradient(0deg, rgba(224,124,8,0.55) 0 1.5px, transparent 1.5px 16px)",
          }}
        />
        {/* Noon glint */}
        <m.div
          className="absolute inset-0"
          style={{
            opacity: glintOpacity,
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.55) 0%, transparent 45%)",
          }}
        />
        {/* Night face */}
        <m.div
          className="absolute inset-0 bg-[#141a33]"
          style={{ opacity: nightOpacity }}
        />
      </m.div>
    </div>
  );
}

// CTA link with a magnetic pull toward the cursor. Visual styles live on an
// inner m.span so day↔night colors can be driven by MotionValues.
function MagneticLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className: string;
  style?: CSSProperties | Record<string, MotionValue<string> | string>;
  children: ReactNode;
}) {
  const magnetic = useMagnetic();
  return (
    <m.span className="inline-block" {...magnetic} whileHover={{ scale: 1.05 }}>
      <Link href={href} className="inline-block">
        <m.span className={`block ${className}`} style={style}>
          {children}
        </m.span>
      </Link>
    </m.span>
  );
}

// Word-by-word staggered rise. Under reduced motion the words render plainly.
function Words({
  words,
  reduce,
  startDelay,
}: {
  words: readonly string[];
  reduce: boolean;
  startDelay: number;
}) {
  if (reduce) return <>{words.join(" ")}</>;
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <m.span
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: startDelay + i * 0.05,
              }}
              className="inline-block"
            >
              {w}
            </m.span>
          </span>
          {/* Space must live BETWEEN the inline-blocks — a trailing space inside
              an inline-block gets trimmed and the words jam together. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
