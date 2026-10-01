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
      <body>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
