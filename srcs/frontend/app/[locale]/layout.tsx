import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/header";
import { Space_Grotesk, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: "HyperTube",
  description: "Author: sakllam, kidbouh",
};


export default async function RootLayout({
  children,
  modal,
  params
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;
  const messages = await getMessages()
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`
          ${manrope.variable} 
          ${spaceGrotesk.variable} 
          ${spaceGrotesk.className} 
          antialiased
        `}>
          <NextIntlClientProvider messages={messages}>
            <Header />
            {children}
            {modal}
          </NextIntlClientProvider>
      </body>
    </html>
  );
}
