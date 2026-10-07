const API_URL = "/api";

export interface Centro {
  codigo: string;
  nome: string;
}

export async function fetchCentros(): Promise<Centro[]> {
  const res = await fetch(`${API_URL}/auth/centros-disponiveis`, { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Não foi possível carregar os centros (HTTP ${res.status}).`);
  }
  const data = await res.json();
  if (!Array.isArray(data.centros)) throw new Error("A resposta da API de centros está em formato inválido.");
  return data.centros;
}

export async function loginAdmin(usuario: string, senha: string, centro: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha, centro }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Não foi possível entrar");
  }
}

export async function logoutAdmin(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function fetchSession(): Promise<{ usuario: string; centro: string; role: "admin" | "gerente" }> {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Sessão inválida");
  return res.json();
}


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
  origem_classificacao: "historico_exato" | "palavra_chave" | "ia" | "manual" | null;
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
  apenas_ia?: boolean;
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

  const res = await fetch(`${API_URL}/apontamentos?${query.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar apontamentos");
  return res.json();
}

export async function fetchFiltros(): Promise<Filtros> {
  const res = await fetch(`${API_URL}/apontamentos/filtros`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar filtros");
  return res.json();
}

export interface ModoFalha {
  id: number;
  nome_padrao: string;
  categoria: string | null;
}

export async function fetchModosFalha(): Promise<ModoFalha[]> {
  const res = await fetch(`${API_URL}/classificacao/modos-falha`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar modos de falha");
  return res.json();
}

export async function updateClassificacao(
  id: number,
  modoFalhaId: number | null
): Promise<{ id: number; modo_falha_padrao: string | null }> {
  const res = await fetch(`${API_URL}/classificacao/apontamentos/${id}`, {
    method: "PATCH",
    credentials: "include",
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

  const res = await fetch(`${API_URL}/dashboard/pareto-modo-falha?${query.toString()}`, { credentials: "include" });
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

  const res = await fetch(`${API_URL}/dashboard/jack-knife?${query.toString()}`, { credentials: "include" });
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
  const res = await fetch(`${API_URL}/classificacao/sugestoes?min=${minOccurrences}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar sugestões");
  return res.json();
}

export async function classifyPendingApontamentos(): Promise<{
  totalAnalisado: number;
  totalClassificado: number;
  totalClassificadoIA: number;
}> {
  const res = await fetch(`${API_URL}/classificacao/reclassificar`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Erro ao classificar apontamentos pendentes");
  }
  return res.json();
}

export async function addKeyword(modoFalhaId: number, palavraChave: string, prioridade = 5) {
  const res = await fetch(`${API_URL}/classificacao/palavras-chave`, {
    method: "POST",
    credentials: "include",
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
  const res = await fetch(url, { credentials: "include" });

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
export interface Alerta {
  linha: string;
  equipamento: string;
  qtd_falhas: number;
  tempo_total: number;
  plano_status: "sem_plano" | "aberto" | "em_andamento" | "concluido";
  plano_atualizado_em: string | null;
}

export interface AlertasResponse {
  limite_minutos: number;
  alertas: Alerta[];
}

export interface CincoW2HItem {
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_much: string;
}

export interface Ishikawa {
  metodo: string;
  maquina: string;
  mao_de_obra: string;
  material: string;
  meio_ambiente: string;
  medida: string;
}

export interface PlanoAcao {
  id?: number;
  status: "aberto" | "em_andamento" | "concluido";
  descricao_problema: string;
  ishikawa: Ishikawa;
  brainstorming: string[];
  cinco_porques: string[];
  cinco_w2h: CincoW2HItem[];
}

export interface Sugestao {
  modos_falha_predominantes: { nome: string; ocorrencias: number; tempo_total: number }[];
  observacoes_amostra: string[];
}

export interface PlanoResponse {
  plano: (PlanoAcao & { linha?: string; equipamento?: string }) | null;
  sugestao: Sugestao;
}

export async function fetchAlertas(): Promise<AlertasResponse> {
  const res = await fetch(`${API_URL}/planos-acao`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar alertas");
  return res.json();
}

export async function fetchPlano(linha: string, equipamento: string): Promise<PlanoResponse> {
  const res = await fetch(
    `${API_URL}/planos-acao/${encodeURIComponent(linha)}/${encodeURIComponent(equipamento)}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Erro ao buscar plano de ação");
  return res.json();
}

export async function savePlano(linha: string, equipamento: string, plano: PlanoAcao): Promise<void> {
  const res = await fetch(
    `${API_URL}/planos-acao/${encodeURIComponent(linha)}/${encodeURIComponent(equipamento)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plano),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Erro ao salvar plano de ação");
  }
}
export interface EquipamentoResumo {
  linha: string;
  equipamento: string;
  qtd_falhas: number;
  tempo_total: number;
}

export interface PontoEvolucao {
  periodo: string;
  qtd_falhas: number;
  tempo_total: number;
  mttr: number;
}

export interface Previsao {
  previsaoDisponivel: boolean;
  motivo?: string;
  tendencia?: string;
  risco?: string;
  confianca?: number;
  r2?: number;
  valorAtual?: number;
  valorPrevistoProximoPeriodo?: number;
  variacaoPercentual?: number;
}

export interface SerieEvolucao {
  equipamento: string;
  linha: string | null;
  pontos: PontoEvolucao[];
  previsao: { tempoParado: Previsao; qtdFalhas: Previsao };
}

export interface EvolucaoResponse {
  series: SerieEvolucao[];
  periodoMeses: number;
}

export async function fetchEquipamentosDisponiveis(): Promise<EquipamentoResumo[]> {
  const res = await fetch(`${API_URL}/dashboard/equipamentos`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar equipamentos");
  return res.json();
}

export async function fetchEvolucao(equipamentos: string[], meses = 12): Promise<EvolucaoResponse> {
  const query = new URLSearchParams({
    equipamentos: equipamentos.join(","),
    meses: String(meses),
  });
  const res = await fetch(`${API_URL}/dashboard/evolucao?${query}`, { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Erro ao buscar evolução");
  }
  return res.json();
}

export async function createUser(email: string, senha: string, cargo: "admin" | "gerente"): Promise<void> {
  const res = await fetch(`${API_URL}/auth/usuarios`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha, cargo }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "N\u00e3o foi poss\u00edvel cadastrar o usu\u00e1rio.");
  }
}
