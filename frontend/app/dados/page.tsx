"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    fetchApontamentos,
    fetchFiltros,
    Apontamento,
    Filtros,
    ListParams,
    downloadExport,
} from "../../lib/api";
import ClassificationPicker from "../../components/ClassificationPicker";
import MorphSelect from "../../components/ui/select-morph";
import DatePicker from "../../components/ui/date-picker";

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
        apenas_validos: true,
        apenas_ia: searchParams.get("apenas_ia") === "true",
        page: 1,
        pageSize: 50,
        orderBy: "data_inicio",
        orderDir: "desc",
    });

    useEffect(() => {
        fetchFiltros().then((result) => {
            setFiltros(result);
            setParams((prev) => ({ ...prev, centro: result.centros[0] || "" }));
        }).catch(() => { });
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
        if (params.apenas_ia) {
            setData((prev) => prev.filter((row) => row.id !== rowId));
            loadData();
            return;
        }
        setData((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, modo_falha_padrao: novoModo, origem_classificacao: novoModo ? "manual" : null } : row
            )
        );
    }

    function clearEquipamentoFilter() {
        setParams((prev) => ({ ...prev, equipamento: undefined, page: 1 }));
    }
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    async function handleExport() {
        setExporting(true);
        setExportError(null);
        try {
            await downloadExport(params);
        } catch (err: any) {
            setExportError(err.message || "Erro ao exportar");
        } finally {
            setExporting(false);
        }
    }

    return (
        <main className="panel-main data-main apontamentos-main">
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
                        <MorphSelect value={params.centro || ""} ariaLabel="Centro" onValueChange={(value) => updateFilter("centro", value)} options={[{ value: "", label: "Todos" }, ...filtros.centros.map((c) => ({ value: c, label: c }))]} />
                    </div>

                    <div className="filter-field">
                        <label>Linha</label>
                        <MorphSelect value={params.linha || ""} ariaLabel="Linha" onValueChange={(value) => updateFilter("linha", value)} options={[{ value: "", label: "Todas" }, ...filtros.linhas.map((l) => ({ value: l, label: l }))]} />
                    </div>

                    <div className="filter-field">
                        <label>Tipo de parada</label>
                        <MorphSelect value={params.tipo_parada || ""} ariaLabel="Tipo de parada" onValueChange={(value) => updateFilter("tipo_parada", value)} options={[{ value: "", label: "Todos" }, ...filtros.tipos_parada.map((t) => ({ value: t, label: t }))]} />
                    </div>

                    <div className="filter-field">
                        <label>Turno</label>
                        <MorphSelect value={params.turno || ""} ariaLabel="Turno" onValueChange={(value) => updateFilter("turno", value)} options={[{ value: "", label: "Todos" }, { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
                    </div>

                    <div className="filter-field">
                        <label>De</label>
                        <DatePicker value={params.data_inicio || ""} ariaLabel="Data inicial" onValueChange={(value) => updateFilter("data_inicio", value)} />
                    </div>

                    <div className="filter-field">
                        <label>Até</label>
                        <DatePicker value={params.data_fim || ""} ariaLabel="Data final" onValueChange={(value) => updateFilter("data_fim", value)} />
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
                    <label className="filter-field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={Boolean(params.apenas_ia)}
                            onChange={(e) => updateFilter("apenas_ia", e.target.checked)}
                        />
                        Apenas classificações feitas pela IA
                    </label>
                </div>

                {/* --- Toggle de qualidade de dado --- */}
                <div className="quality-toggle">
                    <button
                        className={params.apenas_validos ? "toggle-btn active" : "toggle-btn"}
                        onClick={() => updateFilter("apenas_validos", true)}
                    >
                        Registros válidos
                    </button>
                    <span className="result-count">
                        {loading ? "Carregando..." : `${pagination.total.toLocaleString("pt-BR")} registros`}
                    </span>

                    <button className="btn-export" onClick={handleExport} disabled={exporting || loading}>
                        {!exporting && (
                            <svg className="btn-export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="m7 10 5 5 5-5M12 15V3" />
                            </svg>
                        )}
                        {exporting ? "Exportando..." : "Exportar Excel"}
                    </button>
                </div>
            {exportError && <div className="status-message error">{exportError}</div>}
                {/* --- Tabela --- */}
                <div className="table-wrapper">
                    {error && <div className="status-message error">{error}</div>}

                    <table className="data-table apontamentos-table">
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
                                                origemClassificacao={row.origem_classificacao}
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
