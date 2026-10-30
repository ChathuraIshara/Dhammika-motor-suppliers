"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  CarFront,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // If already authenticated with Supabase, redirect directly to /admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/admin");
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your admin email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        // Clean user-friendly error messages
        if (authError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. Only registered admin can sign in.");
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        router.replace("/admin");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
      {/* Top bar */}
      <div className="w-full max-w-3xl px-4 pt-8 pb-4 mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#4361EE]/20 bg-[#4361EE]/10 px-4 py-2.5 text-sm font-bold text-[#3451D1] shadow-sm shadow-[#4361EE]/10 hover:border-[#4361EE]/40 hover:bg-[#4361EE]/15 hover:text-[#273A9B] transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-16">
        <div className="w-full max-w-sm mx-auto">

          {/* Profile / Brand area */}
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

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Admin Authentication
              </p>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#4361EE]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Protected
              </span>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Email Input Row */}
              <div className="flex items-center gap-3 p-3.5 bg-[#F4F6FA] rounded-2xl">
                <div className="w-9 h-9 bg-[#4361EE]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#4361EE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="admin-email"
                    className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5"
                  >
                    Admin Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm font-semibold focus:outline-none min-h-[28px]"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password Input Row */}
              <div className="flex items-center gap-3 p-3.5 bg-[#F4F6FA] rounded-2xl">
                <div className="w-9 h-9 bg-[#4361EE]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#4361EE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="admin-password"
                    className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5"
                  >
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm font-semibold focus:outline-none min-h-[28px]"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold leading-relaxed">
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
                {isLoading ? "Authenticating..." : "Sign In to Admin"}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-gray-400">
            Secure admin authentication powered by Supabase Auth
          </div>

        </div>
      </div>
    </div>
  );
}
