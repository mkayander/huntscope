import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { PwaRegister } from "~/app/_components/pwa-register";
import { LocaleProvider } from "~/lib/i18n/locale-context";
import { APP_LOCALE } from "~/lib/i18n/locale";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Huntscope",
  description:
    "Analytics dashboard for your job-search data repository on disk or GitHub",
  applicationName: "Huntscope",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Huntscope",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [{ rel: "icon", url: "/icon" }],
};

export const viewport: Viewport = {
  themeColor: "#2e026d",
  colorScheme: "dark",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={APP_LOCALE} className={`${geist.variable} dark`}>
      <head>
        {/* Dark Reader must see this literal empty meta — Metadata `other` skips empty values. */}
        <meta name="darkreader-lock" />
      </head>
      <body className={`${geist.className} antialiased`}>
        <PwaRegister />
        <LocaleProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
