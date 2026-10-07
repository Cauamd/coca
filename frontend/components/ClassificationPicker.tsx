"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModoFalha, createModoFalha, fetchModosFalha, updateClassificacao } from "../lib/api";
import type { Apontamento } from "../lib/api";

interface Props {
  apontamentoId: number;
  currentModoFalha: string | null;
  origemClassificacao: "historico_exato" | "palavra_chave" | "ia" | "manual" | null;
  explicacaoIA: Apontamento["explicacao_classificacao_ia"];
  onClassified: (novoModo: string | null) => void;
}

export default function ClassificationPicker({
  apontamentoId,
  currentModoFalha,
  origemClassificacao,
  explicacaoIA,
  onClassified,
}: Props) {
  const [open, setOpen] = useState(false);
  const [modos, setModos] = useState<ModoFalha[]>([]);
  const [loadingModos, setLoadingModos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newModoName, setNewModoName] = useState("");
  const [savingNewModo, setSavingNewModo] = useState(false);
  const [newModoError, setNewModoError] = useState<string | null>(null);
  const [newModoMessage, setNewModoMessage] = useState<string | null>(null);
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

  useEffect(() => {
    function handleModoCreated(event: Event) {
      const modo = (event as CustomEvent<ModoFalha>).detail;
      if (!modo) return;
      setModos((prev) => prev.some((item) => item.id === modo.id)
        ? prev
        : [...prev, modo].sort((a, b) => a.nome_padrao.localeCompare(b.nome_padrao, "pt-BR")));
    }
    window.addEventListener("modo-falha-criado", handleModoCreated);
    return () => window.removeEventListener("modo-falha-criado", handleModoCreated);
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

  async function handleCreateModo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nome = newModoName.trim();
    if (!nome) return;

    setSavingNewModo(true);
    setNewModoError(null);
    setNewModoMessage(null);
    try {
      const modo = await createModoFalha(nome);
      window.dispatchEvent(new CustomEvent("modo-falha-criado", { detail: modo }));
      setNewModoName("");
      setNewModoMessage("Modo salvo. Selecione-o na lista para classificar este apontamento.");
    } catch (err: any) {
      setNewModoError(err.message || "Erro ao salvar o novo modo de falha.");
    } finally {
      setSavingNewModo(false);
    }
  }

  return (
    <div className="classification-picker" ref={wrapperRef}>
      <div className="classification-current">
        {currentModoFalha ? (
          <div className="classification-labels">
            <span className="tag tag-classified">{currentModoFalha}</span>
            {origemClassificacao === "ia" && <span className="tag">Classificado pela IA</span>}
            {origemClassificacao === "ia" && explicacaoIA && (
              <details className="ai-explanation">
                <summary>Como a IA chegou a esta classificação</summary>
                <p>
                  A IA escolheu <strong>{explicacaoIA.modoSugerido}</strong> com confiança de{" "}
                  {(explicacaoIA.confianca * 100).toFixed(1)}%.
                  {` ${Math.round(explicacaoIA.concordancia * 100)}% dos exemplos próximos concordaram.`}
                </p>
                <span className="ai-reference-heading">Históricos usados como referência</span>
                <ul>
                  {explicacaoIA.referencias.map((referencia, index) => (
                    <li key={`${index}-${referencia.text}`}>
                      <span className="ai-reference-text">“{referencia.text}”</span>
                      <span className="ai-reference-meta">
                        {referencia.label} · similaridade {(referencia.similarity * 100).toFixed(1)}%
                        {referencia.votos ? " · votou nesta classificação" : " · voto divergente"}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
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
                type="button"
              >
                Remover classificação
              </button>
              <form
                className="classification-create-inline"
                onSubmit={handleCreateModo}
                onClick={(event) => event.stopPropagation()}
              >
                <label htmlFor={`novo-modo-${apontamentoId}`}>Novo modo de falha</label>
                <input
                  id={`novo-modo-${apontamentoId}`}
                  value={newModoName}
                  onChange={(event) => setNewModoName(event.target.value)}
                  maxLength={80}
                  placeholder="Escreva um modo..."
                  disabled={savingNewModo}
                />
                <button type="submit" disabled={savingNewModo || !newModoName.trim()}>
                  {savingNewModo ? "Salvando..." : "Salvar modo"}
                </button>
                {newModoError && <span className="classification-create-inline-error">{newModoError}</span>}
                {newModoMessage && <span className="classification-create-inline-success">{newModoMessage}</span>}
              </form>
              <div className="classification-divider" />
              {modos.map((modo) => (
                <button
                  key={modo.id}
                  className="classification-option"
                  onClick={() => handleSelect(modo.id, modo.nome_padrao)}
                  type="button"
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
