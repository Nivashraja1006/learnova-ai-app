import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  FileQuestion,
  ShieldCheck,
  FolderTree,
  Layers,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = useMemo(() => [
    { name: 'Assessments', value: metrics?.total_assessments || 0, color: '#6366f1' },
    { name: 'Quizzes', value: metrics?.total_quizzes || 0, color: '#8b5cf6' },
    { name: 'Materials', value: metrics?.total_materials || 0, color: '#10b981' },
    { name: 'Questions', value: metrics?.total_questions || 0, color: '#f59e0b' }
  ], [metrics]);

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Loading Administrative Analytics Console...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Administrative Oversight Console"
        badgeIcon={ShieldCheck}
        badgeColor="amber"
        title="Institutional Learning Analytics"
        subtitle="Monitor cohort performance, curriculum materials, conceptual difficulty hotspots, and curate the question bank."
        actions={
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/questions"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add MCQ</span>
            </Link>
            <Link
              to="/admin/materials"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 glass-panel hover:bg-slate-800 border border-white/10 transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </Link>
          </div>
        }
      />

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={metrics.total_students || 0}
          icon={Users}
          subtitle="Enrolled active learners"
          color="indigo"
        />
        <StatCard
          title="Platform Average"
          value={`${Math.round(metrics.average_platform_score || 0)}%`}
          icon={TrendingUp}
          subtitle="Cohort average across tests"
          color="purple"
        />
        <StatCard
          title="Question Bank Bank"
          value={metrics.total_questions || 0}
          icon={FileQuestion}
          subtitle="Active MCQs across disciplines"
          color="amber"
        />
        <StatCard
          title="Curriculum Modules"
          value={metrics.total_materials || 0}
          icon={BookOpen}
          subtitle="Structured learning notes"
          color="emerald"
        />
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Content Distribution Donut (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Platform Asset Distribution</h3>
              <p className="text-xs text-slate-400">Total volume of questions, quizzes, and learning notes</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Repository Sync
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Difficult Concept Alert Card (1 col) */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-rose-500/20 bg-rose-950/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Syllabus Friction Hotspot</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/20 mb-4">
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Most Difficult Topic:</div>
              <h4 className="text-lg font-black text-rose-300">
                {metrics.most_difficult_topic || 'Exception Handling'}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Students have experienced the highest error rate on this concept. Consider adding additional practice MCQs and visual notes.
            </p>
          </div>

          <div className="space-y-2 mt-6 pt-4 border-t border-white/5">
            <Link
              to="/admin/questions"
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition block shadow-sm"
            >
              Add MCQs to This Topic →
            </Link>
            <Link
              to="/admin/materials"
              className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-slate-300 glass-panel hover:bg-slate-800 transition block border border-white/10"
            >
              Create Study Note
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
