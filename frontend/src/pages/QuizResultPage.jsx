import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BookOpen,
  Clock
} from 'lucide-react';

export const QuizResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.resultData || null);

  useEffect(() => {
    if (result && result.percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [result]);

  if (!result) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4 max-w-md mx-auto my-12">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Quiz Result Session Expired</h3>
        <p className="text-xs text-slate-400">Please choose a quiz to practice from the catalog.</p>
        <Link to="/quizzes" className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs inline-block">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const mins = Math.floor(result.time_taken_seconds / 60);
  const secs = result.time_taken_seconds % 60;
  const incorrectCount = result.total_questions - result.score;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-violet-950/30 to-slate-900/90 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Practice Evaluation Complete</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
          {result.quiz_title}
        </h1>
        <p className="text-xs text-slate-400 mb-6">Topic: <strong className="text-slate-200">{result.topic_name}</strong></p>

        {/* Center Progress Ring */}
        <div className="my-6 flex justify-center">
          <ProgressRing
            percentage={result.percentage}
            size={140}
            strokeWidth={12}
            colorGradient={result.percentage >= 75 ? ['#8b5cf6', '#10b981'] : ['#f43f5e', '#8b5cf6']}
            sublabel="Accuracy"
          />
        </div>

        {/* AI Analysis Note */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/80 border border-violet-500/20 text-xs text-slate-300 leading-relaxed mb-6">
          <strong className="text-violet-400">AI Recommendation: </strong>
          {result.recommendation_note}
        </div>

        {/* Score Counters */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Correct</div>
            <div className="text-lg font-black text-emerald-300 font-mono">
              <AnimatedNumber value={result.score} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">Incorrect</div>
            <div className="text-lg font-black text-rose-300 font-mono">
              <AnimatedNumber value={incorrectCount} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Duration</div>
            <div className="text-lg font-black text-white font-mono">{mins}m {secs}s</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(`/quizzes?quizId=${result.quiz_id}`)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-300 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </button>
          <Link
            to="/learning-path"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Update Learning Path</span>
          </Link>
          <Link
            to="/quizzes"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Browse Other Quizzes →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
