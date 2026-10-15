import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  Compass,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';

export const LearningPathPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadLearningPath(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
      if (res.data.length > 0) {
        setSelectedSubjectId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLearningPath = async (subjId) => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/learning-path?subject_id=${subjId}`);
      setPathData(res.data);
    } catch (err) {
      console.error('Failed to load learning path', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pathData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Constructing Dynamic Prerequisite Roadmap...
        </p>
      </div>
    );
  }

  const steps = pathData?.steps || [];
  const completionPct = pathData?.completion_percentage || 0;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header with Subject Switcher */}
      <PageHeader
        badge="AI Curriculum Optimization"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="Personalized Learning Pathway"
        subtitle="Dynamic prerequisite sequence adjusting automatically as you master concepts and pass practice quizzes."
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-violet-500 shadow-inner"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Pathway Progress Overview Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-violet-950/25 to-slate-900/90 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest block">
              Curriculum Milestone Progress
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              {pathData?.subject_name} Track
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Primary Goal: <span className="text-violet-300 font-bold">{pathData?.target_goal}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl sm:text-4xl font-black text-violet-400 font-mono">
              <AnimatedNumber value={`${Math.round(completionPct)}%`} />
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5">Syllabus Mastered</div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={false}
            animate={{ width: `${Math.min(100, Math.max(0, completionPct))}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 h-full"
          />
        </div>
      </motion.div>

      {/* Sequenced Pathway Steps List */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isRecommended = step.status === 'recommended';
          const isLocked = step.status === 'locked';
          const isInProgress = step.status === 'in_progress';

          let statusBadgeClass = 'bg-slate-800 text-slate-400 border-white/5';
          let statusLabel = 'Upcoming';
          if (isCompleted) {
            statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10';
            statusLabel = 'Mastered';
          } else if (isRecommended) {
            statusBadgeClass = 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-violet-500/20 animate-pulse';
            statusLabel = 'Recommended Next';
          } else if (isInProgress) {
            statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
            statusLabel = 'In Progress';
          } else if (isLocked) {
            statusBadgeClass = 'bg-slate-900 text-slate-500 border-white/5';
            statusLabel = 'Locked';
          }

          return (
            <motion.div
              key={step.topic_id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${
                isRecommended
                  ? 'glass-panel bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/30 border-violet-500/40 shadow-2xl shadow-violet-500/10'
                  : isCompleted
                    ? 'glass-panel bg-slate-900/60 border-white/5'
                    : isLocked
                      ? 'bg-slate-950/40 border-white/5 opacity-70'
                      : 'glass-panel bg-slate-900/70 border-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Step number + Title + Badges */}
                <div className="flex items-start space-x-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm border transition ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm'
                      : isRecommended
                        ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-400 text-white shadow-lg shadow-violet-600/30'
                        : isLocked
                          ? 'bg-slate-900 border-white/5 text-slate-600'
                          : 'bg-slate-800 border-white/10 text-slate-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : (
                      step.step_number
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{step.topic_name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                      <DifficultyBadge difficulty={step.difficulty} size="xs" />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-normal">
                      {step.reason}
                    </p>

                    {step.prerequisites && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        Prerequisites: <span className="text-slate-300 font-medium">{step.prerequisites}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Score + Action Button */}
                <div className="flex items-center space-x-4 pl-14 md:pl-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mastery Score</div>
                    <div className="text-base font-black text-white font-mono">
                      <AnimatedNumber value={`${Math.round(step.mastery_score)}%`} />
                    </div>
                  </div>

                  {!isLocked ? (
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/materials?topicId=${step.topic_id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-1.5 transition hover:border-violet-500/30"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                        <span>Notes</span>
                      </Link>

                      <Link
                        to={`/quizzes?topicId=${step.topic_id}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 transition ${
                          isRecommended
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/30 animate-shimmer'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Practice</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete prerequisite first</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
