import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { VercelMetrics } from "@/components/analytics/vercel-metrics";
import { AppShell } from "@/components/layout/app-shell";
import { LocaleSync } from "@/components/i18n/locale-sync";
import { getSiteUrl, shouldAllowSearchIndexing } from "@/lib/site";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "500", "700", "800"],
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: true,
});

const siteUrl = getSiteUrl();
const allowIndexing = shouldAllowSearchIndexing();

// TODO: Brand assets — replace when ready
// - Favicon: replace `app/favicon.ico` (and optionally add `app/icon.png`, `app/apple-icon.png`)
// - Open Graph / Twitter image: add `app/opengraph-image.png` (1200×630) and/or
//   `app/twitter-image.png`, then set twitter.card back to "summary_large_image"
//   and wire images into homepage (and optionally root) openGraph/twitter metadata.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hoodini Studio",
    template: "%s | Hoodini Studio",
  },
  description: "Premium dark streetwear from Hoodini Studio. Wear the night.",
  applicationName: "Hoodini Studio",
  // Page-specific openGraph.url / title live on each route (see app/page.tsx, legal, products).
  // Keeping only shared defaults here avoids every page inheriting homepage "/" OG URL/title.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Hoodini Studio",
  },
  // summary until brand OG image ships (summary_large_image without an image is incorrect).
  twitter: {
    card: "summary",
  },
  robots: allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ToastProvider>
              <LocaleSync />
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <VercelMetrics />
      </body>
    </html>
  );
}
