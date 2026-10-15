import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  User,
  GraduationCap,
  Target,
  BookOpen,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshProfile, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    education_level: '',
    preferred_learning_style: '',
    target_subject: '',
    learning_goal: ''
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSubjects();
    loadCurrentProfile();
  }, [user]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCurrentProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setFormData({
        education_level: res.data.education_level || 'Undergraduate (B.Tech / B.E / B.Sc)',
        preferred_learning_style: res.data.preferred_learning_style || 'Visual & Practical',
        target_subject: res.data.target_subject || 'Python Programming',
        learning_goal: res.data.learning_goal || 'Master Core Concepts'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      await api.put('/students/profile', formData);
      await refreshProfile();
      setSuccessMsg('Learning profile settings successfully updated!');
    } catch (e) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Account & Cognitive Parameters"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="My Learning Profile"
        subtitle="Fine-tune your academic level, cognitive learning preferences, and target discipline."
      />

      {/* Account Info Pill Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-violet-950/20 to-slate-900/90 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30 border border-white/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 uppercase">
                {user?.role || 'student'}
              </span>
              <span className="text-[10px] text-slate-500">ID: #{user?.id || 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Focus Streak</div>
            <div className="text-sm font-black text-amber-400 font-mono">
              <AnimatedNumber value={`${user?.profile?.streak_days || 1} Days`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Personalized Adaptive Settings
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Target Subject Discipline
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={formData.target_subject}
              onChange={(e) => setFormData({ ...formData, target_subject: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Academic Background Level
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={formData.education_level}
              onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
            >
              <option>High School / Higher Secondary</option>
              <option>Undergraduate (B.Tech / B.E / B.Sc)</option>
              <option>Postgraduate (M.Tech / M.Sc / MCA)</option>
              <option>Working Professional / Self-Taught</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Preferred Learning Modality
          </label>
          <select
            value={formData.preferred_learning_style}
            onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
          >
            <option>Visual & Practical Examples</option>
            <option>Problem-Solving & Quizzes First</option>
            <option>Theoretical Foundations & Syntactical Depth</option>
            <option>Fast-Paced Crash Track</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Primary Goal Statement
          </label>
          <div className="relative">
            <Target className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.learning_goal}
              onChange={(e) => setFormData({ ...formData, learning_goal: e.target.value })}
              placeholder="e.g. Master core algorithmic design patterns"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Settings...' : 'Save Learning Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
