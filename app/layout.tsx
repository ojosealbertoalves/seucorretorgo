import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seu Corretor GO",
  description: "Encontre seu imóvel novo sem pressão de corretor. Goiânia e Região.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-[var(--font-geist-sans)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
