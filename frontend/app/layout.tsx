import type { Metadata } from "next";
import "./globals.css";
import AuthShell from "../components/AuthShell";
import Providers from "../components/Providers";


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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers><AuthShell>{children}</AuthShell></Providers>
      </body>
    </html>
  );
}
