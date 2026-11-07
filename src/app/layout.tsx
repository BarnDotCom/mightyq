import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo_Narrow, Courier_Prime, Oswald, Rokkitt, Source_Serif_4, Ultra } from "next/font/google";
import "./globals.css";

// The design system's free stand-ins, self-hosted by next/font (no requests to Google at runtime).
const ultra = Ultra({ weight: "400", subsets: ["latin"], variable: "--font-ultra", display: "swap" });
const rokkitt = Rokkitt({ weight: ["700", "800"], subsets: ["latin"], variable: "--font-rokkitt", display: "swap" });
const oswald = Oswald({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const archivoNarrow = Archivo_Narrow({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});
const courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-courier-prime", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mightyq.film"),
};

export const viewport: Viewport = {
  themeColor: "#1f1b17",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-CA"
      className={`${ultra.variable} ${rokkitt.variable} ${oswald.variable} ${archivoNarrow.variable} ${sourceSerif.variable} ${courierPrime.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
