"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";


const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/upload", label: "Importar" },
  { href: "/dados", label: "Apontamentos" },
  { href: "/dashboard", label: "Pareto" },
  { href: "/dashboard/jack-knife", label: "Crítico-Crônico" },
  { href: "/alertas", label: "Alertas" },
  { href: "/classificacao", label: "Dicionário" },
];
export default function Nav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Atualiza --mx/--my do link sob o cursor, para o gradiente radial "seguir a Ã¡gua"
  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const target = (e.target as HTMLElement).closest(".nav-link") as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty("--mx", `${x}%`);
    target.style.setProperty("--my", `${y}%`);
  }

  return (
    <nav className="main-nav" ref={navRef} onPointerMove={handlePointerMove}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "nav-link active" : "nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
