import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ValidationHealthDistribution } from "@/types/governance";
import { CheckCircle2 } from "lucide-react";

interface ValidationHealthChartProps {
  data: ValidationHealthDistribution;
}

const COLORS = [
  "#10b981", // Emerald - Valid
  "#f59e0b", // Amber - Requiring Review
  "#ef4444", // Rose/Red - Invalid
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      percentage: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    if (!item) return null;
    return (
      <div className="rounded-xl border border-white/15 bg-[#080d19]/90 p-3 text-xs shadow-2xl backdrop-blur-xl">
        <p className="font-semibold text-white">{item.name}</p>
        <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[11px]">
          <span className="text-zinc-400">Records:</span>
          <span className="font-bold text-zinc-100">
            {item.value.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] text-emerald-400">
          <span>Proportion:</span>
          <span>{item.payload.percentage.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ValidationHealthChart: React.FC<ValidationHealthChartProps> = ({
  data,
}) => {
  const total =
    data.validRecords + data.requiringReview + data.invalidRecords;

  const validPercent = total > 0 ? (data.validRecords / total) * 100 : 0;

  const pieData = [
    {
      name: "Valid Records",
      value: data.validRecords,
      percentage: total > 0 ? (data.validRecords / total) * 100 : 0,
    },
    {
      name: "Requiring Review",
      value: data.requiringReview,
      percentage: total > 0 ? (data.requiringReview / total) * 100 : 0,
    },
    {
      name: "Invalid Records",
      value: data.invalidRecords,
      percentage: total > 0 ? (data.invalidRecords / total) * 100 : 0,
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1424]/75 p-6 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-950/40">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              Validation Status Health
            </h3>
            <p className="text-[11px] text-zinc-400">
              APAAR identity & biometric hash consistency
            </p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300 font-bold">
          {validPercent.toFixed(1)}% Pass Rate
        </span>
      </div>

      <div className="relative mt-2 h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={pieData}
              cx="50%"
              cy="48%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="#0c1424"
              strokeWidth={3}
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{
                paddingTop: "8px",
                fontSize: "11px",
                color: "#94a3b8",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Summary Label */}
        <div className="pointer-events-none absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="block font-mono text-xl font-bold text-white">
            {validPercent.toFixed(1)}%
          </span>
          <span className="block text-[9px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
            Validated
          </span>
        </div>
      </div>

      <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-zinc-400 flex items-center justify-between">
        <span>Total Records Checked:</span>
        <span className="font-mono text-zinc-200">
          {total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};
