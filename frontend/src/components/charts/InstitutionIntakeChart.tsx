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
import { InstitutionIntakeComparison } from "@/types/governance";
import { Building2 } from "lucide-react";

interface InstitutionIntakeChartProps {
  data: InstitutionIntakeComparison[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-[#1e2738] bg-[#0c1017] p-3 text-xs shadow-xl backdrop-blur-md">
        <p className="font-semibold text-zinc-100 max-w-[240px]">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4 font-mono text-[11px]"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-zinc-400">{entry.name}:</span>
              </div>
              <span className="font-semibold text-zinc-200">
                {entry.value.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const InstitutionIntakeChart: React.FC<InstitutionIntakeChartProps> = ({
  data,
}) => {
  // Format short names for chart X axis
  const chartData = data.map((item) => ({
    ...item,
    shortName:
      item.name.length > 20 ? `${item.name.slice(0, 18)}...` : item.name,
  }));

  return (
    <div className="flex flex-col justify-between rounded border border-[#182130] bg-[#0c1017] p-5">
      <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#1f2838] bg-[#111722] text-emerald-400">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">
              Intake Utilization by Top Institutions
            </h3>
            <p className="text-[11px] text-zinc-400">
              Approved intake capacity vs reported admissions
            </p>
          </div>
        </div>
        <span className="rounded border border-[#1f2838] bg-[#0f141f] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
          Capacity Audit
        </span>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#182030"
              vertical={false}
            />
            <XAxis
              dataKey="shortName"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "12px",
                fontSize: "11px",
                color: "#94a3b8",
              }}
            />
            <Bar
              name="Approved Intake"
              dataKey="approvedIntake"
              fill="#334155"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              name="Reported Enrolment"
              dataKey="reportedEnrolment"
              fill="#10b981"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 border-t border-[#141b27] pt-2 text-[10px] text-zinc-400 flex items-center justify-between">
        <span>* Supernumerary quotas permitted per AICTE approval handbook</span>
        <span className="font-mono text-emerald-400">Top 7 Campuses</span>
      </div>
    </div>
  );
};
