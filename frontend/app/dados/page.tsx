"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    fetchApontamentos,
    fetchFiltros,
    Apontamento,
    Filtros,
    ListParams,
} from "../../lib/api";
import ClassificationPicker from "../../components/ClassificationPicker";

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMinutos(v: number) {
    return `${Number(v).toFixed(1)} min`;
}

export default function DadosApontamentos() {
    const searchParams = useSearchParams();

    const [filtros, setFiltros] = useState<Filtros>({ centros: [], linhas: [], tipos_parada: [] });
    const [data, setData] = useState<Apontamento[]>([]);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Inicializa os filtros já lendo o que veio na URL (do drill-down do Jack-Knife)
    const [params, setParams] = useState<ListParams>({
        centro: searchParams.get("centro") || undefined,
        linha: searchParams.get("linha") || undefined,
        equipamento: searchParams.get("equipamento") || undefined,
        data_inicio: searchParams.get("data_inicio") || undefined,
        data_fim: searchParams.get("data_fim") || undefined,
        apenas_validos: searchParams.get("apenas_validos") !== "false",
        page: 1,
        pageSize: 50,
        orderBy: "data_inicio",
        orderDir: "desc",
    });

    useEffect(() => {
        fetchFiltros().then(setFiltros).catch(() => { });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchApontamentos(params);
            setData(res.data);
            setPagination(res.pagination);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function updateFilter(key: keyof ListParams, value: string | boolean) {
        setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
    }

    function goToPage(newPage: number) {
        setParams((prev) => ({ ...prev, page: newPage }));
    }

    function handleClassified(rowId: number, novoModo: string | null) {
        setData((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, modo_falha_padrao: novoModo } : row
            )
        );
    }

    function clearEquipamentoFilter() {
        setParams((prev) => ({ ...prev, equipamento: undefined, page: 1 }));
    }

    return (
        <main className="panel-main data-main">
            <div className="page-subtitle">Apontamentos</div>

            <div className="data-container">
                {/* --- Banner de drill-down (aparece só quando veio filtro de equipamento pela URL) --- */}
                {params.equipamento && (
                    <div className="drill-down-banner">
                        <span>
                            Filtrando por equipamento: <strong>{params.equipamento}</strong>
                            {params.linha && <> na linha <strong>{params.linha}</strong></>}
                        </span>
                        <button className="btn-secondary" onClick={clearEquipamentoFilter}>
                            Limpar
                        </button>
                    </div>
                )}

                {/* --- Barra de filtros --- */}
                <div className="filter-bar">
                    <div className="filter-field">
                        <label>Centro</label>
                        <select value={params.centro || ""} onChange={(e) => updateFilter("centro", e.target.value)}>
                            <option value="">Todos</option>
                            {filtros.centros.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-field">
                        <label>Linha</label>
                        <select value={params.linha || ""} onChange={(e) => updateFilter("linha", e.target.value)}>
                            <option value="">Todas</option>
                            {filtros.linhas.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-field">
                        <label>Tipo de parada</label>
                        <select value={params.tipo_parada || ""} onChange={(e) => updateFilter("tipo_parada", e.target.value)}>
                            <option value="">Todos</option>
                            {filtros.tipos_parada.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-field">
                        <label>Turno</label>
                        <select value={params.turno || ""} onChange={(e) => updateFilter("turno", e.target.value)}>
                            <option value="">Todos</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>

                    <div className="filter-field">
                        <label>De</label>
                        <input
                            type="date"
                            value={params.data_inicio || ""}
                            onChange={(e) => updateFilter("data_inicio", e.target.value)}
                        />
                    </div>

                    <div className="filter-field">
                        <label>Até</label>
                        <input
                            type="date"
                            value={params.data_fim || ""}
                            onChange={(e) => updateFilter("data_fim", e.target.value)}
                        />
                    </div>

                    <div className="filter-field filter-field-wide">
                        <label>Buscar</label>
                        <input
                            type="text"
                            placeholder="Observações, descrição do material..."
                            value={params.busca || ""}
                            onChange={(e) => updateFilter("busca", e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Toggle de qualidade de dado --- */}
                <div className="quality-toggle">
                    <button
                        className={params.apenas_validos ? "toggle-btn active" : "toggle-btn"}
                        onClick={() => updateFilter("apenas_validos", true)}
                    >
                        Registros válidos
                    </button>
                    <button
                        className={!params.apenas_validos ? "toggle-btn active critical" : "toggle-btn"}
                        onClick={() => updateFilter("apenas_validos", false)}
                    >
                        Com inconsistência
                    </button>
                    <span className="result-count">
                        {loading ? "Carregando..." : `${pagination.total.toLocaleString("pt-BR")} registros`}
                    </span>
                </div>

                {/* --- Tabela --- */}
                <div className="table-wrapper">
                    {error && <div className="status-message error">{error}</div>}

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Centro</th>
                                <th>Linha</th>
                                <th>Ordem</th>
                                <th>Material</th>
                                <th>Tipo de parada</th>
                                <th>Equipamento</th>
                                <th>Observações</th>
                                <th>Modo de Falha</th>
                                <th className="col-num">Turno</th>
                                <th className="col-num">Parada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={11} className="table-state">Carregando registros...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={11} className="table-state">Nenhum registro encontrado para esses filtros.</td></tr>
                            ) : (
                                data.map((row) => (
                                    <tr key={row.id}>
                                        <td>{formatDate(row.data_inicio)}</td>
                                        <td><span className="tag">{row.centro}</span></td>
                                        <td>{row.linha}</td>
                                        <td>{row.ordem}</td>
                                        <td>
                                            <div className="material-cell">
                                                <span>{row.material}</span>
                                                {row.descricao_material && (
                                                    <span className="material-desc">{row.descricao_material}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{row.tipo_parada || "—"}</td>
                                        <td>{row.chave_parada || "—"}</td>
                                        <td className="col-obs">{row.observacoes || "—"}</td>
                                        <td>
                                            <ClassificationPicker
                                                apontamentoId={row.id}
                                                currentModoFalha={row.modo_falha_padrao}
                                                onClassified={(novoModo) => handleClassified(row.id, novoModo)}
                                            />
                                        </td>
                                        <td className="col-num">{row.turno ?? "—"}</td>
                                        <td className="col-num tempo-parada">{formatMinutos(row.tempo_parada)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Paginação --- */}
                <div className="pagination-bar">
                    <button
                        className="btn-secondary"
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => goToPage(pagination.page - 1)}
                    >
                        Anterior
                    </button>
                    <span className="page-info">
                        Página {pagination.page} de {pagination.totalPages || 1}
                    </span>
                    <button
                        className="btn-secondary"
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => goToPage(pagination.page + 1)}
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </main>
    );
}