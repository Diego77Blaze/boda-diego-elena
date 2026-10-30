import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import localFont from "next/font/local";
import patron from "@/assets/patron.webp";
import { LangProvider, LangToggle } from "@/lib/i18n";
import "./globals.css";

const display = localFont({ src: "../assets/fonts/LimoncelloRecipe.woff2", variable: "--font-display", display: "swap" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Diego & Elena · 31.07.2027 · Toledo",
  description: "Nos casamos · We're getting married · Toledo, 31.07.2027",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#F7F3EA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-ES" className={`${display.variable} ${sans.variable}`} style={{ "--patron": `url(${patron.src})` } as React.CSSProperties}>
      <body className="paper min-h-svh"><LangProvider>
          <LangToggle />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
