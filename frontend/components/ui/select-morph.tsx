"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

export interface MorphSelectOption {
  value: string;
  label: string;
}

interface MorphSelectProps {
  value: string;
  options: MorphSelectOption[];
  onValueChange: (value: string) => void;
  id?: string;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function MorphSelect({
  value,
  options,
  onValueChange,
  id: triggerId,
  className = "",
  ariaLabel,
  placeholder = "Selecione",
  disabled = false,
}: MorphSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const reduceMotion = useReducedMotion();
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

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
    <div ref={rootRef} className={`morph-select ${className}`}>
      <div aria-hidden="true" className="morph-select-sizer">
        <span>{placeholder}</span><Chevron />
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {!open ? (
          <motion.button
            key="trigger"
            layoutId={`${selectId}-surface`}
            type="button"
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={false}
            id={triggerId}
            aria-controls={`${selectId}-list`}
            disabled={disabled}
            onClick={() => setOpen(true)}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.22 }}
            className="morph-select-trigger"
          >
            <span className="morph-select-label">{selectedLabel || placeholder}</span><Chevron />
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            layoutId={`${selectId}-surface`}
            id={`${selectId}-list`}
            role="listbox"
            aria-label={ariaLabel}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.22 }}
            className="morph-select-panel"
          >
            <button type="button" className="morph-select-heading" onClick={() => setOpen(false)}>
              <span className="morph-select-label">{selectedLabel || placeholder}</span><Chevron open />
            </button>
            <div className="morph-select-divider" />
            <motion.ul initial="hidden" animate="show" className="morph-select-options">
              {options.map((option, index) => (
                <motion.li
                  key={`${option.value}-${index}`}
                  variants={{ hidden: { opacity: 0, y: -6 }, show: { opacity: 1, y: 0 } }}
                  transition={reduceMotion ? { duration: 0 } : { delay: index * 0.035 }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => { onValueChange(option.value); setOpen(false); }}
                    className={`morph-select-option${value === option.value ? " selected" : ""}`}
                  >
                    <span>{option.label}</span>{value === option.value && <Check />}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chevron({ open = false }: { open?: boolean }) {
  return <svg aria-hidden="true" className={`morph-select-chevron${open ? " open" : ""}`} viewBox="0 0 16 16" fill="none"><path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Check() {
  return <svg aria-hidden="true" className="morph-select-check" viewBox="0 0 16 16" fill="none"><path d="m3 8 3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
