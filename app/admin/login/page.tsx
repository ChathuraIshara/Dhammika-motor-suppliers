"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, KeyRound, ShieldCheck, UserRound, CarFront } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminName.trim()) { setError("Please enter your name"); return; }
    if (!pin.trim()) { setError("Please enter a PIN or password"); return; }
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("dhammika_admin_auth", "true");
        sessionStorage.setItem("dhammika_admin_name", adminName.trim());
      }
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
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4361EE] via-[#3B50C8] to-[#273A9B] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#4361EE]/30 text-white overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-white/15" />
              <div className="absolute -left-4 -bottom-4 w-12 h-12 rounded-full bg-white/10" />
              <CarFront className="w-10 h-10" strokeWidth={2.25} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-gray-900">Dhammika Motor </span>
              <span className="bg-gradient-to-r from-[#4361EE] to-[#6D7FF2] bg-clip-text text-transparent">
                Suppliers
              </span>
            </h1>
            <p className="text-sm font-semibold text-gray-400 mt-1">Admin Portal</p>
          </div>

          {/* Login Card — styled like reference white card list */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Access Credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Admin Name Input Row */}
              <div className="flex items-center gap-3 p-3.5 bg-[#F4F6FA] rounded-2xl">
                <div className="w-9 h-9 bg-[#4361EE]/10 rounded-xl flex items-center justify-center shrink-0">
                  <UserRound className="w-4 h-4 text-[#4361EE]" />
                </div>
                <div className="flex-1">
                  <label htmlFor="admin-name" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    Admin Name
                  </label>
                  <input
                    id="admin-name"
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base font-semibold focus:outline-none min-h-[28px]"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

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

        </div>
      </div>
    </div>
  );
}
