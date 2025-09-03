// src/components/AgencyPieChart.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { PieLabelProps } from "recharts/types/polar/Pie";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CountUpAnimation from "./CountUpAnimation";

type Datum = { name: string; value: number };

const COLORS = [
  "#1E40AF", // indigo-800
  "#0F766E", // teal-700
  "#7C3AED", // violet-600
  "#DC2626", // red-600
  "#D97706", // amber-600
  "#0369A1", // sky-700
  "#065F46", // emerald-700
  "#B91C1C", // red-700 (fallback)
  "#7C3AED",
  "#0EA5A4",
];

interface Props {
  data: Datum[];
  title?: string;
}

export default function AgencyPieChart({ data, title }: Props) {
  const [view, setView] = useState<"percent" | "number">("percent");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((s, d) => s + (Number(d.value) || 0), 0), [data]);

  // label hiển thị trong slice — ẩn nếu slice quá nhỏ
  const renderInnerLabel = (entry: PieLabelProps) => {
    const value = typeof entry.value === "number" ? entry.value : 0;
    const pct = typeof entry.percent === "number" ? entry.percent : (value / (total || 1));
    if (pct < 0.05) return null; // <5% ẩn label
    const text = view === "percent" ? `${Math.round(pct * 100)}%` : entry.value;
    // `entry` có cx, cy, midAngle, innerRadius, outerRadius (recharts passes these)
    const { cx, cy, midAngle, innerRadius, outerRadius } = entry as Required<Pick<PieLabelProps, "cx"|"cy"|"midAngle"|"innerRadius"|"outerRadius">>;
    const RAD = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={800}
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          letterSpacing: "0.025em"
        }}
      >
        {text}
      </text>
    );
  };

  // format tooltip depending on view
  const tooltipFormatter = (val: number) => {
    if (view === "percent") {
      const pct = ((val || 0) / (total || 1)) * 100;
      return `${pct.toFixed(1)}%`;
    }
    return val;
  };

  // center overlay when selected
  const centerOverlay = selectedIndex !== null ? (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        textAlign: "center",
        width: 220,
      }}
    >
      <div style={{ 
        fontSize: 14, 
        color: "#1f2937", 
        fontWeight: 700,
        fontFamily: "system-ui, -apple-system, sans-serif",
        letterSpacing: "0.025em"
      }}>
        {data[selectedIndex].name}
      </div>
      <div style={{ 
        fontSize: 16, 
        color: "#374151", 
        marginTop: 6,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600
      }}>
        {view === "percent" ? (
          <CountUpAnimation 
            end={Math.round((data[selectedIndex].value / (total || 1)) * 100)} 
            duration={1000} 
            suffix="%" 
          />
        ) : (
          <CountUpAnimation 
            end={data[selectedIndex].value} 
            duration={1000} 
          />
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-800">{title || "Distribution"}</h3>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">View by:</span>
          <div className="inline-flex rounded-md bg-slate-100 p-1">
            <button
              onClick={() => setView("number")}
              className={`px-3 py-1 rounded-md text-sm transition ${
                view === "number" ? "bg-white shadow text-slate-900" : "text-slate-600"
              }`}
            >
              Number
            </button>
            <button
              onClick={() => setView("percent")}
              className={`px-3 py-1 rounded-md text-sm transition ${
                view === "percent" ? "bg-white shadow text-slate-900" : "text-slate-600"
              }`}
            >
              Percent
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 360, position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            {/* Main Pie */}
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={105}
              paddingAngle={2}
              minAngle={2}
              labelLine={false}
              label={renderInnerLabel}
              onMouseEnter={(_data: unknown, index: number) => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={(_data: unknown, index: number) =>
                setSelectedIndex((prev) => (prev === index ? null : index))
              }
            >
              {data.map((entry, i) => {
                const isHovered = hoverIndex === i;
                const isSelected = selectedIndex === i;
                const transformStyle =
                  isHovered || isSelected
                    ? {
                        transform: "scale(1.05)",
                        transformOrigin: "50% 50%",
                        transition: "transform 200ms ease",
                        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.08))",
                      }
                    : { transition: "transform 200ms ease" };

                return (
                  <Cell
                    key={`cell-${i}`}
                    fill={COLORS[i % COLORS.length]}
                    // style prop allowed on SVG elements; cast as any to be safe with TS
                    style={transformStyle as any}
                  />
                );
              })}
            </Pie>

            <Tooltip
              formatter={(val: number, name: string) => [tooltipFormatter(val), name]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '13px',
                fontWeight: '500',
                paddingTop: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* center overlay when selected */}
        {centerOverlay}
      </div>
    </div>
  );
}
