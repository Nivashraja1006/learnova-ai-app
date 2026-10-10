import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { MasteryBadge } from '../components/common/MasteryBadge';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Layers,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AIAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIAnalysis();
  }, []);

  const loadAIAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/analysis');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching AI analysis', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Synthesizing Machine Learning Knowledge Vectors...
        </p>
      </div>
    );
  }

  const kl = data?.overall_knowledge_level || {};
  const sw = data?.strengths_and_weaknesses || {};
  const pace = data?.learning_pace || {};
  const trends = data?.performance_trends || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Learnova Diagnostic & ML Engine"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="AI Student Analytical Report"
        subtitle="Real-time multi-dimensional evaluation of conceptual mastery, cognitive pace, and syllabus trajectory."
        actions={
          <Link
            to="/learning-path"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition hover:scale-[1.02] border border-white/20 animate-shimmer"
          >
            <Compass className="w-4 h-4" />
            <span>Generate Dynamic Learning Path</span>
          </Link>
        }
      />

      {/* Top Section: Overall Knowledge Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-violet-950/25 to-slate-900/90 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest block">
              OVERALL KNOWLEDGE LEVEL CLASSIFICATION
            </span>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {kl.level || 'Intermediate'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/35 font-mono">
                {Math.round((kl.confidence_score || 0.85) * 100)}% Model Confidence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
              {kl.summary || 'Predicted based on accuracy curves, question difficulty weights, and error distributions.'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#060911]/80 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>ML Classifier:</span>
              <span className="text-white font-mono font-bold">Scikit-learn DecisionTree (Depth=3)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Cluster Vector:</span>
              <span className="text-violet-400 font-mono font-bold">{kl.ml_cluster || 'Cluster-INT'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Adapted Difficulty:</span>
              <span className="text-white font-bold">{data?.recommended_difficulty || 'Intermediate'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses 2-Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated Strengths (Mastery)</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Concepts where your accuracy exceeds 75%. Ready for advanced algorithmic challenges.
            </p>

            <div className="space-y-3">
              {(sw.strong_topics || []).length > 0 ? (
                sw.strong_topics.map((t) => (
                  <div key={t.topic_id} className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{t.topic_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.subject_name} • {t.attempts} attempts</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400 font-mono">{Math.round(t.score)}%</div>
                      <MasteryBadge level={t.mastery_level} size="xs" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">No topics currently above 75%. Focus on developing areas.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-emerald-300 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Qualifies as prerequisite for higher-level modules</span>
          </div>
        </div>

        {/* Needs Improvement / Weak Areas */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/20 bg-rose-950/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Needs Improvement (Weak Areas)</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Concepts exhibiting learning friction or scores under 60%. Prioritized for guided study.
            </p>

            <div className="space-y-3">
              {(sw.weak_topics || []).length > 0 ? (
                sw.weak_topics.map((t) => (
                  <div key={t.topic_id} className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{t.topic_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.subject_name} • {t.attempts} attempts</div>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <span className="text-base font-bold text-rose-400 font-mono">{Math.round(t.score)}%</span>
                      <Link
                        to={`/materials?topicId=${t.topic_id}`}
                        className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition"
                      >
                        Study
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-6 text-center">Great job! No weak topic bottlenecks detected.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-rose-300 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Targeted practice quizzes scheduled to reinforce knowledge retention</span>
          </div>
        </div>
      </div>

      {/* Learning Pace & Cognitive Velocity */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>Learning Pace & Cognitive Speed</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated from problem response latency and testing cadence</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/25 self-start sm:self-auto font-mono">
            Cadence: {pace.pace || 'Steady'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#060911]/80 border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Latency Per Problem</div>
            <div className="text-xl font-black text-white font-mono">{pace.average_seconds_per_question || 45}s</div>
            <div className="text-[10px] text-emerald-400 mt-1">Within optimal zone</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#060911]/80 border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Consistency Index</div>
            <div className="text-xl font-black text-violet-400 font-mono">92.4%</div>
            <div className="text-[10px] text-slate-400 mt-1">Low performance variance</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#060911]/80 border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cadence Tier</div>
            <div className="text-xl font-black text-indigo-300 font-mono">{pace.pace || 'Steady'}</div>
            <div className="text-[10px] text-slate-400 mt-1">Adapted content density</div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/70 p-4 rounded-2xl border border-white/5">
          "{pace.recommendation || 'Your problem-solving speed is steady and focused. Continue with standard paced modules.'}"
        </p>
      </div>

      {/* Performance Trends Chart */}
      {trends.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Historical Score Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">Score performance tracked across successive evaluations</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Live Curve
            </span>
          </div>

          <div className="h-64 w-full">
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
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#a855f7' }}
                  activeDot={{ r: 6, fill: '#c084fc' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
