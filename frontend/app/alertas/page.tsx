"use client";

import { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";
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
  aberto: { label: "Aberto", color: "#FFB74D" },
  em_andamento: { label: "Em andamento", color: "#81C784" },
  concluido: { label: "Concluído", color: "#81C784" },
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
  const [exporting, setExporting] = useState(false);

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

  async function exportWord() {
    if (!selected) return;
    setExporting(true);
    try {
      const xmlEntities: Record<string, string> = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
      };
      const escapeXml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => xmlEntities[char]);
      const textRun = (value: unknown) => {
        const lines = String(value ?? "").trim() || "—";
        return lines.split(/\r?\n/).map((line, i) => `${i ? "<w:br/>" : ""}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join("");
      };
      const paragraph = (value: unknown, style = "Normal") => `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r>${textRun(value)}</w:r></w:p>`;
      const heading = (value: string) => paragraph(value, "Heading1");
      const table = (headers: string[], rows: string[][]) => {
        const allRows = [headers, ...(rows.length ? rows : [headers.map(() => "—")])];
        const columnWidth = Math.floor(9000 / headers.length);
        const grid = headers.map(() => `<w:gridCol w:w="${columnWidth}"/>`).join("");
        const body = allRows.map((row, rowIndex) => `<w:tr>${row.map((value) => `<w:tc><w:tcPr><w:tcW w:w=\"${columnWidth}\" w:type=\"dxa\"/>${rowIndex === 0 ? "<w:shd w:fill=\"C50008\"/>" : ""}</w:tcPr><w:p><w:r>${rowIndex === 0 ? "<w:rPr><w:b/><w:color w:val=\"FFFFFF\"/></w:rPr>" : ""}${textRun(value)}</w:r></w:p></w:tc>`).join("")}</w:tr>`).join("");
        return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7B7B7"/><w:left w:val="single" w:sz="4" w:color="B7B7B7"/><w:bottom w:val="single" w:sz="4" w:color="B7B7B7"/><w:right w:val="single" w:sz="4" w:color="B7B7B7"/><w:insideH w:val="single" w:sz="4" w:color="B7B7B7"/><w:insideV w:val="single" w:sz="4" w:color="B7B7B7"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
      };
      const field = (label: string, value: unknown) => `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(label)}: </w:t></w:r><w:r>${textRun(value)}</w:r></w:p>`;
      const suggestions = sugestao?.modos_falha_predominantes || [];
      const statusLabel = { aberto: "Aberto", em_andamento: "Em andamento", concluido: "Concluído" }[status];
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraph("Plano de Ação — MASP", "Title")}${paragraph(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`)}${heading("Identificação do equipamento")}${field("Equipamento", selected.equipamento)}${field("Linha", selected.linha)}${field("Falhas", selected.qtd_falhas)}${field("Tempo parado", `${selected.tempo_total.toFixed(0)} min`)}${field("Status", statusLabel)}${heading("1. Descrição do problema")}${paragraph(descricao)}${heading("2. Diagrama de Ishikawa (6M)")}${table(["Categoria", "Causa identificada"], [["Método", ishikawa.metodo], ["Máquina", ishikawa.maquina], ["Mão de obra", ishikawa.mao_de_obra], ["Material", ishikawa.material], ["Meio ambiente", ishikawa.meio_ambiente], ["Medida", ishikawa.medida]])}${heading("3. Brainstorming")}${table(["Ideias"], brainstorming.filter((idea) => idea.trim()).map((idea) => [idea]))}${heading("4. Cinco Porquês")}${table(["Nº", "Causa"], cincoPorques.map((why, index) => [String(index + 1), why]))}${heading("5. Plano de ação (5W2H)")}${table(["O quê", "Por quê", "Onde", "Quando", "Quem", "Como", "Quanto custa"], cincoW2H.map((row) => [row.what, row.why, row.where, row.when, row.who, row.how, row.how_much]))}${suggestions.length ? `${heading("Sugestões do histórico")}${table(["Modo de falha", "Ocorrências", "Tempo total (min)"], suggestions.map((item) => [item.nome, String(item.ocorrencias), item.tempo_total.toFixed(0)]))}` : ""}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`;
      const zip = new JSZip();
      zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
      zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
      zip.file("word/document.xml", documentXml);
      zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
      zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:color w:val="C50008"/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="C50008"/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/></w:style></w:styles>`);
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = selected.equipamento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
      link.href = url;
      link.download = `plano_de_acao_${filename || "equipamento"}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\u00e3o foi poss\u00edvel gerar o documento.");
    } finally {
      setExporting(false);
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
              <button className="btn-secondary" onClick={exportWord} disabled={exporting} style={{ width: "100%", marginTop: 10 }}>
                {exporting ? "Gerando documento..." : "Baixar para Word / Google Docs"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
