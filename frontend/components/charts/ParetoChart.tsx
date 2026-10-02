"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ParetoItem } from "../../lib/api";

interface Props {
  data: ParetoItem[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload as ParetoItem;

  return (
    <div className="pareto-tooltip">
      <p className="pareto-tooltip-title">{label}</p>
      <div className="pareto-tooltip-row">
        <span>Tempo parado</span>
        <strong>{item.tempo_total.toFixed(1)} min</strong>
      </div>
      <div className="pareto-tooltip-row">
        <span>Ocorrências</span>
        <strong>{item.qtd_falhas}</strong>
      </div>
      <div className="pareto-tooltip-row">
        <span>% do total</span>
        <strong>{item.percentual.toFixed(1)}%</strong>
      </div>
      <div className="pareto-tooltip-row">
        <span>% acumulado</span>
        <strong>{item.percentual_acumulado.toFixed(1)}%</strong>
      </div>
    </div>
  );
}

export default function ParetoChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="chart-empty">Sem dados classificados para exibir.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 60 }}>
        {/* Grid: cinza claro sutil, visível sobre o fundo escuro sem competir com os dados */}
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="modo_falha"
          tick={{ fill: "var(--chart-text)", fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={80}
          stroke="var(--chart-grid)"
        />

        <YAxis
          yAxisId="left"
          tick={{ fill: "var(--chart-text)", fontSize: 11 }}
          stroke="var(--chart-grid)"
          label={{
            value: "Minutos de parada",
            angle: -90,
            position: "insideLeft",
            fill: "var(--chart-label)",
            fontSize: 11,
          }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: "var(--chart-text)", fontSize: 11 }}
          stroke="var(--chart-grid)"
          tickFormatter={(v) => `${v}%`}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(244,0,9,0.08)" }} />

        {/* Linha de referência dos 80%: âmbar, a cor de "atenção" que mais se
            destaca contra fundo escuro + barras vermelhas + linha branca */}
        <ReferenceLine
          yAxisId="right"
          y={80}
          stroke="#FFB74D"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          label={{ value: "80%", position: "right", fill: "#FFB74D", fontSize: 11, fontWeight: 600 }}
        />

        {/* Barra: vermelho Coca-Cola, alto contraste sobre o fundo escuro */}
        <Bar yAxisId="left" dataKey="tempo_total" fill="#F40009" radius={[3, 3, 0, 0]} barSize={36} />

        {/* Linha de % acumulado: branco puro, a linha mais importante do
            gráfico — precisa se destacar de tudo, inclusive das barras */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="percentual_acumulado"
          stroke="var(--chart-line)"
          strokeWidth={2.5}
          dot={{ fill: "var(--chart-text)", r: 3.5, strokeWidth: 0 }}
          activeDot={{ fill: "#FFB74D", r: 5, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
