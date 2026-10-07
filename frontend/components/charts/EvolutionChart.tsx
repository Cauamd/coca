"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceDot,
} from "recharts";
import { SerieEvolucao } from "../../lib/api";

const CORES = ["#F40009", "#4C9A6A", "#F0A030", "#3B82F6"];

interface Props {
  series: SerieEvolucao[];
  metrica: "tempo_total" | "qtd_falhas" | "mttr";
}

export default function EvolutionChart({ series, metrica }: Props) {
  if (series.length === 0 || series[0].pontos.length === 0) {
    return <div className="chart-empty">Sem histórico suficiente para exibir evolução.</div>;
  }

  // Monta um dataset unificado por período (necessário para múltiplas linhas no mesmo gráfico)
  const periodosSet = new Set<string>();
  series.forEach((s) => s.pontos.forEach((p) => periodosSet.add(p.periodo)));
  const periodos = [...periodosSet].sort();

  const data = periodos.map((periodo) => {
    const row: any = { periodo };
    series.forEach((s) => {
      const ponto = s.pontos.find((p) => p.periodo === periodo);
      row[s.equipamento] = ponto ? ponto[metrica] : null;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid stroke="#2D2D35" strokeDasharray="3 3" />
        <XAxis dataKey="periodo" tick={{ fill: "#F5F5F7", fontSize: 11 }} stroke="#3A3A44" />
        <YAxis tick={{ fill: "#F5F5F7", fontSize: 11 }} stroke="#3A3A44" />
        <Tooltip
          contentStyle={{ background: "#131316", border: "1px solid #F40009", borderRadius: 6 }}
          labelStyle={{ color: "#fff", fontWeight: 700 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9898A0" }} />
        {series.map((s, i) => (
          <Line
            key={s.equipamento}
            type="monotone"
            dataKey={s.equipamento}
            stroke={CORES[i % CORES.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}