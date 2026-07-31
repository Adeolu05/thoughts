import type { Metadata, Viewport } from "next";
import {
  Inter,
  Instrument_Serif,
  Outfit,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import { Nav } from "@/components/nav";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { BrandFooter } from "@/components/brand-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Thoughts: Beautiful personal reflections",
    template: "%s · Thoughts",
  },
  description:
    "A personal digital journal by David Peluola. Capture reflections, export premium visual cards, and build a long-term archive for your own Wrapped.",
  metadataBase: new URL("https://thoughts.dpeluola.com"),
  openGraph: {
    title: "Thoughts by David Peluola",
    description: "Beautiful thoughts deserve beautiful presentation.",
    type: "website",
    url: "https://thoughts.dpeluola.com",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Thoughts",
  },
  authors: [{ name: "David Peluola", url: "https://dpeluola.com" }],
  creator: "David Peluola",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrument.variable} ${outfit.variable} ${playfair.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body
        data-scroll-behavior="smooth"
        className="grain flex min-h-full min-h-dvh flex-col font-[family-name:var(--font-inter)]"
      >
        <ThemeProvider>
          <Nav />
          <main className="flex flex-1 flex-col pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
            {children}
          </main>
          <BrandFooter />
          <BottomTabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
