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
import { StateSummaryPoint } from "@/services/analyticsService";
import { formatNumber } from "@/lib/utils";

interface StateSummaryChartProps {
  data: StateSummaryPoint[];
}

export const StateSummaryChart: React.FC<StateSummaryChartProps> = ({ data }) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            State & Union Territory Governance Summary
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Regional seat capacity, student reported enrolment, and state utilization rate
          </p>
        </div>
        <span className="rounded border border-[#1e2738] bg-[#111724] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
          State Aggregation
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 35, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="state"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              width={85}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#080b11",
                border: "1px solid #1e2738",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
              formatter={(val: number) => [formatNumber(val), ""]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
            />
            <Bar
              dataKey="totalApprovedIntake"
              name="Approved Capacity"
              fill="#1e293b"
              radius={[0, 3, 3, 0]}
            />
            <Bar
              dataKey="totalReportedEnrolment"
              name="Reported Enrolment"
              fill="#0ea5e9"
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
