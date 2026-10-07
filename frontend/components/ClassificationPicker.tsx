"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModoFalha, fetchModosFalha, updateClassificacao } from "../lib/api";

interface Props {
  apontamentoId: number;
  currentModoFalha: string | null;
  origemClassificacao: "historico_exato" | "palavra_chave" | "ia" | "manual" | null;
  onClassified: (novoModo: string | null) => void;
}

export default function ClassificationPicker({
  apontamentoId,
  currentModoFalha,
  origemClassificacao,
  onClassified,
}: Props) {
  const [open, setOpen] = useState(false);
  const [modos, setModos] = useState<ModoFalha[]>([]);
  const [loadingModos, setLoadingModos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function openPicker() {
    const button = wrapperRef.current?.querySelector(".btn-classify");
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 340)),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
      });
    }
    setOpen(true);
    setError(null);
    if (modos.length === 0) {
      setLoadingModos(true);
      try {
        const data = await fetchModosFalha();
        setModos(data);
      } catch {
        setError("Erro ao carregar modos de falha.");
      } finally {
        setLoadingModos(false);
      }
    }
  }

  async function handleSelect(modoFalhaId: number | null, nomePadrao: string | null) {
    setSaving(true);
    setError(null);
    try {
      await updateClassificacao(apontamentoId, modoFalhaId);
      onClassified(nomePadrao);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar classificação");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="classification-picker" ref={wrapperRef}>
      <div className="classification-current">
        {currentModoFalha ? (
          <div className="classification-labels">
            <span className="tag tag-classified">{currentModoFalha}</span>
            {origemClassificacao === "ia" && <span className="tag">Classificado pela IA</span>}
          </div>
        ) : (
          <span className="tag tag-unclassified">Não classificado</span>
        )}
        <button className="btn-classify" onClick={openPicker} disabled={saving}>
          {saving ? "Salvando..." : "Classificar"}
        </button>
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="classification-dropdown"
          ref={dropdownRef}
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          onWheel={(event) => {
            event.preventDefault();
            event.currentTarget.scrollTop += event.deltaY;
          }}
        >
          {loadingModos ? (
            <div className="classification-dropdown-state">Carregando...</div>
          ) : error ? (
            <div className="classification-dropdown-state error">{error}</div>
          ) : (
            <>
              <button
                className="classification-option classification-option-clear"
                onClick={() => handleSelect(null, null)}
              >
                Remover classificação
              </button>
              <div className="classification-divider" />
              {modos.map((modo) => (
                <button
                  key={modo.id}
                  className="classification-option"
                  onClick={() => handleSelect(modo.id, modo.nome_padrao)}
                >
                  <span>{modo.nome_padrao}</span>
                  {modo.categoria && <span className="classification-category">{modo.categoria}</span>}
                </button>
              ))}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
