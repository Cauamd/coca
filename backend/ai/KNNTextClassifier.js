/**
 * Classificador por similaridade (k-Nearest Neighbors sobre vetores TF-IDF).
 *
 * Ideia central, em uma frase: para classificar um texto novo, procuramos
 * os exemplos históricos MAIS PARECIDOS com ele (já classificados por um
 * humano) e repetimos a classificação deles — só se houver concordância
 * forte entre os vizinhos. Se não houver nada parecido o suficiente, ou se
 * os vizinhos discordarem entre si, o sistema se recusa a responder — em
 * vez de "chutar" uma classe, como um classificador probabilístico faria.
 *
 * Isso elimina estruturalmente o risco de "alucinação": a IA nunca inventa
 * uma classificação do nada, ela só repete padrões que já existem nos dados
 * reais revisados por um analista.
 */

const STOPWORDS = new Set([
  "DE", "DA", "DO", "DOS", "DAS", "EM", "NO", "NA", "NOS", "NAS", "COM", "PARA",
  "E", "A", "O", "OS", "AS", "POR", "SEM", "AO", "AOS", "UM", "UMA", "UNS", "UMAS",
  "FOI", "SER", "APOS", "DEVIDO", "ORDEM", "NOTA", "FEITO", "REALIZADO", "REALIZADA",
  "NECESSARIO", "GERANDO", "OCASIONANDO", "CAUSANDO", "ESTA", "ESTAVA", "SENDO",
  "QUE", "NAO", "SE", "SUA", "SEU", "MAIS", "TAMBEM",
]);

