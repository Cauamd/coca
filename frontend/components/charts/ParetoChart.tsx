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
        {/* Grid: cinza sutil, visível sobre o creme, sem competir com os dados */}
        <CartesianGrid stroke="#DCC9C2" strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="modo_falha"
          tick={{ fill: "#6B5A54", fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={80}
          stroke="#9C8A82"
        />

        <YAxis
          yAxisId="left"
          tick={{ fill: "#6B5A54", fontSize: 11 }}
          stroke="#9C8A82"
          label={{
            value: "Minutos de parada",
            angle: -90,
            position: "insideLeft",
            fill: "#6B5A54",
            fontSize: 11,
          }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: "#6B5A54", fontSize: 11 }}
          stroke="#9C8A82"
          tickFormatter={(v) => `${v}%`}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(244,0,9,0.06)" }} />

        <ReferenceLine
          yAxisId="right"
          y={80}
          stroke="#A30006"
          strokeDasharray="4 4"
          label={{ value: "80%", position: "right", fill: "#A30006", fontSize: 11 }}
        />

        {/* Barra: vermelho Coca-Cola sólido, alto contraste sobre o creme */}
        <Bar yAxisId="left" dataKey="tempo_total" fill="#F40009" radius={[3, 3, 0, 0]} barSize={36} />

        {/* Linha de % acumulado: preto, para se destacar tanto das barras quanto do fundo */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="percentual_acumulado"
          stroke="#1A1A1A"
          strokeWidth={2}
          dot={{ fill: "#1A1A1A", r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}