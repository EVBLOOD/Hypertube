import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/layout/header";
import { Space_Grotesk, Manrope } from 'next/font/google';

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


// { children, params: { locale } }
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
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`
          ${manrope.variable} 
          ${spaceGrotesk.variable} 
          ${spaceGrotesk.className} 
          antialiased
        `}>
          <Header />
        {children}
        {modal}
        <div>

        </div>
      </body>
    </html>
  );
}
