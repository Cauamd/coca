"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "/api";

interface UploadResult {
  status: string;
  linhas_processadas: number;
  linhas_inseridas: number;
  linhas_ignoradas: number;
}

export default function UploadApontamentos() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && !selected.name.match(/\.xlsx$|\.xlsm$/)) {
      setError("Selecione um arquivo .xlsx ou .xlsm");
      setFile(null);
      return;
    }
    setError(null);
    setResult(null);
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/apontamentos/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const responseText = await res.text();
      let data: UploadResult & { detail?: string };
      try {
        data = JSON.parse(responseText);
      } catch {
        const isHtml = responseText.trimStart().startsWith("<");
        throw new Error(
          isHtml
            ? "O servidor retornou uma página HTML em vez da API. Verifique se o backend está rodando e se BACKEND_URL aponta para ele."
            : "O servidor retornou uma resposta inválida ao enviar a planilha."
        );
      }

      if (!res.ok) {
        throw new Error(data.detail || `Erro ao enviar arquivo (HTTP ${res.status})`);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao enviar o arquivo");
    } finally {
      setLoading(false);
    }
  }

  function handleGoToData() {
    router.push("/dados");
  }

  return (
  <main className="panel-main">
    <div className="page-subtitle">Importação de apontamentos</div>
      <main className="panel-main">
        <div className="upload-card">
          <p className="card-eyebrow">Entrada de dados</p>
          <h2>Importar apontamentos</h2>
          <p className="description">
            Envie a planilha em formato .xlsx ou .xlsm. Serão importadas apenas as linhas do centro selecionado no login; as demais serão ignoradas.
            As colunas abaixo devem estar na aba "Apontamentos de Falha KOFBR".
          </p>
          <p className="required-cols">
            Centro · Data Inicio Real · Linha · Ordem · Material · Minutos de paradas
          </p>

          <div className={`file-drop ${file ? "has-file" : ""}`} style={{ marginTop: 20 }}>
            <input
              type="file"
              accept=".xlsx,.xlsm"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          <button className="btn-primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Enviando..." : "Enviar planilha"}
          </button>

          {error && <div className="status-message error">{error}</div>}

          {result && (
            <div className="status-message success">
              Importação concluída.
              <div className="stat-row">
                <span>Linhas na planilha</span>
                <strong>{result.linhas_processadas}</strong>
              </div>
              <div className="stat-row">
                <span>Linhas inseridas</span>
                <strong>{result.linhas_inseridas}</strong>
              </div>

              <div className="stat-row">
                <span>Linhas ignoradas (outros centros)</span>
                <strong>{result.linhas_ignoradas}</strong>
              </div>

              <button className="btn-primary btn-view-data" onClick={handleGoToData}>
                Ver dados importados →
              </button>
            </div>
          )}
        </div>
      </main>
    </main>
  );
}
