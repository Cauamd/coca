"use client";

import React from "react";
import { MonitorCogIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { icon: MonitorCogIcon, value: "system" },
  { icon: SunIcon, value: "light" },
  { icon: MoonStarIcon, value: "dark" },
] as const;

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return <div className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="theme-toggle-group"
      role="radiogroup"
      aria-label="Tema de aparência"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn("theme-toggle-option", selected && "selected")}
            role="radio"
            aria-checked={selected}
            aria-label={`Usar tema ${option.value === "system" ? "do sistema" : option.value === "light" ? "claro" : "escuro"}`}
            title={option.value === "system" ? "Tema do sistema" : `Tema ${option.value === "light" ? "claro" : "escuro"}`}
            onClick={() => setTheme(option.value)}
          >
            {selected && (
              <motion.span
                layoutId="theme-option"
                transition={{ type: "spring", bounce: 0.1, duration: 0.75 }}
                className="theme-toggle-indicator"
                aria-hidden="true"
              />
            )}
            <Icon className="theme-toggle-icon" aria-hidden="true" />
          </button>
        );
      })}
    </motion.div>
  );
}