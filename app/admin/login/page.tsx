"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin.trim()) { setError("Please enter a PIN or password"); return; }
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") sessionStorage.setItem("dhammika_admin_auth", "true");
      setTimeout(() => router.push("/admin"), 300);
    } catch { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-12 pb-4 max-w-sm mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors min-h-[44px]"
        >
          <div className="w-9 h-9 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-16">
        <div className="w-full max-w-sm mx-auto">

          {/* Profile / Brand area — like reference Settings page */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-[#4361EE] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#4361EE]/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Dhammika Motor Suppliers</p>
          </div>

          {/* Login Card — styled like reference white card list */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Access Credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* PIN Input Row */}
              <div className="flex items-center gap-3 p-3.5 bg-[#F4F6FA] rounded-2xl">
                <div className="w-9 h-9 bg-[#4361EE]/10 rounded-xl flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-[#4361EE]" />
                </div>
                <div className="flex-1">
                  <label htmlFor="admin-pin" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    PIN / Password
                  </label>
                  <input
                    id="admin-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base font-semibold focus:outline-none min-h-[28px]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Hint */}
              <p className="text-[11px] text-gray-400 flex items-center gap-1 px-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Any PIN (e.g. 1234) grants prototype access.
              </p>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#4361EE] hover:bg-[#3451D1] disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-[#4361EE]/25 transition-all text-sm min-h-[52px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Quick presets card */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Quick Test Credentials
              </p>
            </div>
            <div className="flex gap-0 divide-x divide-gray-100">
              <button
                type="button"
                onClick={() => setPin("1234")}
                className="flex-1 py-4 text-center cursor-pointer hover:bg-[#F4F6FA] transition-colors"
              >
                <p className="text-xs font-bold text-gray-900 font-mono">1234</p>
                <p className="text-[10px] text-gray-400 mt-0.5">PIN</p>
              </button>
              <button
                type="button"
                onClick={() => setPin("admin")}
                className="flex-1 py-4 text-center cursor-pointer hover:bg-[#F4F6FA] transition-colors"
              >
                <p className="text-xs font-bold text-gray-900 font-mono">admin</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Password</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
