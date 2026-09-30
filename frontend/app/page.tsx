"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchJackKnife,
  fetchPareto,
  fetchApontamentos,
  fetchFiltros,
  JackKnifeResponse,
  JackKnifePonto,
  ParetoResponse,
  Filtros,
} from "../lib/api";
import MorphSelect from "../components/ui/select-morph";
import DatePicker from "../components/ui/date-picker";

type Categoria = "CRÍTICO-CRÔNICO" | "CRÍTICO" | "CRÔNICO" | "CONFORTO";

const CATEGORY_CONFIG: { key: Categoria; label: string; desc: string; color: string }[] = [
  { key: "CRÍTICO-CRÔNICO", label: "Crítico-Crônico", desc: "Alta frequência e alto impacto — prioridade máxima", color: "#F0A030" },
  { key: "CRÍTICO", label: "Crítico", desc: "Baixa frequência, alto impacto — risco elevado", color: "#D9534F" },
  { key: "CRÔNICO", label: "Crônico", desc: "Alta frequência, baixo impacto — foco na causa raiz", color: "#4C9A6A" },
  { key: "CONFORTO", label: "Conforto", desc: "Baixa frequência e baixo impacto", color: "#5C6577" },
];

export default function HomePage() {
  const router = useRouter();

  const [filtros, setFiltros] = useState<Filtros>({ centros: [], linhas: [], tipos_parada: [] });
  const [jackKnife, setJackKnife] = useState<JackKnifeResponse | null>(null);
  const [pareto, setPareto] = useState<ParetoResponse | null>(null);
  const [totalApontamentos, setTotalApontamentos] = useState<number | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState({
    centro: "",
    linha: "",
    data_inicio: "",
    data_fim: "",
  });

  function handleCardPointerMove(e: React.PointerEvent<HTMLElement>) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  target.style.setProperty("--mx", `${x}%`);
  target.style.setProperty("--my", `${y}%`);
}

  useEffect(() => {
    fetchFiltros().then(setFiltros).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jk, pt, apontamentosRes] = await Promise.all([
        fetchJackKnife(params),
        fetchPareto(params),
        fetchApontamentos({ ...params, page: 1, pageSize: 1, apenas_validos: true }),
      ]);
      setJackKnife(jk);
      setPareto(pt);
      setTotalApontamentos(apontamentosRes.pagination.total);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar visão geral");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateFilter(key: keyof typeof params, value: string) {
    setSelectedCategoria(null); // fecha a tabela aberta ao trocar filtro, evita mostrar dado desatualizado
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  function countByCategoria(cat: Categoria): number {
    return jackKnife?.pontos.filter((p) => p.categoria === cat).length || 0;
  }

  function tempoByCategoria(cat: Categoria): number {
    return (
      jackKnife?.pontos
        .filter((p) => p.categoria === cat)
        .reduce((sum, p) => sum + p.tempo_total, 0) || 0
    );
  }

  const filteredEquipamentos: JackKnifePonto[] = selectedCategoria
    ? (jackKnife?.pontos.filter((p) => p.categoria === selectedCategoria) || [])
        .sort((a, b) => b.tempo_total - a.tempo_total)
    : [];

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

  return (
    <main className="panel-main data-main">
      <div className="page-subtitle">Visão geral</div>

      <div className="data-container">
        {/* --- Barra de filtros --- */}
        <div className="filter-bar">
          <div className="filter-field">
            <label>Centro</label>
            <MorphSelect value={params.centro} ariaLabel="Centro" onValueChange={(value) => updateFilter("centro", value)} options={[{ value: "", label: "Todos" }, ...filtros.centros.map((c) => ({ value: c, label: c }))]} />
          </div>

          <div className="filter-field">
            <label>Linha</label>
            <MorphSelect value={params.linha} ariaLabel="Linha" onValueChange={(value) => updateFilter("linha", value)} options={[{ value: "", label: "Todas" }, ...filtros.linhas.map((l) => ({ value: l, label: l }))]} />
          </div>

          <div className="filter-field">
            <label>De</label>
            <DatePicker value={params.data_inicio} ariaLabel="Data inicial" onValueChange={(value) => updateFilter("data_inicio", value)} />
          </div>

          <div className="filter-field">
            <label>Até</label>
            <DatePicker value={params.data_fim} ariaLabel="Data final" onValueChange={(value) => updateFilter("data_fim", value)} />
          </div>
        </div>

        {error && <div className="status-message error">{error}</div>}

        {/* --- Cards de resumo rápido --- */}
<div className="stat-cards-row">
  <div className="stat-card" onPointerMove={handleCardPointerMove}>
    <span className="stat-card-label">Apontamentos válidos</span>
    <strong className="stat-card-value">
      {loading || totalApontamentos === null ? "—" : totalApontamentos.toLocaleString("pt-BR")}
    </strong>
  </div>
  <div className="stat-card" onPointerMove={handleCardPointerMove}>
    <span className="stat-card-label">Tempo total parado</span>
    <strong className="stat-card-value">
      {loading || !pareto ? "—" : `${pareto.total_tempo_parada.toLocaleString("pt-BR")} min`}
    </strong>
  </div>
  <div className="stat-card" onPointerMove={handleCardPointerMove}>
    <span className="stat-card-label">Não classificados</span>
    <strong className="stat-card-value warn">
      {loading || !pareto ? "—" : pareto.nao_classificados.qtd_falhas.toLocaleString("pt-BR")}
    </strong>
  </div>
  <div className="stat-card" onPointerMove={handleCardPointerMove}>
    <span className="stat-card-label">Equipamentos monitorados</span>
    <strong className="stat-card-value">
      {loading || !jackKnife ? "—" : jackKnife.pontos.length.toLocaleString("pt-BR")}
    </strong>
  </div>
</div>

{/* --- Cards de categoria (clicáveis) --- */}
<div className="category-cards-row">
  {CATEGORY_CONFIG.map((cfg) => {
    const count = countByCategoria(cfg.key);
    const tempo = tempoByCategoria(cfg.key);
    const isActive = selectedCategoria === cfg.key;

    return (
      <button
        key={cfg.key}
        className={isActive ? "category-card active" : "category-card"}
        style={{ borderColor: isActive ? cfg.color : undefined }}
        onClick={() => setSelectedCategoria(isActive ? null : cfg.key)}
        onPointerMove={handleCardPointerMove}
      >
        <div className="category-card-top">
          <span className="category-dot" style={{ background: cfg.color }} />
          <span className="category-card-label">{cfg.label}</span>
        </div>
        <strong className="category-card-count" style={{ color: cfg.color }}>
          {loading ? "—" : count}
        </strong>
        <span className="category-card-sub">
          {loading ? "" : `${tempo.toFixed(0)} min parados`}
        </span>
        <p className="category-card-desc">{cfg.desc}</p>
      </button>
    );
  })}
</div>
        {/* --- Tabela de equipamentos da categoria selecionada --- */}
        {selectedCategoria && (
          <div className="table-wrapper" style={{ marginTop: 8 }}>
            <div className="table-section-header">
              <h3>
                Equipamentos — <span>{CATEGORY_CONFIG.find((c) => c.key === selectedCategoria)?.label}</span>
              </h3>
              <button className="btn-secondary" onClick={() => setSelectedCategoria(null)}>
                Fechar
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Linha</th>
                  <th>Equipamento</th>
                  <th className="col-num">Nº de falhas</th>
                  <th className="col-num">MTTR</th>
                  <th className="col-num">Tempo total</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipamentos.length === 0 ? (
                  <tr><td colSpan={5} className="table-state">Nenhum equipamento nessa categoria.</td></tr>
                ) : (
                  filteredEquipamentos.map((p) => (
                    <tr
                      key={`${p.linha}-${p.equipamento}`}
                      className="clickable-row"
                      onClick={() => goToApontamentos(p)}
                    >
                      <td>{p.linha}</td>
                      <td>{p.equipamento}</td>
                      <td className="col-num">{p.q}</td>
                      <td className="col-num">{p.mttr.toFixed(1)} min</td>
                      <td className="col-num tempo-parada">{p.tempo_total.toFixed(1)} min</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!selectedCategoria && !loading && (
          <div className="empty-hint">
            Selecione uma categoria acima para ver os equipamentos em detalhe.
          </div>
        )}
      </div>
    </main>
  );
}
