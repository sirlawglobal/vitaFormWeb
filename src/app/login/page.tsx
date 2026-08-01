'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Loader2, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminApi.login({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      // Extract token from various response formats (NestJS sessionToken or others)
      const token =
        res?.sessionToken ||
        res?.data?.sessionToken ||
        res?.accessToken ||
        res?.token ||
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.data?.access_token;

      const user = res?.user || res?.data?.user || { email: identifier };

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setSuccessMsg('Authentication successful! Redirecting to control center...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        throw new Error('Authentication failed: No session token received from the backend.');
      }
    } catch (err: any) {
      console.error('[Login Error]:', err);
      const backendMessage =
        err?.error?.message ||
        err?.message ||
        'Invalid credentials. Please verify your admin username and password.';
      setErrorMsg(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoCredentials = () => {
    setIdentifier('admin@vitafoam.com');
    setPassword('Password123!');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Dynamic Background Glow FX */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Form Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Vitafoam Admin Center</h1>
          <p className="text-xs text-slate-400">Enterprise Backend Management Portal & Control System</p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-5">
          {errorMsg && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier (Email / Username / Phone) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@vitafoam.com or staff_id"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" /> Need test credentials?
            </span>
            <button
              type="button"
              onClick={autofillDemoCredentials}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Autofill Credentials
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Protected by Vitafoam Enterprise Role-Based Access Control (RBAC) & OAuth 2.0 / JWT
        </p>
      </div>
    </div>
  );
}
