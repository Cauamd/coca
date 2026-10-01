"use client";

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
      <header className="global-header">
        <div className="global-header-inner">
          <div className="brand"><span className="brand-title"></span></div>
          <Nav />
          <div className="flex items-center gap-3 px-2 text-sm">
            <span className="whitespace-nowrap">Centro: <strong>{centro}</strong></span>
            <button className="btn-secondary" onClick={() => void handleLogout()}>Sair</button>
          </div>
        </div>
      </header>
      <div className="app-content">{children}</div>
    </>
  );
}
