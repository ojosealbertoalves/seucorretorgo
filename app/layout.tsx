import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Só Terrenos GO | Lotes e Terrenos em Goiânia",
  description: "Especialista em lotes, loteamentos e terrenos em Goiânia e região. Converse com nossa IA e encontre o terreno ideal sem pressão.",
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
