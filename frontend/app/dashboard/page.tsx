"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPareto, fetchFiltros, ParetoResponse, Filtros } from "../../lib/api";
import ParetoChart from "../../components/charts/ParetoChart";

export default function DashboardPareto() {
  const [filtros, setFiltros] = useState<Filtros>({ centros: [], linhas: [], tipos_parada: [] });
  const [data, setData] = useState<ParetoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState({
    centro: "",
    linha: "",
    data_inicio: "",
    data_fim: "",
  });

  useEffect(() => {
    fetchFiltros().then(setFiltros).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPareto(params);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar Pareto");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateFilter(key: keyof typeof params, value: string) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  return (
  <main className="panel-main">
    <div className="page-subtitle">Pareto de falhas por modo padronizado</div>
      <main className="panel-main data-main">
        <div className="data-container">
          <div className="filter-bar">
            <div className="filter-field">
              <label>Centro</label>
              <select value={params.centro} onChange={(e) => updateFilter("centro", e.target.value)}>
                <option value="">Todos</option>
                {filtros.centros.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Linha</label>
              <select value={params.linha} onChange={(e) => updateFilter("linha", e.target.value)}>
                <option value="">Todas</option>
                {filtros.linhas.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>De</label>
              <input
                type="date"
                value={params.data_inicio}
                onChange={(e) => updateFilter("data_inicio", e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>Até</label>
              <input
                type="date"
                value={params.data_fim}
                onChange={(e) => updateFilter("data_fim", e.target.value)}
              />
            </div>
          </div>

          {error && <div className="status-message error">{error}</div>}

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <p className="card-eyebrow">Pareto (regra 80/20)</p>
                <h2>Tempo de parada por modo de falha</h2>
              </div>
              {data && (
                <div className="chart-summary">
                  <div className="chart-summary-item">
                    <span>Total parado</span>
                    <strong>{data.total_tempo_parada.toFixed(0)} min</strong>
                  </div>
                  <div className="chart-summary-item">
                    <span>Não classificados</span>
                    <strong className="warn">
                      {data.nao_classificados.qtd_falhas} ({data.nao_classificados.tempo_total.toFixed(0)} min)
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="chart-empty">Carregando...</div>
            ) : (
              <ParetoChart data={data?.pareto || []} />
            )}
          </div>

          {data && data.nao_classificados.qtd_falhas > 0 && (
            <div className="status-message error" style={{ marginTop: 16 }}>
              Existem {data.nao_classificados.qtd_falhas} apontamentos ({data.nao_classificados.tempo_total.toFixed(0)} min)
              sem modo de falha classificado — eles não entram neste Pareto. Adicione palavras-chave ao
              dicionário para incluí-los na análise.
            </div>
          )}
        </div>
      </main>
    </main>
  );
}