function normalizeText(text) {
  if (!text) return "";
  return text
    .toString()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const words = normalized
    .split(" ")
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]}_${words[i + 1]}`);
  }

  return [...words, ...bigrams];
}

class KNNTextClassifier {
  constructor({ k = 5, minSimilarity = 0.3, minAgreement = 0.6 } = {}) {
    this.k = k; // quantos vizinhos mais próximos considerar
    this.minSimilarity = minSimilarity; // abaixo disso, nem considera o vizinho
    this.minAgreement = minAgreement; // % dos vizinhos que precisa concordar para responder
    this.idf = new Map(); // termo -> peso idf, aprendido no treino
    this.documents = []; // [{ label, text, vector: Map, norm }]
  }

  train(examples) {
    const docFrequency = new Map(); // em quantos documentos cada termo aparece
    const tokenizedDocs = examples.map((ex) => ({ ...ex, tokens: tokenize(ex.text) }));

    for (const doc of tokenizedDocs) {
      const uniqueTerms = new Set(doc.tokens);
      for (const term of uniqueTerms) {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      }
    }

    const totalDocs = tokenizedDocs.length;
    for (const [term, df] of docFrequency) {
      // IDF clássico com suavização, para termos raros pesarem mais que comuns
      this.idf.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1);
    }

    this.documents = tokenizedDocs.map((doc) => {
      const vector = this._buildTfIdfVector(doc.tokens);
      const norm = this._vectorNorm(vector);
      return { label: doc.label, text: doc.text, vector, norm };
    });
  }

  _buildTfIdfVector(tokens) {
    const termFreq = new Map();
    for (const t of tokens) termFreq.set(t, (termFreq.get(t) || 0) + 1);

    const vector = new Map();
    for (const [term, tf] of termFreq) {
      const idf = this.idf.get(term) || 0; // termo nunca visto no treino -> peso 0
      if (idf > 0) vector.set(term, tf * idf);
    }
    return vector;
  }

  _vectorNorm(vector) {
    let sumSquares = 0;
    for (const weight of vector.values()) sumSquares += weight * weight;
    return Math.sqrt(sumSquares);
  }

  _cosineSimilarity(vecA, normA, vecB, normB) {
    if (normA === 0 || normB === 0) return 0;
    let dotProduct = 0;
    // Itera sobre o menor dos dois vetores, por eficiência
    const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];
    for (const [term, weight] of smaller) {
      const otherWeight = larger.get(term);
      if (otherWeight) dotProduct += weight * otherWeight;
    }
    return dotProduct / (normA * normB);
  }

  /**
   * Classifica um texto. Retorna null (não decide) se não houver exemplos
   * parecidos o suficiente, ou se os vizinhos mais próximos discordarem
   * entre si — nunca "chuta" uma resposta.
   */
  predict(text) {
    const tokens = tokenize(text);
    if (tokens.length === 0 || this.documents.length === 0) {
      return { label: null, confidence: 0, matches: [], motivo: "texto_vazio_ou_sem_dados" };
    }

    const queryVector = this._buildTfIdfVector(tokens);
    const queryNorm = this._vectorNorm(queryVector);

    const similarities = this.documents.map((doc) => ({
      label: doc.label,
      text: doc.text,
      similarity: this._cosineSimilarity(queryVector, queryNorm, doc.vector, doc.norm),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    const neighbors = similarities
      .slice(0, this.k)
      .filter((n) => n.similarity >= this.minSimilarity);

    if (neighbors.length === 0) {
      return { label: null, confidence: 0, matches: [], motivo: "nenhum_exemplo_parecido" };
    }

    // Votação entre os vizinhos: qual classe aparece mais entre eles
    const votes = new Map();
    for (const n of neighbors) {
      votes.set(n.label, (votes.get(n.label) || 0) + 1);
    }
    const [melhorLabel, melhorContagem] = [...votes.entries()].sort((a, b) => b[1] - a[1])[0];

    const agreement = melhorContagem / neighbors.length;
    if (agreement < this.minAgreement) {
      return {
        label: null,
        confidence: 0,
        matches: neighbors,
        motivo: "vizinhos_discordam",
      };
    }

    const agreeingNeighbors = neighbors.filter((n) => n.label === melhorLabel);
    const confidence =
      agreeingNeighbors.reduce((sum, n) => sum + n.similarity, 0) / agreeingNeighbors.length;

    return {
      label: melhorLabel,
      confidence: Math.round(confidence * 1000) / 1000,
      matches: neighbors.map((neighbor) => ({
        ...neighbor,
        votos: neighbor.label === melhorLabel,
        similarity: Math.round(neighbor.similarity * 1000) / 1000,
      })), // exemplos reais usados na decisão, com similaridade e voto
      agreement: Math.round(agreement * 1000) / 1000,
      motivo: "ok",
    };
  }

  /**
   * Avalia em dados nunca vistos. Reporta duas métricas, não só uma:
   * - cobertura: em quantos % dos casos o modelo ousou responder
   * - precisão: dentre os que respondeu, quantos % acertou
   * Isso é mais honesto que uma "acurácia" única, porque mostra o
   * trade-off real: o modelo é conservador de propósito.
   */
  evaluate(testExamples) {
    let respondeu = 0;
    let acertouQuandoRespondeu = 0;

    for (const { text, label } of testExamples) {
      const result = this.predict(text);
      if (result.label !== null) {
        respondeu++;
        if (result.label === label) acertouQuandoRespondeu++;
      }
    }

    return {
      total: testExamples.length,
      respondeu,
      cobertura: testExamples.length ? respondeu / testExamples.length : 0,
      precisaoQuandoResponde: respondeu ? acertouQuandoRespondeu / respondeu : 0,
      acertos: acertouQuandoRespondeu,
    };
  }

  toJSON() {
    return {
      k: this.k,
      minSimilarity: this.minSimilarity,
      minAgreement: this.minAgreement,
      idf: [...this.idf.entries()],
      documents: this.documents.map((d) => ({
        label: d.label,
        text: d.text,
        vector: [...d.vector.entries()],
        norm: d.norm,
      })),
    };
  }

  static fromJSON(json) {
    const clf = new KNNTextClassifier({
      k: json.k,
      minSimilarity: json.minSimilarity,
      minAgreement: json.minAgreement,
    });
    clf.idf = new Map(json.idf);
    clf.documents = json.documents.map((d) => ({
      label: d.label,
      text: d.text,
      vector: new Map(d.vector),
      norm: d.norm,
    }));
    return clf;
  }
}

module.exports = { KNNTextClassifier, normalizeText, tokenize };
