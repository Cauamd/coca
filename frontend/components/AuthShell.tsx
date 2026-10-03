"use client";

import Link from "next/link";
import { ToggleTheme } from "./ui/toggle-theme";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Nav from "./Nav";
import { fetchSession, logoutAdmin } from "../lib/api";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [centro, setCentro] = useState("");
  const [showEntryTransition, setShowEntryTransition] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setChecking(false);
      setAuthorized(false);
      return;
    }
    let active = true;
    setChecking(true);
    fetchSession().then((session) => {
      if (!active) return;
      setCentro(session.centro);
      if (sessionStorage.getItem("coca-cola-entry-transition") === "1") {
        sessionStorage.removeItem("coca-cola-entry-transition");
        setShowEntryTransition(true);
        window.setTimeout(() => setShowEntryTransition(false), 3000);
      }
      setAuthorized(true);
      setChecking(false);
    }).catch(() => {
      if (!active) return;
      setAuthorized(false);
      setChecking(false);
      router.replace("/login");
    });
    return () => { active = false; };
  }, [pathname, router]);

  if (pathname === "/login") return <>{children}</>;
  if (checking || !authorized) return <main aria-label="Verificando acesso" />;

  async function handleLogout() {
    await logoutAdmin();
    setAuthorized(false);
    router.replace("/login");
  }

  return (
    <>
      <div className={showEntryTransition ? "entry-page entry-page-moving" : "entry-page"}>
      <header className="global-header">
        <div className="global-header-inner">
          <Link href="/" className="brand" aria-label="Página inicial"><img src="https://coca-cola-femsa.com.br/wp-content/uploads/2023/01/logo-femsa.png" alt="Coca-Cola FEMSA" className="brand-logo" /></Link>
          <Nav />
          <div className="flex items-center gap-3 px-2 text-sm">
            <span className="whitespace-nowrap">Centro: <strong>{centro}</strong></span>
            <ToggleTheme />
            <button className="btn-secondary" onClick={() => void handleLogout()}>Sair</button>
          </div>
        </div>
      </header>
      <div className="app-content">{children}</div>
      </div>
      {showEntryTransition && (
        <div className="entry-transition" role="status" aria-label="Bem-vindo">
          <img src="https://coca-cola-femsa.com.br/wp-content/uploads/2023/01/logo-femsa.png" alt="Coca-Cola FEMSA" />
        </div>
      )}
      <style jsx>{`
        .entry-page-moving { animation: page-push-in 3000ms cubic-bezier(.35,.05,.25,1) both; will-change: transform; }
        .entry-transition { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; background: radial-gradient(circle at center, #f40009 0%, #c90008 56%, #8f0005 100%); animation: entry-wipe 3000ms cubic-bezier(.35,.05,.25,1) both; pointer-events: none; will-change: transform, opacity; }
        .entry-transition img { width: min(250px, 64vw); height: 82px; object-fit: contain; filter: drop-shadow(0 10px 26px rgba(50,0,0,.28)); animation: entry-logo 3000ms cubic-bezier(.35,.05,.25,1) both; }
        @keyframes entry-wipe { 0% { opacity: 1; transform: translateX(-100%); } 24% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(100%); } }
        @keyframes page-push-in { 0%, 24% { transform: translateX(0); } 70% { transform: translateX(-14px); } 100% { transform: translateX(0); } }
        @keyframes entry-logo { 0% { opacity: 0; transform: translateX(-48px) scale(.9); } 24% { opacity: 1; transform: translateX(0) scale(1); } 72% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: 0; transform: translateX(48px) scale(.98); } }
        @media (prefers-reduced-motion: reduce) { .entry-transition, .entry-transition img { animation-duration: 1ms; } }
      `}</style>
    </>
  );
}
