import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import confetti from 'canvas-confetti';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Compass,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

export const AssessmentResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!result);
  const [expandedAnswerId, setExpandedAnswerId] = useState(null);

  useEffect(() => {
    if (!result && id) {
      loadAssessmentResult(id);
    }
  }, [id, result]);

  useEffect(() => {
    if (result && result.percentage >= 60) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result]);

  const loadAssessmentResult = async (assessmentId) => {
    try {
      setLoading(true);
      const res = await api.get(`/assessments/${assessmentId}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Synthesizing AI Diagnostic Evaluation...
        </p>
      </div>
    );
  }

  const incorrectCount = result.total_questions - result.score;
  const mins = Math.floor(result.time_taken_seconds / 60);
  const secs = result.time_taken_seconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-violet-950/30 to-slate-900/90 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Diagnostic Evaluation Completed</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
          {result.subject_name} Diagnostic Report
        </h1>

        {/* Center Progress Ring */}
        <div className="my-6 flex justify-center">
          <ProgressRing
            percentage={result.percentage}
            size={140}
            strokeWidth={12}
            colorGradient={result.percentage >= 70 ? ['#8b5cf6', '#10b981'] : ['#f43f5e', '#8b5cf6']}
            sublabel="Score"
          />
        </div>

        {/* AI Feedback Banner */}
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-950/80 border border-violet-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed mb-8">
          <p className="font-normal">
            <strong className="text-violet-400 font-bold">AI Diagnosis: </strong>
            {result.ai_feedback}
          </p>
        </div>

        {/* 4 Score Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Score</div>
            <div className="text-lg font-black text-white font-mono">
              <AnimatedNumber value={`${result.score} / ${result.total_questions}`} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Accuracy</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              <AnimatedNumber value={`${Math.round(result.percentage)}%`} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Duration</div>
            <div className="text-lg font-black text-indigo-300 font-mono">{mins}m {secs}s</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Tier Pred.</div>
            <div className="text-base font-black text-violet-300">
              {result.percentage >= 75 ? 'Advanced' : result.percentage >= 50 ? 'Intermediate' : 'Beginner'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/learning-path"
            className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition hover:scale-[1.02] border border-white/20 animate-shimmer"
          >
            <Compass className="w-4 h-4" />
            <span>View Personalized Learning Path</span>
          </Link>

          <Link
            to="/ai-analysis"
            className="px-5 py-3 rounded-xl font-bold text-xs text-slate-200 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-2 transition hover:border-violet-500/30"
          >
            <Brain className="w-4 h-4 text-violet-400" />
            <span>Inspect AI Analysis</span>
          </Link>
        </div>
      </motion.div>

      {/* Detailed Question Review */}
      {result.answers && result.answers.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Question Review & Explanations ({result.answers.length} items)</span>
          </h2>

          <div className="space-y-3">
            {result.answers.map((ans, idx) => {
              const isCorrect = ans.is_correct;
              const isExpanded = expandedAnswerId === ans.id;

              return (
                <div
                  key={ans.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isCorrect
                      ? 'bg-slate-950/60 border-emerald-500/20'
                      : 'bg-slate-950/60 border-rose-500/20'
                  }`}
                >
                  <div
                    onClick={() => setExpandedAnswerId(isExpanded ? null : ans.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 pr-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="text-xs font-semibold text-white">
                        Question {idx + 1}: {ans.question_text?.substring(0, 70)}...
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCorrect
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs"
                    >
                      <p className="text-slate-200 font-medium">{ans.question_text}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] pt-1">
                        <span className="text-slate-400">Your Answer: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{ans.selected_answer || 'None'}</strong></span>
                        <span className="text-slate-400">Correct Answer: <strong className="text-emerald-400">{ans.correct_answer}</strong></span>
                      </div>
                      {ans.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-300 leading-relaxed mt-2">
                          <strong className="text-violet-400">Explanation: </strong>
                          {ans.explanation}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
