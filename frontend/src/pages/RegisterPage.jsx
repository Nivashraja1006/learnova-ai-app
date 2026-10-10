import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, GraduationCap, Target, ArrowRight, AlertCircle, BookOpen, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    education_level: 'Undergraduate (B.Tech / B.E / B.Sc)',
    target_subject: 'Python Programming',
    learning_goal: 'Build core fundamentals & prepare for technical assessments'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        education_level: formData.education_level,
        target_subject: formData.target_subject,
        learning_goal: formData.learning_goal
      });
      navigate('/assessment'); // Prompt new student directly into their initial diagnostic test
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Grids and Ambient Lights */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 rounded-full blur-[140px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.15, 0.22, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-1/4 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none z-0"
      />

      <div className="w-full max-w-lg relative z-10 my-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-3 mb-2 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300 border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              LEARNOVA<span className="text-violet-400">.AI</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Create your student profile</h2>
          <p className="text-xs text-slate-400 mt-1">Initialize your adaptive AI learning roadmap</p>
        </div>

        {/* Register Card */}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@learnova.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Education Tier</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option>High School / Higher Secondary</option>
                    <option>Undergraduate (B.Tech / B.E / B.Sc)</option>
                    <option>Postgraduate (M.Tech / M.Sc / MCA)</option>
                    <option>Working Professional / Self-Taught</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Target Discipline</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="target_subject"
                    value={formData.target_subject}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option>Python Programming</option>
                    <option>Java</option>
                    <option>Web Development</option>
                    <option>Data Structures</option>
                    <option>Database Management</option>
                    <option>Machine Learning</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Primary Learning Goal</label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="learning_goal"
                  value={formData.learning_goal}
                  onChange={handleChange}
                  placeholder="e.g. Master algorithms and prepare for product company interviews"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 border border-white/20 animate-shimmer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold underline underline-offset-4">
              Sign in to your account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
