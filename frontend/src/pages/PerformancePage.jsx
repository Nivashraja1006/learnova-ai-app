import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Flame,
  Target,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const PerformancePage = () => {
  const [perfData, setPerfData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const overall = perfData?.overall || {};
  const subjectBreakdown = perfData?.subject_breakdown || [];
  const topicList = perfData?.topic_performances || [];
  const trends = aiData?.performance_trends || [];

  useEffect(() => {
    loadPerformanceMetrics();
  }, []);

  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const [perfRes, aiRes] = await Promise.all([
        api.get('/students/performance'),
        api.get('/ai/analysis')
      ]);
      setPerfData(perfRes.data);
      setAiData(aiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Compiling Institutional Performance Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Real-Time Mastery Analytics"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="Comprehensive Performance Report"
        subtitle="Detailed metrics across subjects, individual concept proficiencies, historical score trajectory, and focus time."
      />

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Average Score"
          value={`${overall.average_score || 0}%`}
          icon={TrendingUp}
          subtitle="Cumulative score across all modules"
          color="indigo"
        />
        <StatCard
          title="Topics Mastered"
          value={`${overall.topics_mastered || 0} / ${overall.total_topics_tracked || 0}`}
          icon={Award}
          subtitle="Concepts demonstrating ≥75% mastery"
          color="emerald"
        />
        <StatCard
          title="Active Focus Streak"
          value={`${overall.learning_streak || 1} Days`}
          icon={Flame}
          subtitle="Consistent daily practice frequency"
          color="amber"
        />
        <StatCard
          title="Total Questions"
          value={`${overall.total_attempts || 0}`}
          icon={Clock}
          subtitle="Problem attempts evaluated by ML"
          color="purple"
        />
      </div>

      {/* Subject Breakdown & Historical Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery Breakdown */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Discipline Mastery Overview</span>
          </h3>
          <p className="text-xs text-slate-400 mb-5">Average student proficiency calculated per enrolled subject</p>

          <div className="space-y-4">
            {subjectBreakdown.length > 0 ? (
              subjectBreakdown.map((s, idx) => (
                <div key={s.subject_id || s.subject_name || idx} className="p-4 rounded-2xl bg-[#060911]/70 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{s.subject_name}</span>
                    <span className="font-mono font-bold text-violet-300">
                      <AnimatedNumber value={`${Math.round(s.average_score)}%`} />
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.min(100, Math.max(0, s.average_score))}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>{s.topics_mastered} of {s.total_topics} topics mastered</span>
                    <span>{s.total_attempts} attempts</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">No subject assessments recorded yet.</p>
            )}
          </div>
        </div>

        {/* Historical Score Trajectory */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Score Trajectory Curve</span>
              </h3>
              <p className="text-xs text-slate-400">Score progression across chronological attempts</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Curve
            </span>
          </div>

          <div className="h-64 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '16px', fontSize: '12px' }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6' }}
                    activeDot={{ r: 6, fill: '#c084fc' }}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Score trajectory will chart after submitting multiple tests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Topic Mastery Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-1">Concept Mastery Matrix</h3>
        <p className="text-xs text-slate-400 mb-6">Granular proficiency scores across every syllabus concept</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Topic Concept</th>
                <th className="pb-3 font-bold">Subject</th>
                <th className="pb-3 font-bold">Proficiency Score</th>
                <th className="pb-3 font-bold">Mastery Level</th>
                <th className="pb-3 font-bold text-right">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topicList.map((t, idx) => (
                <tr key={t.topic_id || idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 font-bold text-white pr-4">{t.topic_name}</td>
                  <td className="py-3.5 text-slate-400 pr-4">{t.subject_name}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white w-12">
                        <AnimatedNumber value={`${Math.round(t.score)}%`} />
                      </span>
                      <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, t.score))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <MasteryBadge level={t.mastery_level} size="xs" />
                  </td>
                  <td className="py-3.5 text-right text-slate-400 font-mono">{t.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
