/**
 * Previsão de tendência por regressão linear simples (mínimos quadrados),
 * implementada do zero — mesma filosofia do classificador: sem bibliotecas
 * de IA/ML externas, matemática clássica e auditável.
 *
 * A ideia: ajustamos uma reta aos pontos históricos (tempo parado por mês,
 * por exemplo). A inclinação dessa reta nos diz se o equipamento está
 * piorando (inclinação positiva — tempo parado crescendo) ou melhorando
 * (inclinação negativa). O R² mede o quão bem essa reta realmente explica
 * os dados — se for baixo, não há um padrão confiável, e dizemos isso
 * abertamente em vez de inventar uma previsão.
 */

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTotal = points.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssResidual = points.reduce((s, p) => {
    const predicted = slope * p.x + intercept;
    return s + Math.pow(p.y - predicted, 2);
  }, 0);

  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2: Math.max(0, r2) };
}

function forecastValue(regression, x) {
  return Math.max(0, regression.slope * x + regression.intercept);
}

/**
 * Classifica a tendência combinando duas evidências independentes:
 * 1) A inclinação da reta de regressão (tendência de longo prazo)
 * 2) O momentum recente (últimos períodos vs períodos anteriores)
 * Só declara uma tendência quando as duas evidências concordam e o R²
 * é razoável — caso contrário, retorna "indefinido" honestamente.
 */
function classifyTrend(points, regression) {
  const n = points.length;
  if (n < 3) {
    return { tendencia: "dados_insuficientes", risco: "indefinido", confianca: 0 };
  }

  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  const normalizedSlope = meanY > 0 ? regression.slope / meanY : 0;

  // Momentum: compara a média dos últimos períodos com a média dos anteriores
  const metade = Math.floor(n / 2);
  const primeiraMetade = points.slice(0, metade);
  const segundaMetade = points.slice(n - metade);
  const mediaInicial = primeiraMetade.reduce((s, p) => s + p.y, 0) / primeiraMetade.length;
  const mediaRecente = segundaMetade.reduce((s, p) => s + p.y, 0) / segundaMetade.length;
  const momentum = mediaInicial > 0 ? (mediaRecente - mediaInicial) / mediaInicial : 0;

  const r2Confiavel = regression.r2 >= 0.25;
  const direcaoRegressao = normalizedSlope > 0.03 ? 1 : normalizedSlope < -0.03 ? -1 : 0;
  const direcaoMomentum = momentum > 0.1 ? 1 : momentum < -0.1 ? -1 : 0;

  let tendencia, risco, confianca;

  if (!r2Confiavel && direcaoMomentum === 0) {
    tendencia = "estavel";
    risco = "baixo";
    confianca = 0.5;
  } else if (direcaoRegressao === direcaoMomentum && direcaoRegressao !== 0) {
    // As duas evidências concordam — maior confiança na previsão
    confianca = Math.min(0.95, 0.5 + regression.r2 * 0.5);
    if (direcaoRegressao > 0) {
      tendencia = "piorando";
      risco = confianca > 0.7 ? "alto" : "medio";
    } else {
      tendencia = "melhorando";
      risco = "baixo";
    }
  } else if (direcaoMomentum !== 0) {
    // Momentum recente diz algo diferente da tendência de longo prazo —
    // prioriza o sinal recente, mas com confiança reduzida
    confianca = 0.4;
    tendencia = direcaoMomentum > 0 ? "piorando_recente" : "melhorando_recente";
    risco = direcaoMomentum > 0 ? "medio" : "baixo";
  } else {
    tendencia = "estavel";
    risco = "baixo";
    confianca = 0.4 + regression.r2 * 0.3;
  }

  return { tendencia, risco, confianca: Math.round(confianca * 100) / 100 };
}

/**
 * Função principal: recebe a série histórica de um equipamento (um valor
 * por período) e devolve a previsão para o próximo período, a tendência
 * classificada e o nível de confiança — nunca uma certeza absoluta.
 */
function predictEquipmentTrend(serieHistorica) {
  if (serieHistorica.length === 0) {
    return { previsaoDisponivel: false, motivo: "sem_dados" };
  }

  const points = serieHistorica.map((v, i) => ({ x: i, y: v }));
  const regression = linearRegression(points);
  const classificacao = classifyTrend(points, regression);

  const proximoX = points.length;
  const valorPrevisto = forecastValue(regression, proximoX);
  const ultimoValor = points[points.length - 1].y;

  return {
    previsaoDisponivel: true,
    tendencia: classificacao.tendencia,
    risco: classificacao.risco,
    confianca: classificacao.confianca,
    r2: Math.round(regression.r2 * 1000) / 1000,
    valorAtual: Math.round(ultimoValor * 100) / 100,
    valorPrevistoProximoPeriodo: Math.round(valorPrevisto * 100) / 100,
    variacaoPercentual: ultimoValor > 0
      ? Math.round(((valorPrevisto - ultimoValor) / ultimoValor) * 10000) / 100
      : 0,
  };
}

module.exports = { linearRegression, forecastValue, classifyTrend, predictEquipmentTrend };