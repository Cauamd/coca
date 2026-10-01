import type { Metadata } from "next";
import "./globals.css";
import AuthShell from "../components/AuthShell";


export const metadata: Metadata = {
  title: "Dashboard de Confiabilidade",
  description: "Apontamentos, Pareto e análise Crítico-Crônico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Lobster&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
