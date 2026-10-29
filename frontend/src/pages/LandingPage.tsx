import React from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { IdentityNetworkCanvas } from "@/components/landing/IdentityNetworkCanvas";
import { LandingHero } from "@/components/landing/LandingHero";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#060709] text-zinc-100 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 3D Restrained Animated Background Network */}
      <IdentityNetworkCanvas />

      {/* Top Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <main className="relative z-10">
        <LandingHero />
        <WorkflowSection />
        <FeaturesSection />
      </main>

      {/* Accessible Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
