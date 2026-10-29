import React from "react";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderModulePageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
}

export const PlaceholderModulePage: React.FC<PlaceholderModulePageProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1b2333] pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-[#202a3d] bg-[#0c1017] text-zinc-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-100">{title}</h1>
              {badge && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{subtitle}</p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 rounded border border-[#20293a] bg-[#0c1017] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-[#121824] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded border border-dashed border-[#1f2838] bg-[#080b10] p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded border border-[#1f2838] bg-[#0d121c] text-zinc-400">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="mt-4 text-sm font-semibold text-zinc-200">
          {title} Module Initialized
        </h2>
        <p className="mt-1.5 max-w-md text-xs text-zinc-400">
          The foundation for this module has been established in the architecture. Core models, schemas, and API routes are connected and ready for feature implementation.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Ready for Integration
          </span>
        </div>
      </div>
    </div>
  );
};
