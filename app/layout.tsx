import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { VercelMetrics } from "@/components/analytics/vercel-metrics";
import { AppShell } from "@/components/layout/app-shell";
import { LocaleSync } from "@/components/i18n/locale-sync";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700"],
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

// TODO: Brand assets — replace when ready
// - Favicon: replace `app/favicon.ico` (and optionally add `app/icon.png`, `app/apple-icon.png`)
// - Open Graph / Twitter image: add `app/opengraph-image.png` (1200×630) and/or
//   `app/twitter-image.png`, then wire them into `openGraph.images` / `twitter.images` below
export const metadata: Metadata = {
  metadataBase: new URL("https://hoodini.studio"),
  title: {
    default: "Hoodini Studio",
    template: "%s | Hoodini Studio",
  },
  description: "Shop the latest from Hoodini Studio.",
  applicationName: "Hoodini Studio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "sq_AL",
    url: "/",
    siteName: "Hoodini Studio",
    title: "Hoodini Studio",
    description: "Shop the latest from Hoodini Studio.",
    // images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Hoodini Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodini Studio",
    description: "Shop the latest from Hoodini Studio.",
    // images: ["/twitter-image.png"],
  },
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
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
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
