"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchEquipamentosDisponiveis, fetchEvolucao,
  EquipamentoResumo, EvolucaoResponse, SerieEvolucao,
} from "../../lib/api";
import EvolutionChart from "../../components/charts/EvolutionChart";
import MorphSelect from "../../components/ui/select-morph";

const TENDENCIA_CONFIG: Record<string, { label: string; color: string; icone: string }> = {
  piorando: { label: "Piorando", color: "#FF3B3B", icone: "▲" },
  piorando_recente: { label: "Piorando (recente)", color: "#F0A030", icone: "▲" },
  melhorando: { label: "Melhorando", color: "#34C77B", icone: "▼" },
  melhorando_recente: { label: "Melhorando (recente)", color: "#34C77B", icone: "▼" },
  estavel: { label: "Estável", color: "#9898A0", icone: "—" },
  dados_insuficientes: { label: "Dados insuficientes", color: "#67676F", icone: "?" },
};

function PrevisaoCard({ titulo, previsao, unidade }: { titulo: string; previsao: any; unidade: string }) {
  if (!previsao.previsaoDisponivel) {
    return (
      <div className="previsao-card">
        <p className="previsao-card-titulo">{titulo}</p>
        <p className="previsao-card-indisponivel">Histórico insuficiente para gerar previsão.</p>
      </div>
    );
  }

  const config = TENDENCIA_CONFIG[previsao.tendencia] || TENDENCIA_CONFIG.estavel;

  return (
    <div className="previsao-card">
      <p className="previsao-card-titulo">{titulo}</p>
      <div className="previsao-card-tendencia" style={{ color: config.color }}>
        <span style={{ fontSize: 20 }}>{config.icone}</span>
        <span>{config.label}</span>
      </div>
      <div className="previsao-card-valores">
        <div>
          <span>Atual</span>
          <strong>{previsao.valorAtual} {unidade}</strong>
        </div>
        <div>
          <span>Projeção próximo período</span>
          <strong style={{ color: config.color }}>
            {previsao.valorPrevistoProximoPeriodo} {unidade}
            {" "}({previsao.variacaoPercentual > 0 ? "+" : ""}{previsao.variacaoPercentual}%)
          </strong>
        </div>
      </div>
      <div className="previsao-card-confianca">
        Confiança: {Math.round(previsao.confianca * 100)}% · R²: {previsao.r2}
      </div>
    </div>
  );
}

export default function ComparacaoPage() {
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<EquipamentoResumo[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [meses, setMeses] = useState(12);
  const [metrica, setMetrica] = useState<"tempo_total" | "qtd_falhas" | "mttr">("tempo_total");

  const [evolucao, setEvolucao] = useState<EvolucaoResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingEvolucao, setLoadingEvolucao] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipamentosDisponiveis()
      .then(setEquipamentosDisponiveis)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingList(false));
  }, []);

  const loadEvolucao = useCallback(async () => {
    if (selecionados.length === 0) {
      setEvolucao(null);
      return;
    }
    setLoadingEvolucao(true);
    setError(null);
    try {
      const data = await fetchEvolucao(selecionados, meses);
      setEvolucao(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEvolucao(false);
    }
  }, [selecionados, meses]);

  useEffect(() => {
    loadEvolucao();
  }, [loadEvolucao]);

  function toggleEquipamento(equipamento: string) {
    setSelecionados((prev) => {
      if (prev.includes(equipamento)) return prev.filter((e) => e !== equipamento);
      if (prev.length >= 3) return prev; // máximo 3 ao mesmo tempo, pra não poluir o gráfico
      return [...prev, equipamento];
    });
  }

  return (
    <main className="panel-main data-main">
      <div className="page-subtitle">Comparação &amp; Evolução por Equipamento</div>

      <div className="data-container">
        <div className="comparacao-layout">
          {/* --- Seletor de equipamentos --- */}
          <div className="chart-card comparacao-selector">
            <p className="card-eyebrow">Selecione até 3 equipamentos</p>
            {loadingList ? (
              <div className="chart-empty">Carregando...</div>
            ) : (
              <div className="equipamento-checklist">
                {equipamentosDisponiveis.map((eq) => {
                  const isSelected = selecionados.includes(eq.equipamento);
                  return (
                    <button
                      key={`${eq.linha}-${eq.equipamento}`}
                      className={isSelected ? "equipamento-chip active" : "equipamento-chip"}
                      onClick={() => toggleEquipamento(eq.equipamento)}
                    >
                      <span>{eq.equipamento}</span>
                      <span className="equipamento-chip-sub">{eq.linha} · {eq.tempo_total.toFixed(0)} min</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* --- Área principal --- */}
          <div className="comparacao-main">
            <div className="filter-bar">
              <div className="filter-field">
                <label>Métrica</label>
                <MorphSelect ariaLabel="M\u00e9trica" value={metrica} onValueChange={(value) => setMetrica(value as typeof metrica)} options={[{ value: "tempo_total", label: "Tempo parado (min)" }, { value: "qtd_falhas", label: "N\u00ba de falhas" }, { value: "mttr", label: "MTTR (min)" }]} />
              </div>
              <div className="filter-field">
                <label>Período</label>
                <MorphSelect ariaLabel="Per\u00edodo" value={String(meses)} onValueChange={(value) => setMeses(Number(value))} options={[{ value: "6", label: "\u00daltimos 6 meses" }, { value: "12", label: "\u00daltimos 12 meses" }, { value: "24", label: "\u00daltimos 24 meses" }]} />
              </div>
            </div>

            {error && <div className="status-message error">{error}</div>}

            {selecionados.length === 0 ? (
              <div className="empty-hint">Selecione ao menos um equipamento para ver a evolução.</div>
            ) : (
              <>
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <p className="card-eyebrow">Linha do tempo</p>
                      <h2>Evolução mensal</h2>
                    </div>
                  </div>
                  {loadingEvolucao ? (
                    <div className="chart-empty">Calculando...</div>
                  ) : (
                    <EvolutionChart series={evolucao?.series || []} metrica={metrica} />
                  )}
                </div>

                {/* --- Cards de previsão, um conjunto por equipamento selecionado --- */}
                {evolucao?.series.map((s) => (
                  <div key={s.equipamento} className="chart-card" style={{ marginTop: 16 }}>
                    <p className="card-eyebrow">Previsão — {s.equipamento}</p>
                    <div className="previsao-grid">
                      <PrevisaoCard titulo="Tempo parado" previsao={s.previsao.tempoParado} unidade="min" />
                      <PrevisaoCard titulo="Número de falhas" previsao={s.previsao.qtdFalhas} unidade="falhas" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
