import type { Metadata } from "next";
import "./globals.css";
import Nav from "../components/Nav";


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
        <header className="global-header">
          <div className="global-header-inner">
            <div className="brand">
       
              <span className="brand-title"></span>
            </div>
            <Nav />
          </div>
        </header>
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}