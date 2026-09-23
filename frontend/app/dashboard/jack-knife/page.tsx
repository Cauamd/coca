"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchJackKnife, fetchFiltros, JackKnifeResponse, JackKnifePonto, Filtros } from "../../../lib/api";
import JackKnifeChart from "../../../components/charts/JackKnifeChart";

const CATEGORY_LEGEND = [
  { label: "Crítico-Crônico", color: "#F0A030", desc: "Alta frequência e alto impacto — prioridade máxima" },
  { label: "Crítico", color: "#D9534F", desc: "Baixa frequência, alto impacto — risco elevado" },
  { label: "Crônico", color: "#4C9A6A", desc: "Alta frequência, baixo impacto — foco na causa raiz" },
  { label: "Conforto", color: "#5C6577", desc: "Baixa frequência e baixo impacto" },
];

export default function DashboardJackKnife() {
  const router = useRouter();

  const [filtros, setFiltros] = useState<Filtros>({ centros: [], linhas: [], tipos_parada: [] });
  const [data, setData] = useState<JackKnifeResponse | null>(null);
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
      const res = await fetchJackKnife(params);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar Jack-Knife");
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

  // Leva para a tela de dados já filtrada pelo equipamento e linha clicados
  function goToApontamentos(ponto: JackKnifePonto) {
    const query = new URLSearchParams({
      linha: ponto.linha,
      equipamento: ponto.equipamento,
      apenas_validos: "true",
    });
    if (params.centro) query.set("centro", params.centro);
    if (params.data_inicio) query.set("data_inicio", params.data_inicio);
    if (params.data_fim) query.set("data_fim", params.data_fim);

    router.push(`/dados?${query.toString()}`);
  }

  const criticoCronico = data?.pontos.filter((p) => p.categoria === "CRÍTICO-CRÔNICO") || [];

  return (
  <main className="panel-main">
    <div className="page-subtitle">Crítico-Crônico (Jack-Knife)</div>

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
                <p className="card-eyebrow">Frequência × Impacto (escala log)</p>
                <h2>Equipamentos críticos e crônicos</h2>
              </div>

              <div className="jack-knife-legend">
                {CATEGORY_LEGEND.map((item) => (
                  <div key={item.label} className="legend-item" title={item.desc}>
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="chart-empty">Carregando...</div>
            ) : (
              <JackKnifeChart
                data={data?.pontos || []}
                limiteQ={data?.limites.limite_q || 0}
                limiteMttr={data?.limites.limite_mttr || 0}
                onPointClick={goToApontamentos}
              />
            )}
          </div>

          {criticoCronico.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Prioridade</th>
                    <th>Linha</th>
                    <th>Equipamento</th>
                    <th className="col-num">Nº de falhas</th>
                    <th className="col-num">MTTR</th>
                    <th className="col-num">Tempo total</th>
                  </tr>
                </thead>
                <tbody>
                  {criticoCronico
                    .sort((a, b) => b.tempo_total - a.tempo_total)
                    .map((p, i) => (
                      <tr
                        key={`${p.linha}-${p.equipamento}`}
                        className="clickable-row"
                        onClick={() => goToApontamentos(p)}
                      >
                        <td><span className="tag" style={{ borderColor: "#F0A030", color: "#F0A030" }}>{i + 1}</span></td>
                        <td>{p.linha}</td>
                        <td>{p.equipamento}</td>
                        <td className="col-num">{p.q}</td>
                        <td className="col-num">{p.mttr.toFixed(1)} min</td>
                        <td className="col-num tempo-parada">{p.tempo_total.toFixed(1)} min</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </main>
  );
}