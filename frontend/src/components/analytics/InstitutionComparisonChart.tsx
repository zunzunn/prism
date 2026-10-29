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
import { InstitutionComparisonPoint } from "@/services/analyticsService";
import { formatNumber } from "@/lib/utils";

interface InstitutionComparisonChartProps {
  data: InstitutionComparisonPoint[];
}

export const InstitutionComparisonChart: React.FC<InstitutionComparisonChartProps> = ({
  data,
}) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Campus-Level Intake vs Enrolment Distribution
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Institutional capacity breakdown with regular and supernumerary admissions
          </p>
        </div>
        <span className="rounded border border-[#1e2738] bg-[#111724] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
          Top Campuses
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="#64748b"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={45}
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
              formatter={(val: number) => [formatNumber(val), ""]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
            />
            <Bar
              dataKey="approvedIntake"
              name="Sanctioned Intake"
              fill="#223249"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="reportedEnrolment"
              name="Reported Enrolment"
              fill="#10b981"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="supernumeraryEnrolled"
              name="Supernumerary Enrolled"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
