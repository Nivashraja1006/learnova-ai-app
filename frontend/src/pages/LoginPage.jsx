import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Grids and Ambient Lights */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 rounded-full blur-[140px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.15, 0.22, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none z-0"
      />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300 border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              LEARNOVA<span className="text-violet-400">.AI</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to resume your adaptive AI learning pathway</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-[#0b0f19]/90 relative overflow-hidden"
        >
          {/* Top specular highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@learnova.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Demo Mode: Click either of the 1-Click Demo buttons below to login instantly!')}
                className="text-violet-400 hover:text-violet-300 transition font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 border border-white/20 animate-shimmer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-3">
              ⚡ 1-Click Demo Quick Access
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('student@learnova.ai', 'Student@123')}
                disabled={loading}
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/40 text-left text-xs transition-all duration-200 flex items-center space-x-2.5 group cursor-pointer shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-emerald-300 text-xs">Student</div>
                  <div className="text-[10px] text-slate-400">Alex Mercer</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin@learnova.ai', 'Admin@123')}
                disabled={loading}
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/40 text-left text-xs transition-all duration-200 flex items-center space-x-2.5 group cursor-pointer shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-amber-300 text-xs">Admin</div>
                  <div className="text-[10px] text-slate-400">Faculty Lead</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold underline underline-offset-4">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
