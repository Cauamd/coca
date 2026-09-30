"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "./calendar";

interface DatePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function DatePicker({ value, onValueChange, ariaLabel }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseDate(value);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="date-picker" ref={rootRef}>
      <button
        type="button"
        className="date-picker-trigger"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected ? format(selected, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}</span>
        <CalendarIcon />
      </button>
      {open && (
        <div className="date-picker-popover" role="dialog" aria-label={`${ariaLabel}: calendário`}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onValueChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
          />
          <button
            type="button"
            className="date-picker-clear"
            onClick={() => { onValueChange(""); setOpen(false); }}
          >
            Limpar data
          </button>
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="date-picker-icon" viewBox="0 0 20 20" fill="none">
      <rect x="2.75" y="4.5" width="14.5" height="12.25" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 2.75v3.5M13.5 2.75v3.5M3 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
