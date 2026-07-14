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
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodini Studio | Coming Soon",
    description: "Something amazing is coming soon from Hoodini Studio.",
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
