"use client";

// Mobile nav island: a three-line hamburger in the header that opens a full-screen
// overlay on warm paper — oversized amber index numerals, big Archivo labels, an
// animated amber scan-line, faint grid + glow for depth. Links reveal with a staggered
// clip-rise; the active route is amber. Closes on link tap, X, Escape, or route change.
// Reduced-motion → instant. The overlay is PORTALED to <body> so it escapes the sticky
// header's stacking context (otherwise page content paints over it). Shown below md only.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { List, X, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const SECTIONS = [
  { href: "/problem", label: "Problem", hint: "The failure wave" },
  { href: "/solution", label: "Solution", hint: "Predict, then plan" },
  { href: "/demo", label: "Demo", hint: "Watch the recovery run" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal target is only available client-side.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <List size={20} weight="bold" />
      </button>

      {open && mounted
        ? createPortal(
        <div
          className="mobile-nav-overlay fixed inset-0 z-[3000] flex flex-col text-ink"
          role="dialog"
          aria-modal="true"
        >
          {/* Top bar — brand echo + close. */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-white.png" alt="SolarCycle AI" width={32} height={32} />
              <div className="leading-none">
                <div className="font-display text-[16px] font-extrabold tracking-tight text-ink">
                  SolarCycle<span className="text-solar"> AI</span>
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                  Predict · Plan · Recover
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel text-ink transition-colors hover:bg-solar hover:text-ink"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {/* Links — oversized numerals + label, staggered clip-rise, amber when active. */}
          <nav className="flex flex-1 flex-col justify-center px-5">
            {SECTIONS.map((s, i) => {
              const active = pathname === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${0.08 + i * 0.09}s` }}
                  className="mobile-nav-row group relative flex items-center gap-5 border-t border-line py-6 last:border-b"
                >
                  {/* amber wipe behind on hover/active */}
                  <span
                    className={`pointer-events-none absolute inset-y-0 left-0 origin-left bg-solar/10 transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    } w-full`}
                  />
                  <span
                    className={`relative font-display text-2xl font-extrabold tabular-nums transition-colors ${
                      active ? "text-solar" : "text-muted"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span className="relative flex-1">
                    <span
                      className={`block font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-tight transition-colors ${
                        active ? "text-solar" : "text-ink group-hover:text-solar"
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      {s.hint}
                    </span>
                  </span>
                  <ArrowRight
                    size={22}
                    weight="bold"
                    className={`relative shrink-0 transition-all duration-300 ${
                      active
                        ? "translate-x-0 text-solar opacity-100"
                        : "-translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Footer copy — pinned, with an animated amber scan-line above it. */}
          <div className="px-5 pb-7 pt-4">
            <div className="mobile-nav-scan mb-4 h-px w-full bg-gradient-to-r from-transparent via-solar to-transparent" />
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              SolarCycle AI · Hackathon MVP · deterministic demo data
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}
