import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { YearlyTrendPoint } from "@/services/analyticsService";
import { formatNumber } from "@/lib/utils";

interface EnrolmentTrendsChartProps {
  data: YearlyTrendPoint[];
}

export const EnrolmentTrendsChart: React.FC<EnrolmentTrendsChartProps> = ({ data }) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Multi-Year National Enrolment Trajectory
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sanctioned intake vs reported admissions vs verified APAAR identifiers (AY 2023-27)
          </p>
        </div>
        <span className="rounded border border-[#1e2738] bg-[#111724] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
          Historical Audit
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" vertical={false} />
            <XAxis
              dataKey="academicYear"
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
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
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
              dataKey="approvedIntake"
              name="Sanctioned Intake"
              fill="#1e293b"
              radius={[3, 3, 0, 0]}
              maxBarSize={45}
            />
            <Line
              type="monotone"
              dataKey="reportedEnrolment"
              name="Reported Enrolment"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="verifiedApaarCount"
              name="Verified APAAR IDs"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: "#38bdf8", r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
