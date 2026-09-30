"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAlertas, fetchPlano, savePlano,
  Alerta, PlanoAcao, Sugestao, Ishikawa, CincoW2HItem,
} from "../../lib/api";

const EMPTY_ISHIKAWA: Ishikawa = {
  metodo: "", maquina: "", mao_de_obra: "", material: "", meio_ambiente: "", medida: "",
};

const EMPTY_5W2H: CincoW2HItem = {
  what: "", why: "", where: "", when: "", who: "", how: "", how_much: "",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  sem_plano: { label: "Sem plano", color: "#67676F" },
  aberto: { label: "Aberto", color: "#F0A030" },
  em_andamento: { label: "Em andamento", color: "#4C9A6A" },
  concluido: { label: "Concluído", color: "#34C77B" },
};

export default function AlertasPage() {
  const [limiteMinutos, setLimiteMinutos] = useState(400);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Alerta | null>(null);
  const [sugestao, setSugestao] = useState<Sugestao | null>(null);
  const [loadingPlano, setLoadingPlano] = useState(false);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<PlanoAcao["status"]>("aberto");
  const [descricao, setDescricao] = useState("");
  const [ishikawa, setIshikawa] = useState<Ishikawa>(EMPTY_ISHIKAWA);
  const [brainstorming, setBrainstorming] = useState<string[]>([""]);
  const [cincoPorques, setCincoPorques] = useState<string[]>(["", "", "", "", ""]);
  const [cincoW2H, setCincoW2H] = useState<CincoW2HItem[]>([{ ...EMPTY_5W2H }]);

  const loadAlertas = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetchAlertas();
      setLimiteMinutos(res.limite_minutos);
      setAlertas(res.alertas);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar alertas");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas]);

  async function handleSelect(alerta: Alerta) {
    setSelected(alerta);
    setLoadingPlano(true);
    try {
      const res = await fetchPlano(alerta.linha, alerta.equipamento);
      setSugestao(res.sugestao);

      if (res.plano) {
        setStatus(res.plano.status);
        setDescricao(res.plano.descricao_problema || "");
        setIshikawa(res.plano.ishikawa || EMPTY_ISHIKAWA);
        setBrainstorming(res.plano.brainstorming?.length ? res.plano.brainstorming : [""]);
        setCincoPorques(res.plano.cinco_porques?.length ? res.plano.cinco_porques : ["", "", "", "", ""]);
        setCincoW2H(res.plano.cinco_w2h?.length ? res.plano.cinco_w2h : [{ ...EMPTY_5W2H }]);
      } else {
        setStatus("aberto");
        setDescricao("");
        setIshikawa(EMPTY_ISHIKAWA);
        setBrainstorming([""]);
        setCincoPorques(["", "", "", "", ""]);
        setCincoW2H([{ ...EMPTY_5W2H }]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar plano");
    } finally {
      setLoadingPlano(false);
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await savePlano(selected.linha, selected.equipamento, {
        status,
        descricao_problema: descricao,
        ishikawa,
        brainstorming: brainstorming.filter((b) => b.trim() !== ""),
        cinco_porques: cincoPorques,
        cinco_w2h: cincoW2H,
      });
      await loadAlertas(); // atualiza o status na lista
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function updateW2HRow(index: number, key: keyof CincoW2HItem, value: string) {
    setCincoW2H((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  return (
    <main className="panel-main data-main">
      <div className="page-subtitle">Alertas &amp; Plano de Ação (MASP)</div>

      <div className="data-container alertas-layout">
        {/* --- Coluna esquerda: lista de alertas --- */}
        <div className="alertas-list-col">
          <div className="chart-card">
            <p className="card-eyebrow">Equipamentos críticos</p>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>
              ≥ {limiteMinutos} min de parada
            </h2>
            <p className="description" style={{ marginBottom: 16 }}>
              Ordenado do maior para o menor tempo parado. Selecione um equipamento para abrir o plano de ação.
            </p>

            {error && <div className="status-message error">{error}</div>}

            {loadingList ? (
              <div className="chart-empty">Carregando alertas...</div>
            ) : alertas.length === 0 ? (
              <div className="empty-hint">Nenhum equipamento ultrapassou {limiteMinutos} min de parada.</div>
            ) : (
              <div className="alertas-list">
                {alertas.map((a) => {
                  const statusInfo = STATUS_LABELS[a.plano_status];
                  const isSelected = selected?.linha === a.linha && selected?.equipamento === a.equipamento;
                  return (
                    <button
                      key={`${a.linha}-${a.equipamento}`}
                      className={isSelected ? "alerta-item active" : "alerta-item"}
                      onClick={() => handleSelect(a)}
                    >
                      <div className="alerta-item-top">
                        <span className="alerta-item-equip">{a.equipamento}</span>
                        <span
                          className="tag"
                          style={{ borderColor: statusInfo.color, color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="alerta-item-meta">
                        <span>{a.linha}</span>
                        <span>{a.qtd_falhas} falhas</span>
                        <strong style={{ color: "var(--accent-red-bright)" }}>
                          {a.tempo_total.toFixed(0)} min
                        </strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- Coluna direita: formulário MASP --- */}
        <div className="alertas-detail-col">
          {!selected ? (
            <div className="empty-hint" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              Selecione um equipamento na lista ao lado para montar o plano de ação.
            </div>
          ) : loadingPlano ? (
            <div className="chart-empty">Carregando plano...</div>
          ) : (
            <div className="masp-form">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <p className="card-eyebrow">Plano de ação — MASP</p>
                    <h2>{selected.equipamento}</h2>
                    <p className="description" style={{ margin: "4px 0 0" }}>
                      {selected.linha} · {selected.qtd_falhas} falhas · {selected.tempo_total.toFixed(0)} min parados
                    </p>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlanoAcao["status"])}
                    style={{ height: "fit-content" }}
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                {/* --- Sugestão automática --- */}
                {sugestao && sugestao.modos_falha_predominantes.length > 0 && (
                  <div className="masp-suggestion">
                    <p className="masp-suggestion-title">Sugestão com base no histórico</p>
                    <p className="masp-suggestion-text">
                      Modos de falha predominantes neste equipamento:{" "}
                      {sugestao.modos_falha_predominantes.map((m, i) => (
                        <span key={m.nome}>
                          <strong>{m.nome}</strong> ({m.ocorrencias}x, {m.tempo_total.toFixed(0)} min)
                          {i < sugestao.modos_falha_predominantes.length - 1 ? ", " : "."}
                        </span>
                      ))}
                      {" "}Recomenda-se iniciar a análise de causa raiz por essas falhas.
                    </p>
                  </div>
                )}
              </div>

              {/* --- 1. Descrição do problema --- */}
              <div className="chart-card">
                <p className="card-eyebrow">1. Descrição do problema</p>
                <textarea
                  className="masp-textarea"
                  rows={3}
                  placeholder="Descreva o problema observado, seu impacto e frequência..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              {/* --- 2. Ishikawa (6M) --- */}
              <div className="chart-card">
                <p className="card-eyebrow">2. Diagrama de Ishikawa (6M)</p>
                <div className="ishikawa-grid">
                  {(Object.keys(EMPTY_ISHIKAWA) as (keyof Ishikawa)[]).map((key) => (
                    <div key={key} className="ishikawa-field">
                      <label>{
                        { metodo: "Método", maquina: "Máquina", mao_de_obra: "Mão de obra",
                          material: "Material", meio_ambiente: "Meio ambiente", medida: "Medida" }[key]
                      }</label>
                      <textarea
                        rows={2}
                        value={ishikawa[key]}
                        onChange={(e) => setIshikawa((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* --- 3. Brainstorming --- */}
              <div className="chart-card">
                <p className="card-eyebrow">3. Brainstorming</p>
                {brainstorming.map((idea, i) => (
                  <div key={i} className="dynamic-row">
                    <input
                      type="text"
                      placeholder={`Ideia ${i + 1}`}
                      value={idea}
                      onChange={(e) =>
                        setBrainstorming((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                    />
                    <button
                      className="btn-remove-row"
                      onClick={() => setBrainstorming((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={brainstorming.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button className="btn-secondary" onClick={() => setBrainstorming((prev) => [...prev, ""])}>
                  + Adicionar ideia
                </button>
              </div>

              {/* --- 4. 5 Porquês --- */}
              <div className="chart-card">
                <p className="card-eyebrow">4. Cinco Porquês</p>
                {cincoPorques.map((p, i) => (
                  <div key={i} className="dynamic-row">
                    <span className="porque-index">{i + 1}º</span>
                    <input
                      type="text"
                      placeholder="Por quê?"
                      value={p}
                      onChange={(e) =>
                        setCincoPorques((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                      }
                    />
                  </div>
                ))}
              </div>

              {/* --- 5. 5W2H --- */}
              <div className="chart-card">
                <p className="card-eyebrow">5. Plano de Ação (5W2H)</p>
                <div className="table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="data-table masp-w2h-table">
                    <thead>
                      <tr>
                        <th>O quê</th><th>Por quê</th><th>Onde</th><th>Quando</th>
                        <th>Quem</th><th>Como</th><th>Quanto custa</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cincoW2H.map((row, i) => (
                        <tr key={i}>
                          {(Object.keys(EMPTY_5W2H) as (keyof CincoW2HItem)[]).map((key) => (
                            <td key={key}>
                              <input
                                type="text"
                                value={row[key]}
                                onChange={(e) => updateW2HRow(i, key, e.target.value)}
                              />
                            </td>
                          ))}
                          <td>
                            <button
                              className="btn-remove-row"
                              onClick={() => setCincoW2H((prev) => prev.filter((_, idx) => idx !== i))}
                              disabled={cincoW2H.length === 1}
                            >
                                ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="btn-secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => setCincoW2H((prev) => [...prev, { ...EMPTY_5W2H }])}
                >
                  + Adicionar ação
                </button>
              </div>

              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar plano de ação"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}