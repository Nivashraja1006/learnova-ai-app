import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import {
  TrendingUp,
  Award,
  Flame,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  Clock,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [perfRes, recRes, aiRes, pathRes] = await Promise.all([
        api.get('/students/performance'),
        api.get('/ai/recommendations'),
        api.get('/ai/analysis'),
        api.get('/ai/learning-path')
      ]);
      setPerformance(perfRes.data);
      setRecommendations(recRes.data);
      setAiAnalysis(aiRes.data);
      setLearningPath(pathRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAI = async () => {
    try {
      setRefreshing(true);
      await api.post('/ai/recommendations/refresh');
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const overall = performance?.overall || {};
  const primaryRec = recommendations[0] || null;
  const targetGoal = learningPath?.target_goal || user?.profile?.learning_goal || "Master Core Concepts";

  const topicChartData = useMemo(() => {
    return (performance?.topic_performances || []).slice(0, 6).map(t => ({
      name: t.topic_name.length > 14 ? t.topic_name.substring(0, 12) + '...' : t.topic_name,
      score: Math.round(t.score),
      full_name: t.topic_name
    }));
  }, [performance?.topic_performances]);

  const trendData = useMemo(() => {
    return (aiAnalysis?.performance_trends || []).map(p => ({
      name: p.date,
      score: Math.round(p.score)
    }));
  }, [aiAnalysis?.performance_trends]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Synthesizing Real-Time AI Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-violet-950/20 to-slate-900/90 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Knowledge Tier: {aiAnalysis?.overall_knowledge_level?.level || 'Intermediate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Target Milestone: <span className="text-violet-300 font-semibold">{targetGoal}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRefreshAI}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-2 transition border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Recalculating...' : 'Recalculate AI'}</span>
            </button>
            <Link
              to="/assessment"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all hover:scale-[1.02] border border-white/20 animate-shimmer"
            >
              <span>Take Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Progress"
          value={`${learningPath?.completion_percentage || 0}%`}
          icon={Target}
          subtitle="Path completion toward target goal"
          trend="+12% this week"
          color="indigo"
        />
        <StatCard
          title="Average Score"
          value={`${overall.average_score || 0}%`}
          icon={TrendingUp}
          subtitle="Across assessments & practice quizzes"
          color="purple"
        />
        <StatCard
          title="Topics Mastered"
          value={`${overall.topics_mastered || 0} / ${overall.total_topics_tracked || 6}`}
          icon={Award}
          subtitle="Demonstrating ≥75% proficiency"
          color="emerald"
        />
        <StatCard
          title="Learning Streak"
          value={`${overall.learning_streak || 1} Days`}
          icon={Flame}
          subtitle="Consecutive daily focus streak"
          color="amber"
        />
      </div>

      {/* Primary Section: Continue Learning & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-[#0d1322] to-slate-950 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-violet-400 uppercase tracking-widest flex items-center space-x-2">
                <PlayCircle className="w-4 h-4" />
                <span>CONTINUE LEARNING NOW</span>
              </span>
              {primaryRec && <DifficultyBadge difficulty={primaryRec.difficulty} />}
            </div>

            {primaryRec ? (
              <>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{primaryRec.topic_name}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  {primaryRec.reason}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {primaryRec.quiz_id ? (
                    <Link
                      to={`/quizzes?quizId=${primaryRec.quiz_id}`}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition border border-white/20 animate-shimmer"
                    >
                      <span>Take Practice Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : null}

                  <Link
                    to={`/materials?topicId=${primaryRec.topic_id}`}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-2 transition hover:border-violet-500/30"
                  >
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <span>Study Content</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white mb-1">Foundational Track Fully Mastered!</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                  Take a new diagnostic test to unlock advanced curriculum tracks and higher difficulty modules.
                </p>
                <Link
                  to="/assessment"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 inline-flex items-center space-x-2"
                >
                  <span>Start Assessment</span>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Subject: <strong className="text-slate-200">{primaryRec?.subject_name || user?.profile?.target_subject || 'Python Programming'}</strong></span>
            <Link to="/learning-path" className="text-violet-400 hover:text-violet-300 font-bold flex items-center space-x-1 transition">
              <span>View full pathway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* AI Insight Box (1 col) */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-violet-500/25 bg-gradient-to-b from-violet-950/20 via-slate-900/60 to-slate-950 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

          <div>
            <div className="flex items-center space-x-2 text-violet-400 text-xs font-black uppercase tracking-wider mb-4">
              <Brain className="w-4 h-4" />
              <span>AI Analytical Insight</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#060911]/80 border border-violet-500/20 mb-5">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{aiAnalysis?.ai_generated_insights?.[0] || 'Take an assessment to generate your personalized AI strength and weakness insights.'}"
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cognitive Pace:</span>
                </span>
                <span className="text-indigo-300 font-bold">{aiAnalysis?.learning_pace?.pace || 'Steady'}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span>Adapted Difficulty:</span>
                </span>
                <span className="text-violet-300 font-bold">{aiAnalysis?.recommended_difficulty || 'Intermediate'}</span>
              </div>
            </div>
          </div>

          <Link
            to="/ai-analysis"
            className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 transition block"
          >
            Inspect Detailed AI Analysis →
          </Link>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery Bar Chart */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Topic Mastery Breakdown</h3>
              <p className="text-xs text-slate-400">Current proficiency score per concept</p>
            </div>
            <Link to="/performance" className="text-xs text-violet-400 hover:text-violet-300 font-semibold hover:underline">
              Full Report
            </Link>
          </div>

          <div className="h-64 w-full">
            {topicChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    formatter={(val) => [`${val}%`, 'Proficiency']}
                  />
                  <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete an assessment or quiz to populate topic mastery analytics.
              </div>
            )}
          </div>
        </div>

        {/* Score Performance Trend Area Chart */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Score Performance Trend</h3>
              <p className="text-xs text-slate-400">Chronological trajectory across tests</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Curve
            </span>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" isAnimationActive={true} animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Score trajectory will chart after submitting at least 2 quizzes or tests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended For You Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Recommended Topics For You</span>
            </h3>
            <p className="text-xs text-slate-400">Personalized sequence curated by the recommendation model</p>
          </div>
          <Link to="/learning-path" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
            View All Pathways →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div
              key={rec.id || rec.topic_id || i}
              className="p-5 rounded-2xl glass-panel bg-slate-950/60 border border-white/5 flex flex-col justify-between glass-card-hover"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    rec.recommendation_type === 'weakness'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : rec.recommendation_type === 'mastery'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {rec.recommendation_type === 'weakness' ? 'Practice More' : rec.recommendation_type === 'mastery' ? 'Challenge' : 'Next Step'}
                  </span>
                  <DifficultyBadge difficulty={rec.difficulty} size="xs" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{rec.topic_name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{rec.reason}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] text-slate-500">{rec.subject_name}</span>
                <Link
                  to={`/materials?topicId=${rec.topic_id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center space-x-1"
                >
                  <span>Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
