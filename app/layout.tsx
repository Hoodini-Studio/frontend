import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppShell } from "@/components/layout/app-shell";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// TODO: Brand assets — replace when ready
// - Favicon: replace `app/favicon.ico` (and optionally add `app/icon.png`, `app/apple-icon.png`)
// - Open Graph / Twitter image: add `app/opengraph-image.png` (1200×630) and/or
//   `app/twitter-image.png`, then wire them into `openGraph.images` / `twitter.images` below
export const metadata: Metadata = {
  metadataBase: new URL("https://hoodini.studio"),
  title: {
    default: "Hoodini Studio | Coming Soon",
    template: "%s | Hoodini Studio",
  },
  description: "Something amazing is coming soon from Hoodini Studio.",
  applicationName: "Hoodini Studio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Hoodini Studio",
    title: "Hoodini Studio | Coming Soon",
    description: "Something amazing is coming soon from Hoodini Studio.",
    // images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Hoodini Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodini Studio | Coming Soon",
    description: "Something amazing is coming soon from Hoodini Studio.",
    // images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
