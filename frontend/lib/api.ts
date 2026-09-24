const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export interface Apontamento {
  id: number;
  centro: string;
  linha: string;
  ordem: string;
  material: string;
  descricao_material: string | null;
  data_inicio: string;
  turno: number | null;
  intervalo: string | null;
  tipo_parada: string | null;
  chave_parada: string | null;
  subchave_parada: string | null;
  observacoes: string | null;
  tempo_parada: number;
  total_minutos: number;
modo_falha_padrao: string | null; 
}

export interface ListResponse {
  data: Apontamento[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface Filtros {
  centros: string[];
  linhas: string[];
  tipos_parada: string[];
}

export interface ListParams {
  centro?: string;
  linha?: string;
  tipo_parada?: string;
  equipamento?: string; 
  turno?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
  apenas_validos?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  
  orderDir?: "asc" | "desc";
}

export async function fetchApontamentos(params: ListParams): Promise<ListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const res = await fetch(`${API_URL}/apontamentos?${query.toString()}`);
  if (!res.ok) throw new Error("Erro ao buscar apontamentos");
  return res.json();
}

export async function fetchFiltros(): Promise<Filtros> {
  const res = await fetch(`${API_URL}/apontamentos/filtros`);
  if (!res.ok) throw new Error("Erro ao buscar filtros");
  return res.json();
}

export interface ModoFalha {
  id: number;
  nome_padrao: string;
  categoria: string | null;
}

export async function fetchModosFalha(): Promise<ModoFalha[]> {
  const res = await fetch(`${API_URL}/classificacao/modos-falha`);
  if (!res.ok) throw new Error("Erro ao buscar modos de falha");
  return res.json();
}

export async function updateClassificacao(
  id: number,
  modoFalhaId: number | null
): Promise<{ id: number; modo_falha_padrao: string | null }> {
  const res = await fetch(`${API_URL}/classificacao/apontamentos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo_falha_id: modoFalhaId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Erro ao classificar apontamento");
  }
  const data = await res.json();
  return data.apontamento;
}
export interface ParetoItem {
  modo_falha: string;
  qtd_falhas: number;
  tempo_total: number;
  percentual: number;
  percentual_acumulado: number;
}

export interface ParetoResponse {
  pareto: ParetoItem[];
  nao_classificados: { qtd_falhas: number; tempo_total: number };
  total_tempo_parada: number;
}

export interface ParetoParams {
  centro?: string;
  linha?: string;
  data_inicio?: string;
  data_fim?: string;
}

export async function fetchPareto(params: ParetoParams): Promise<ParetoResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const res = await fetch(`${API_URL}/dashboard/pareto-modo-falha?${query.toString()}`);
  if (!res.ok) throw new Error("Erro ao buscar Pareto");
  return res.json();
}

export interface JackKnifePonto {
  linha: string;
  equipamento: string;
  q: number;
  tempo_total: number;
  mttr: number;
  categoria: "CRÍTICO-CRÔNICO" | "CRÍTICO" | "CRÔNICO" | "CONFORTO";
}

export interface JackKnifeResponse {
  pontos: JackKnifePonto[];
  limites: { limite_q: number; limite_mttr: number };
}

export interface JackKnifeParams {
  centro?: string;
  linha?: string;
  data_inicio?: string;
  data_fim?: string;
}

export async function fetchJackKnife(params: JackKnifeParams): Promise<JackKnifeResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const res = await fetch(`${API_URL}/dashboard/jack-knife?${query.toString()}`);
  if (!res.ok) throw new Error("Erro ao buscar Jack-Knife");
  return res.json();
}

export async function fetchApontamentosCount(): Promise<number> {
  const res = await fetchApontamentos({ page: 1, pageSize: 1, apenas_validos: true });
  return res.pagination.total;
}
export interface Suggestion {
  termo: string;
  ocorrencias: number;
  tipo: "palavra" | "expressão";
}

export interface SuggestionsResponse {
  total_nao_classificados: number;
  sugestoes_palavras: Suggestion[];
  sugestoes_expressoes: Suggestion[];
}

export async function fetchSuggestions(minOccurrences = 5): Promise<SuggestionsResponse> {
  const res = await fetch(`${API_URL}/classificacao/sugestoes?min=${minOccurrences}`);
  if (!res.ok) throw new Error("Erro ao buscar sugestões");
  return res.json();
}

export async function addKeyword(modoFalhaId: number, palavraChave: string, prioridade = 5) {
  const res = await fetch(`${API_URL}/classificacao/palavras-chave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo_falha_id: modoFalhaId, palavra_chave: palavraChave, prioridade }),
  });
  if (!res.ok) throw new Error("Erro ao adicionar palavra-chave");
  return res.json();
}
export function buildExportUrl(params: ListParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && key !== "page" && key !== "pageSize" && key !== "orderBy" && key !== "orderDir") {
      query.set(key, String(value));
    }
  });
  return `${API_URL}/apontamentos/export?${query.toString()}`;
}

export async function downloadExport(params: ListParams): Promise<void> {
  const url = buildExportUrl(params);
  const res = await fetch(url);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Erro ao exportar dados");
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;

  const contentDisposition = res.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  link.download = filenameMatch ? filenameMatch[1] : "apontamentos.xlsx";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}