import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { LocaleProvider } from "@/components/locale-provider";
import { getRequestMessages } from "@/lib/i18n-server";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wedding Planner",
  description: "Luxury wedding planning workspace for couples and planners.",
  openGraph: {
    title: "Wedding Planner",
    description: "Luxury wedding planning workspace for couples and planners.",
    type: "website",
    locale: "pl_PL",
  },
  alternates: {
    languages: {
      "pl-PL": "/",
      "en-US": "/?locale=en",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getRequestMessages();

  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
