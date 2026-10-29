import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ValidationIssueTrendPoint } from "@/services/analyticsService";

interface ValidationTrendsChartProps {
  data: ValidationIssueTrendPoint[];
}

export const ValidationTrendsChart: React.FC<ValidationTrendsChartProps> = ({ data }) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Validation Anomaly Trends Across Admission Cycles
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quarterly volume of detected APAAR errors, duplicate conflicts, and quota breaches
          </p>
        </div>
        <span className="rounded border border-[#1e2738] bg-[#111724] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
          Deterministic Rule Engine
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#080b11",
                border: "1px solid #1e2738",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
            />
            <Bar
              dataKey="apaarIssues"
              name="APAAR Syntax / Missing"
              fill="#f43f5e"
              stackId="a"
            />
            <Bar
              dataKey="duplicateConflicts"
              name="Duplicate Enrolments"
              fill="#fb923c"
              stackId="a"
            />
            <Bar
              dataKey="intakeBreaches"
              name="Intake Over-Capacity"
              fill="#eab308"
              stackId="a"
            />
            <Bar
              dataKey="dataConsistencyIssues"
              name="Data Consistency / Schema"
              fill="#38bdf8"
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
