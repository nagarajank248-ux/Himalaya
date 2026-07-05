'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, UserPlus, Info } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  
  // Local Form states
  const [email, setEmail] = useState('admin@constructioncrm.com');
  const [password, setPassword] = useState('password123'); // dummy password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const success = await loginWithEmail(email);
      if (!success) {
        setErrorMsg('Invalid username or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-900/15" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-teal-400/10 blur-[120px] dark:bg-teal-900/15" />

      {/* Main card */}
      <div className="max-w-md w-full bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden p-8 space-y-6 backdrop-blur-md relative z-10 animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Builder CRM Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Log in to manage your construction leads database.
          </p>
        </div>

        {/* Info Credentials Box (Demo purposes) */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 text-xs text-slate-650 dark:text-slate-400 space-y-2">
          <p className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 shrink-0" />
            Quick Demo Access:
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <p>Admin Mode: <span className="underline font-bold text-slate-850 dark:text-slate-350">admin@constructioncrm.com</span></p>
            <p>User Mode: <span className="underline font-bold text-slate-850 dark:text-slate-350">jane@constructioncrm.com</span></p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-650 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-650 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 transition-all cursor-pointer hover:translate-y-[-1px]"
          >
            {loading ? 'Verifying...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Google Login button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-350 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
        >
          {/* Simple Google SVG Icon */}
          <svg className="h-4 w-4 mr-1 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.93a5.59 5.59 0 0 1 5.59-5.59c2.27 0 4.148 1.213 5.136 3.014l3.52-2.73C20.655 4.545 17.58 3 13.99 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 8.795-3.5 8.795-8.49a8.1 8.1 0 0 0-.145-1.515H12.24Z"
            />
          </svg>
          Google Single Sign-On
        </button>

      </div>
    </div>
  );
};
