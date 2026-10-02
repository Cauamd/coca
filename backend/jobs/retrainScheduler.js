const cron = require("node-cron");
const { runTraining } = require("../scripts/train-classifier");

let isRunning = false; // evita duas execuções simultâneas se uma demorar

function logWithTimestamp(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function executarRetreinoNoturno() {
  if (isRunning) {
    logWithTimestamp("[retreino-noturno] Execução anterior ainda em andamento, pulando este ciclo.");
    return;
  }

  isRunning = true;
  logWithTimestamp("[retreino-noturno] Iniciando retreino automático da IA...");

  try {
    const report = await runTraining({ log: logWithTimestamp });
    logWithTimestamp(`[retreino-noturno] Concluído com sucesso. ${report.length} centro(s) atualizados.`);
  } catch (err) {
    logWithTimestamp(`[retreino-noturno] ERRO: ${err.message}`);
    // Não derruba o servidor — um erro no retreino não pode tirar o site do ar.
  } finally {
    isRunning = false;
  }
}

// Todo dia às 02:00 (horário do servidor) — fora do horário comercial,
// quando o volume de uploads/consultas simultâneas é baixo.
function start() {
  cron.schedule("0 2 * * *", executarRetreinoNoturno, {
    timezone: "America/Sao_Paulo",
  });
  logWithTimestamp("[retreino-noturno] Agendador iniciado — próxima execução hoje às 02:00 (horário de Brasília).");
}

module.exports = { start, executarRetreinoNoturno };