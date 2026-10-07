"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSuggestions, fetchModosFalha, addKeyword, createModoFalha, classifyPendingApontamentos, SuggestionsResponse, ModoFalha } from "../../lib/api";
import MorphSelect from "../../components/ui/select-morph";

export default function ClassificacaoPage() {
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [modos, setModos] = useState<ModoFalha[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTerm, setSavingTerm] = useState<string | null>(null);
  const [selectedModo, setSelectedModo] = useState<Record<string, number>>({});
  const [classifying, setClassifying] = useState(false);
  const [classificationMessage, setClassificationMessage] = useState<string | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [newModoName, setNewModoName] = useState("");
  const [newModoCategory, setNewModoCategory] = useState("");
  const [savingModo, setSavingModo] = useState(false);
  const [modoMessage, setModoMessage] = useState<string | null>(null);
  const [modoError, setModoError] = useState<string | null>(null);

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

  async function handleClassifyPending() {
    setClassifying(true);
    setClassificationMessage(null);
    setClassificationError(null);
    try {
      const result = await classifyPendingApontamentos();
      await load();
      setClassificationMessage(
        `${result.totalClassificado} apontamento(s) classificado(s), sendo ${result.totalClassificadoIA} pela IA.`
      );
    } catch (err: any) {
      setClassificationError(err.message || "Erro ao classificar apontamentos pendentes.");
    } finally {
      setClassifying(false);
    }
  }

  async function handleCreateModo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingModo(true);
    setModoMessage(null);
    setModoError(null);
    try {
      const modo = await createModoFalha(newModoName, newModoCategory);
      setModos((prev) => [...prev, modo].sort((a, b) => a.nome_padrao.localeCompare(b.nome_padrao, "pt-BR")));
      setNewModoName("");
      setNewModoCategory("");
      setModoMessage(`Modo “${modo.nome_padrao}” criado e disponível para classificação manual.`);
    } catch (err: any) {
      setModoError(err.message || "Erro ao criar modo de falha.");
    } finally {
      setSavingModo(false);
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
        <div className="chart-card classification-create-card">
          <div>
            <p className="card-eyebrow">Expandir classificações</p>
            <h2>Novo modo de falha</h2>
            <p className="description">
              Depois de criar o modo, classifique apontamentos manualmente com ele para que essas correções também sirvam de exemplo no retreino da IA.
            </p>
          </div>
          <form className="classification-create-form" onSubmit={handleCreateModo}>
            <label>
              Nome do modo de falha
              <input
                value={newModoName}
                onChange={(event) => setNewModoName(event.target.value)}
                maxLength={80}
                placeholder="Ex.: FALHA DE ROLAMENTO"
                required
              />
            </label>
            <label>
              Categoria (opcional)
              <input
                value={newModoCategory}
                onChange={(event) => setNewModoCategory(event.target.value)}
                maxLength={50}
                placeholder="Ex.: MECÂNICA"
              />
            </label>
            <button className="btn-primary" type="submit" disabled={savingModo || !newModoName.trim()}>
              {savingModo ? "Criando..." : "Adicionar modo"}
            </button>
          </form>
          {modoMessage && <div className="status-message">{modoMessage}</div>}
          {modoError && <div className="status-message error">{modoError}</div>}
        </div>

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
            <button className="btn-secondary" onClick={handleClassifyPending} disabled={classifying}>
              {classifying ? "Classificando..." : "Classificar pendentes com IA"}
            </button>
          </div>

          {classificationMessage && <div className="status-message">{classificationMessage}</div>}
          {classificationError && <div className="status-message error">{classificationError}</div>}

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
                        <MorphSelect
                          value={String(selectedModo[s.termo] || "")}
                          ariaLabel={`Modo de falha para ${s.termo}`}
                          onValueChange={(value) => setSelectedModo((prev) => ({ ...prev, [s.termo]: Number(value) }))}
                          options={[
                            { value: "", label: "Selecione um modo de falha..." },
                            ...modos.map((m) => ({ value: String(m.id), label: m.nome_padrao })),
                          ]}
                        />
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
