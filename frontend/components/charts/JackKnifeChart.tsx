"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { JackKnifePonto } from "../../lib/api";

interface Props {
  data: JackKnifePonto[];
  limiteQ: number;
  limiteMttr: number;
  onPointClick?: (ponto: JackKnifePonto) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "CRÍTICO-CRÔNICO": "#F0A030",
  "CRÍTICO": "#D9534F",
  "CRÔNICO": "#4C9A6A",
  "CONFORTO": "#5C6577",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0].payload as JackKnifePonto;

  return (
    <div className="pareto-tooltip">
      <p className="pareto-tooltip-title">{p.equipamento}</p>
      <div className="pareto-tooltip-row"><span>Linha</span><strong>{p.linha}</strong></div>
      <div className="pareto-tooltip-row"><span>Nº de falhas</span><strong>{p.q}</strong></div>
      <div className="pareto-tooltip-row"><span>MTTR</span><strong>{p.mttr.toFixed(1)} min</strong></div>
      <div className="pareto-tooltip-row"><span>Tempo total</span><strong>{p.tempo_total.toFixed(1)} min</strong></div>
      <div className="pareto-tooltip-row">
        <span>Categoria</span>
        <strong style={{ color: CATEGORY_COLORS[p.categoria] }}>{p.categoria}</strong>
      </div>
      <div className="pareto-tooltip-hint">Clique para ver os apontamentos</div>
    </div>
  );
}

function AnimatedDot(props: any) {
  const { cx, cy, fill, isHovered } = props;
  const radius = isHovered ? 10 : 6;

  return (
    <g>
      {isHovered && (
        <circle cx={cx} cy={cy} r={radius + 6} fill={fill} opacity={0.18} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        fillOpacity={0.9}
        stroke={isHovered ? "#1A1A1A" : "#FFFFFF"}
        strokeWidth={isHovered ? 1.5 : 1}
        style={{ transition: "r 0.18s cubic-bezier(0.22,1,0.36,1), stroke-width 0.18s ease" }}
      />
    </g>
  );
}

export default function JackKnifeChart({ data, limiteQ, limiteMttr, onPointClick }: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (data.length === 0) {
    return <div className="chart-empty">Sem dados de equipamento para exibir.</div>;
  }

  const safeData = data.map((p) => ({
    ...p,
    q: p.q <= 0 ? 0.1 : p.q,
    mttr: p.mttr <= 0 ? 0.1 : p.mttr,
    _key: `${p.linha}-${p.equipamento}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={460}>
      <ScatterChart margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
        <CartesianGrid stroke="#DCC9C2" strokeDasharray="3 3" />

        <XAxis
          type="number"
          dataKey="q"
          name="Nº de falhas"
          scale="log"
          domain={["auto", "auto"]}
          tick={{ fill: "#6B5A54", fontSize: 11 }}
          stroke="#9C8A82"
          label={{ value: "Nº de falhas (frequência)", position: "insideBottom", offset: -10, fill: "#6B5A54", fontSize: 11 }}
        />

        <YAxis
          type="number"
          dataKey="mttr"
          name="MTTR"
          scale="log"
          domain={["auto", "auto"]}
          tick={{ fill: "#6B5A54", fontSize: 11 }}
          stroke="#9C8A82"
          label={{ value: "MTTR (min)", angle: -90, position: "insideLeft", fill: "#6B5A54", fontSize: 11 }}
        />

        <ZAxis range={[60, 60]} />

        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#9C8A82" }} />

        <ReferenceLine x={limiteQ} stroke="#A38076" strokeDasharray="4 4" label={{ value: `${limiteQ}`, position: "top", fill: "#6B5A54", fontSize: 10 }} />
        <ReferenceLine y={limiteMttr} stroke="#A38076" strokeDasharray="4 4" label={{ value: `${limiteMttr}`, position: "right", fill: "#6B5A54", fontSize: 10 }} />

        <Scatter
          data={safeData}
          cursor={onPointClick ? "pointer" : "default"}
          onClick={(entry) => {
            if (onPointClick && entry && entry.payload) {
              onPointClick(entry.payload as JackKnifePonto);
            }
          }}
          onMouseEnter={(entry: any) => setHoveredKey(entry?.payload?._key ?? null)}
          onMouseLeave={() => setHoveredKey(null)}
          shape={(props: any) => (
            <AnimatedDot
              {...props}
              fill={CATEGORY_COLORS[props.payload.categoria]}
              isHovered={props.payload._key === hoveredKey}
            />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}