const ExcelJS = require("exceljs");

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function buildApontamentosWorkbook(rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dashboard de Confiabilidade";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Apontamentos", {
    views: [{ state: "frozen", ySplit: 1 }], // congela o cabeçalho ao rolar
  });

  sheet.columns = [
    { header: "Data Início", key: "data_inicio", width: 18 },
    { header: "Centro", key: "centro", width: 10 },
    { header: "Linha", key: "linha", width: 12 },
    { header: "Ordem", key: "ordem", width: 14 },
    { header: "Material", key: "material", width: 12 },
    { header: "Descrição Material", key: "descricao_material", width: 30 },
    { header: "Tipo de Parada", key: "tipo_parada", width: 16 },
    { header: "Equipamento", key: "chave_parada", width: 24 },
    { header: "Observações", key: "observacoes", width: 40 },
    { header: "Modo de Falha", key: "modo_falha_padrao", width: 22 },
    { header: "Turno", key: "turno", width: 8 },
    { header: "Tempo de Parada (min)", key: "tempo_parada", width: 18 },
    { header: "Total Minutos", key: "total_minutos", width: 14 },
  ];

  // Cabeçalho estilizado
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF40009" } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;

  rows.forEach((row) => {
    sheet.addRow({
      data_inicio: formatDate(row.data_inicio),
      centro: row.centro,
      linha: row.linha,
      ordem: row.ordem,
      material: row.material,
      descricao_material: row.descricao_material,
      tipo_parada: row.tipo_parada,
      chave_parada: row.chave_parada,
      observacoes: row.observacoes,
      modo_falha_padrao: row.modo_falha_padrao || "Não classificado",
      turno: row.turno,
      tempo_parada: Number(row.tempo_parada),
      total_minutos: Number(row.total_minutos),
    });
  });

  // Zebra striping leve + borda fina em todas as linhas de dado
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
    });
    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F7F7" } };
      });
    }
  });

  // Autofiltro no cabeçalho — permite filtrar/ordenar direto no Excel
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  return workbook;
}

module.exports = { buildApontamentosWorkbook };