"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSuggestions, fetchModosFalha, addKeyword, SuggestionsResponse, ModoFalha } from "../../lib/api";

export default function ClassificacaoPage() {
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [modos, setModos] = useState<ModoFalha[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTerm, setSavingTerm] = useState<string | null>(null);
  const [selectedModo, setSelectedModo] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sug, m] = await Promise.all([fetchSuggestions(5), fetchModosFalha()]);
      setSuggestions(sug);
      setModos(m);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(termo: string) {
    const modoFalhaId = selectedModo[termo];
    if (!modoFalhaId) return;
    setSavingTerm(termo);
    try {
      await addKeyword(modoFalhaId, termo);
      await load(); // recarrega — o termo sai da lista de sugestões (já está no dicionário)
    } finally {
      setSavingTerm(null);
    }
  }

  const allSuggestions = [
    ...(suggestions?.sugestoes_expressoes || []),
    ...(suggestions?.sugestoes_palavras || []),
  ];

  return (
    <main className="panel-main data-main">
      <div className="page-subtitle">Dicionário de classificação</div>

      <div className="data-container">
        <div className="chart-card" style={{ marginBottom: 16 }}>
          <div className="chart-card-header">
            <div>
              <p className="card-eyebrow">Ajuda a padronizar</p>
              <h2>Termos frequentes ainda sem classificação</h2>
            </div>
            {suggestions && (
              <div className="chart-summary-item">
                <span>Apontamentos não classificados</span>
                <strong className="warn">{suggestions.total_nao_classificados}</strong>
              </div>
            )}
          </div>

          {loading ? (
            <div className="chart-empty">Analisando observações...</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Termo</th>
                    <th className="col-num">Ocorrências</th>
                    <th>Atribuir a</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allSuggestions.map((s) => (
                    <tr key={s.termo}>
                      <td><span className="tag">{s.termo}</span></td>
                      <td className="col-num">{s.ocorrencias}</td>
                      <td>
                        <select
                          value={selectedModo[s.termo] || ""}
                          onChange={(e) =>
                            setSelectedModo((prev) => ({ ...prev, [s.termo]: Number(e.target.value) }))
                          }
                        >
                          <option value="">Selecione um modo de falha...</option>
                          {modos.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome_padrao}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          disabled={!selectedModo[s.termo] || savingTerm === s.termo}
                          onClick={() => handleAdd(s.termo)}
                        >
                          {savingTerm === s.termo ? "Salvando..." : "Adicionar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}