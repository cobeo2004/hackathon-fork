import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { TRPCReactProvider } from "~/trpc/client";
import Image from "next/image";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "SolarCycle AI — Predict failures. Plan collections. Recover value.",
  description: "Predict · Plan · Recover — solar lifecycle & recovery",
  icons: { icon: "/sun.svg" },
};

const SECTIONS = [
  { href: "/problem", label: "Problem" },
  { href: "/solution", label: "Solution" },
  { href: "/demo", label: "Demo" },
] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <TRPCReactProvider>
          <div className="min-h-full">
            <header className="sticky top-0 z-[1000] border-b border-line bg-paper/85 backdrop-blur-md">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
                <Link href="/" className="flex items-center gap-2.5">
                  <Image src="/logo-white.png" alt="SolarCycle AI" width={32} height={32} />
                  <div className="leading-none">
                    <div className="font-display text-[17px] font-extrabold tracking-tight text-ink">
                      SolarCycle<span className="text-solar"> AI</span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Predict · Plan · Recover
                    </div>
                  </div>
                </Link>

                <nav className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
                  {SECTIONS.map((s, i) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="rounded-md px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-ink hover:text-paper"
                    >
                      <span className="mr-1.5 text-solar">{i + 1}</span>
                      {s.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-14">{children}</main>

            <footer className="mx-auto max-w-6xl px-5 pb-10 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              SolarCycle AI · Hackathon MVP · deterministic demo data
            </footer>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
