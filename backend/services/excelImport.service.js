const XLSX = require("xlsx");

// Mapa: nome da coluna no Excel (normalizado) -> nome do campo no banco
const COLUMN_MAP = {
  "centro": "centro",
  "data inicio real": "data_inicio",
  "linha": "linha",
  "tipo de parada": "tipo_parada",
  "material": "material",
  "ordem": "ordem",
  "descrição do material": "descricao_material",
  "turno": "turno",
  "intervalo": "intervalo",
  "chave do parada": "chave_parada",
  "subchave de parada": "subchave_parada",
  "chave 1 de parada": "chave1_parada",
  "observações": "observacoes",
  "pros. efi. perdid.": "perc_eficiencia_perdida",
  "ptos. acumilados": "pontos_acumulados",
  "caixas produzidas": "caixas_produzidas",
  "total minutos": "total_minutos",
  "minutos de paradas": "tempo_parada",
};

// Colunas que precisam existir obrigatoriamente para o apontamento fazer sentido
const REQUIRED_DB_FIELDS = [
  "centro",
  "ordem",
  "material",
  "data_inicio",
  "linha",
  "tempo_parada",
];

function normalizeHeader(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos: "observações" -> "observacoes"
}

function parseExcelBuffer(buffer, sheetName = null) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const targetSheet = sheetName || workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(targetSheet)) {
    throw new Error(`Aba "${targetSheet}" não encontrada. Abas disponíveis: ${workbook.SheetNames.join(", ")}`);
  }

  const sheet = workbook.Sheets[targetSheet];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

  if (rows.length === 0) {
    throw new Error("Aba sem dados para importar.");
  }

  // Monta o mapa normalizado (também sem acento) para bater com COLUMN_MAP
  const normalizedMap = {};
  for (const [excelCol, dbField] of Object.entries(COLUMN_MAP)) {
    normalizedMap[normalizeHeader(excelCol)] = dbField;
  }

  // Traduz as chaves de cada linha do nome do Excel pro nome do banco
  const mappedRows = rows.map((row) => {
    const mapped = {};
    for (const [excelKey, value] of Object.entries(row)) {
      const normalizedKey = normalizeHeader(excelKey);
      const dbField = normalizedMap[normalizedKey];
      if (dbField) {
        mapped[dbField] = value;
      }
    }
    return mapped;
  });

  const foundFields = new Set(Object.keys(mappedRows[0]));
  const missing = REQUIRED_DB_FIELDS.filter((f) => !foundFields.has(f));

  if (missing.length > 0) {
    throw new Error(
      `Colunas obrigatórias ausentes no arquivo: ${missing.join(", ")}. ` +
      `Colunas encontradas: ${Object.keys(rows[0]).join(", ")}`
    );
  }

  return validateAndFormatRows(mappedRows);
}

function excelDateToISO(value) {
  if (!value) return null;

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    const hh = String(parsed.H || 0).padStart(2, "0");
    const mi = String(parsed.M || 0).padStart(2, "0");
    const ss = String(Math.floor(parsed.S || 0)).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  const parsedDate = new Date(value);
  if (isNaN(parsedDate.getTime())) return null;

  return parsedDate.toISOString().slice(0, 19).replace("T", " ");
}

function toNumberOrDefault(value, defaultValue = 0) {
  if (value === null || value === undefined || value === "") return defaultValue;
  const n = parseFloat(value);
  return isNaN(n) ? defaultValue : n;
}

function validateAndFormatRows(rows) {
  const formatted = [];

  for (const [index, row] of rows.entries()) {
    const dataInicio = excelDateToISO(row["data_inicio"]);
    const tempoParada = parseFloat(row["tempo_parada"]);

    if (!dataInicio) {
      throw new Error(`Linha ${index + 2}: campo 'Data Inicio Real' inválido ou ausente.`);
    }
    if (isNaN(tempoParada)) {
      throw new Error(`Linha ${index + 2}: campo 'Minutos de paradas' inválido.`);
    }
    if (!row["centro"] || !row["ordem"] || !row["material"] || !row["linha"]) {
      throw new Error(`Linha ${index + 2}: campos obrigatórios (centro/ordem/material/linha) ausentes.`);
    }

    formatted.push([
      row["centro"],
      row["linha"],
      row["ordem"],
      row["material"],
      row["descricao_material"] || null,
      dataInicio,
      row["turno"] ? parseInt(row["turno"], 10) : null,
      row["intervalo"] || null,
      row["tipo_parada"] || null,
      row["chave_parada"] || null,
      row["subchave_parada"] || null,
      row["chave1_parada"] || null,
      row["observacoes"] || null,
      toNumberOrDefault(row["perc_eficiencia_perdida"]),
      toNumberOrDefault(row["pontos_acumulados"]),
      parseInt(row["caixas_produzidas"], 10) || 0,
      toNumberOrDefault(row["total_minutos"]),
      tempoParada,
    ]);
  }

  return formatted;
}



module.exports = { parseExcelBuffer };