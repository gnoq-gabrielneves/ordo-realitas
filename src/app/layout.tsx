import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordo Realitas",
  description: "Gerenciador de campanhas de RPG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
