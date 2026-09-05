import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Huntscope",
  description:
    "Analytics dashboard for your private job-search repository on GitHub",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        {/* Dark Reader must see this literal empty meta — Metadata `other` skips empty values. */}
        <meta name="darkreader-lock" />
      </head>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
