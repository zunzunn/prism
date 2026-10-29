import React, { useState, useEffect, useCallback } from "react";
import { StateUT } from "@/types/governance";
import { STATE_LIST } from "@/data/governanceData";
import {
  fetchAnalyticsData,
  AnalyticsDashboardData,
} from "@/services/analyticsService";
import { EnrolmentTrendsChart } from "@/components/analytics/EnrolmentTrendsChart";
import { InstitutionComparisonChart } from "@/components/analytics/InstitutionComparisonChart";
import { StateSummaryChart } from "@/components/analytics/StateSummaryChart";
import { ValidationTrendsChart } from "@/components/analytics/ValidationTrendsChart";
import { UtilizationDistributionChart } from "@/components/analytics/UtilizationDistributionChart";
import { BaselineForecastCard } from "@/components/analytics/BaselineForecastCard";
import { RefreshCw } from "lucide-react";

export const AnalyticsForecastPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<StateUT | "All">("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAnalyticsData(filterState);
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, [filterState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              National Analytics & Governance Forecast
            </h1>
            <span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400">
              Multi-Year Intelligence
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Longitudinal admissions trends, state-wise capacity distributions, validation telemetry, and baseline projections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value as StateUT | "All")}
            className="rounded border border-[#1b2333] bg-[#0c1017] px-3 py-1.5 font-mono text-xs text-zinc-300 focus:border-sky-500/50 focus:outline-none"
            aria-label="Filter Analytics by State"
          >
            <option value="All">All States / National</option>
            {STATE_LIST.filter((s) => s !== "All States / UTs").map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            aria-label="Refresh Analytics"
            className="flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-[#2b374e] hover:bg-[#121926] hover:text-white"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-sky-400 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
            <span>Aggregating national analytics datasets...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Historical Trend + Campus Comparisons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EnrolmentTrendsChart data={data.yearlyTrends} />
            <InstitutionComparisonChart data={data.institutionComparisons} />
          </div>

          {/* Row 2: State Summary + Validation Trends */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StateSummaryChart data={data.stateSummaries} />
            <ValidationTrendsChart data={data.validationTrends} />
          </div>

          {/* Row 3: Auxiliary Distributions (Brackets, APAAR Outcomes, Timeliness) */}
          <UtilizationDistributionChart
            timeliness={data.submissionTimeliness}
            apaarOutcomes={data.apaarOutcomes}
            utilizationDistributions={data.utilizationDistributions}
          />

          {/* Row 4: Transparent Baseline Forecasting Card */}
          <BaselineForecastCard forecast={data.forecast} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsForecastPage;
