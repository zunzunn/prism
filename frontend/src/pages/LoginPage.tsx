import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Fingerprint,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  UserCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import { useRole, DEMO_PROFILES } from "@/context/RoleContext";
import { UserRole } from "@/types/governance";

export const LoginPage: React.FC = () => {
  const { login } = useRole();

  const [selectedRole, setSelectedRole] = useState<UserRole>("AICTE Admin");
  const [email, setEmail] = useState("admin@aicte.gov.in");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [twoFactorSimulated, setTwoFactorSimulated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_PROFILES[role].email);
    setPassword("••••••••••••");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter an email address or academic ID.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login(email, password, selectedRole);
    } catch {
      setErrorMsg("Authentication failed. Please verify credentials or select a demo profile.");
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    handleSelectRole(role);
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login(DEMO_PROFILES[role].email, "demo-pass", role);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <header className="border-b border-[#182030] bg-[#07090e]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/70 transition-colors">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                CREDEN
              </span>
              <span className="text-[9px] font-semibold tracking-tight text-zinc-400 uppercase">
                AICTE Academic Governance
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/verification"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
              <span>Public Verification</span>
            </Link>
            <Link
              to="/"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient backlight glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-[130px]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Context & 1-Click Demo Profiles */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Multi-Persona Demonstration</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Authorized Sign In
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Log in to inspect institutional records, manage statutory intake, or test real-time credential verification.
              </p>
            </div>

            {/* Quick Demo Access Pills */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                1-Click Demonstration Personas
              </span>

              {/* Persona 1: AICTE Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin("AICTE Admin")}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                  selectedRole === "AICTE Admin"
                    ? "border-emerald-500/60 bg-[#0e171f] ring-1 ring-emerald-500/30"
                    : "border-[#1b2333] bg-[#090d14] hover:border-[#2d3a52] hover:bg-[#0d131f]"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    AD
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white">AICTE Central Admin</p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">admin@aicte.gov.in</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>

              {/* Persona 2: Institution Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin("Institution Admin")}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                  selectedRole === "Institution Admin"
                    ? "border-sky-500/60 bg-[#0c1626] ring-1 ring-sky-500/30"
                    : "border-[#1b2333] bg-[#090d14] hover:border-[#2d3a52] hover:bg-[#0d131f]"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sky-500/20 text-sky-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white">Institution Registrar (COEP)</p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">registrar@coep.ac.in</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>

              {/* Persona 3: Authorized Verifier */}
              <button
                type="button"
                onClick={() => handleQuickLogin("Authorized Verifier")}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                  selectedRole === "Authorized Verifier"
                    ? "border-amber-500/60 bg-[#19150b] ring-1 ring-amber-500/30"
                    : "border-[#1b2333] bg-[#090d14] hover:border-[#2d3a52] hover:bg-[#0d131f]"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white">Authorized Verifier (TCS HR)</p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">verifications@tcs.com</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>

              {/* Persona 4: Student */}
              <button
                type="button"
                onClick={() => handleQuickLogin("Student")}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                  selectedRole === "Student"
                    ? "border-violet-500/60 bg-[#151124] ring-1 ring-violet-500/30"
                    : "border-[#1b2333] bg-[#090d14] hover:border-[#2d3a52] hover:bg-[#0d131f]"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-violet-500/20 text-violet-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white">Student (Aarav Sharma)</p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">aarav.sharma@students.aicte.gov.in</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Column: Credentials Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Terminal Authentication</h2>
                  <p className="text-xs text-zinc-300">Enter access parameters or choose a role above.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SSO v2.4
                </span>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Target Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Target Role Profile
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleSelectRole(e.target.value as UserRole)}
                    className="w-full rounded-lg border border-[#232f44] bg-[#070b12] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="AICTE Admin">AICTE Admin — National Regulatory Dashboard</option>
                    <option value="Institution Admin">Institution Admin — Campus Student Records</option>
                    <option value="Authorized Verifier">Authorized Verifier — External Background Checks</option>
                    <option value="Student">Student — Academic Identity & Verification Pass</option>
                  </select>
                </div>

                {/* Email / Academic ID Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email or Institutional ID
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@aicte.gov.in"
                      className="w-full rounded-lg border border-[#232f44] bg-[#070b12] pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Security Password
                    </label>
                    <span className="text-[11px] text-zinc-400">Any password accepted for demo</span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-[#232f44] bg-[#070b12] pl-9 pr-10 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Additional Demo Checkboxes */}
                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={twoFactorSimulated}
                      onChange={(e) => setTwoFactorSimulated(e.target.checked)}
                      className="rounded border-[#2a364d] bg-[#0c121e] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="flex items-center gap-1.5">
                      <span>Simulate AICTE Hardware Security Key / 2FA check</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#2a364d] bg-[#0c121e] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Persist terminal token in browser session</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#070b12] disabled:opacity-60 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Security Token...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize & Enter Platform</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Regulatory Notice Footer */}
              <div className="mt-6 border-t border-[#1a2333] pt-4 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>AICTE Academic Identity Core</span>
                <span className="font-mono text-emerald-400/90">Protocol TLS 1.3 / AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-[#182030] bg-[#07090e] px-6 py-4 text-xs text-zinc-300 text-center">
        <p>© 2026 CREDEN — All India Council for Technical Education. Demonstration Environment.</p>
      </footer>
    </div>
  );
};
