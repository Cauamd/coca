"use client";

import {
  Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceDot,
} from "recharts";
import { SerieEvolucao } from "../../lib/api";

const CORES = ["var(--accent-red)", "var(--chart-series-2)", "#F0A030", "#3B82F6"];

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
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="evolution-primary-area" x1="0" y1="0" x2="0" y2="1">
            <stop className="evolution-gradient-top" offset="0%" stopColor="#F40009" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#F40009" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
        <XAxis dataKey="periodo" tick={{ fill: "var(--chart-text)", fontSize: 11 }} stroke="var(--chart-grid)" />
        <YAxis tick={{ fill: "var(--chart-text)", fontSize: 11 }} stroke="var(--chart-grid)" />
        <Tooltip
          contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-steel)", borderRadius: 6, color: "var(--text-primary)" }}
          labelStyle={{ color: "var(--text-primary)", fontWeight: 700 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--chart-label)" }} />
        <Area
          type="monotone"
          dataKey={series[0].equipamento}
          stroke="none"
          fill="url(#evolution-primary-area)"
          connectNulls
          isAnimationActive={false}
        />
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
