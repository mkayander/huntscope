import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { PwaRegister } from "~/app/_components/pwa-register";
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
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <PwaRegister />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
