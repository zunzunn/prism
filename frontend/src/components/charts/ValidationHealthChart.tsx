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
      <div className="rounded border border-[#1e2738] bg-[#0c1017] p-2.5 text-xs shadow-xl backdrop-blur-md">
        <p className="font-semibold text-zinc-100">{item.name}</p>
        <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[11px]">
          <span className="text-zinc-400">Records:</span>
          <span className="font-bold text-zinc-200">
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
    <div className="flex flex-col justify-between rounded border border-[#182130] bg-[#0c1017] p-5">
      <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#1f2838] bg-[#111722] text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">
              Validation Status Health
            </h3>
            <p className="text-[11px] text-zinc-400">
              APAAR identity & biometric hash consistency
            </p>
          </div>
        </div>
        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
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
              stroke="#0c1017"
              strokeWidth={2}
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
          <span className="block font-mono text-xl font-bold text-zinc-100">
            {validPercent.toFixed(1)}%
          </span>
          <span className="block text-[9px] font-mono tracking-wider text-emerald-400 uppercase">
            Validated
          </span>
        </div>
      </div>

      <div className="mt-2 border-t border-[#141b27] pt-2 text-[10px] text-zinc-400 flex items-center justify-between">
        <span>Total Records Checked:</span>
        <span className="font-mono text-zinc-200">
          {total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};
