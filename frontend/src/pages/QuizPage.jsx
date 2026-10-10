import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { Modal } from '../components/common/Modal';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  BookOpen,
  Check,
  Zap
} from 'lucide-react';

export const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryQuizId = searchParams.get('quizId');
  const queryTopicId = searchParams.get('topicId');

  // List view state
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 min
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadSubjects();
    if (queryQuizId) {
      startQuizById(queryQuizId);
    } else {
      loadQuizzes();
    }
  }, [queryQuizId, queryTopicId, selectedSubjectId]);

  // Countdown timer for active quiz
  useEffect(() => {
    let timer;
    if (activeQuiz && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, secondsRemaining]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubjectId) params.subject_id = selectedSubjectId;
      if (queryTopicId) params.topic_id = queryTopicId;

      const res = await api.get('/quizzes', { params });
      setQuizzes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startQuizById = async (quizId) => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/${quizId}`);
      setActiveQuiz(res.data);
      setSecondsRemaining((res.data.time_limit || 10) * 60);
      setAnswers({});
      setCurrentQIndex(0);
    } catch (e) {
      console.error(e);
      alert('Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionKey) => {
    const q = activeQuiz.questions[currentQIndex];
    setAnswers(prev => ({ ...prev, [q.id]: optionKey }));
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const answersList = activeQuiz.questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));

      const elapsed = ((activeQuiz.time_limit || 10) * 60) - secondsRemaining;

      const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, {
        quiz_id: activeQuiz.id,
        answers: answersList,
        time_taken_seconds: Math.max(1, elapsed)
      });

      setShowConfirmModal(false);
      navigate(`/quizzes/result/${activeQuiz.id}`, { state: { resultData: res.data } });
    } catch (e) {
      console.error(e);
      alert('Failed to submit quiz results.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // View 1: Active Quiz Taking Mode
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const currentQ = questions[currentQIndex];
    const totalQ = questions.length;
    const answeredCount = Object.keys(answers).length;
    const isTimeLow = secondsRemaining <= 120; // 2 min warning

    const options = currentQ ? [
      { key: 'A', text: currentQ.option_a },
      { key: 'B', text: currentQ.option_b },
      { key: 'C', text: currentQ.option_c },
      { key: 'D', text: currentQ.option_d },
    ].filter(o => Boolean(o.text)) : [];

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
        {/* Cockpit Bar */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 flex items-center justify-between gap-4 bg-slate-900/90 shadow-xl">
          <div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{activeQuiz.topic_name}</div>
            <h2 className="text-base font-bold text-white">{activeQuiz.title}</h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
              isTimeLow
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-950 border-white/10 text-slate-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-current" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <DifficultyBadge difficulty={activeQuiz.difficulty} size="xs" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${((currentQIndex + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0b0f19]/90 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>Question {currentQIndex + 1} of {totalQ}</span>
              <span className="font-mono">{answeredCount} of {totalQ} Answered</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed">
              {currentQ.question_text}
            </h3>

            <div className="space-y-3">
              {options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectAnswer(opt.key)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-start space-x-3.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                        : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900/80 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border transition ${
                      isSelected
                        ? 'bg-violet-600 border-violet-400 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400 group-hover:text-white'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : opt.key}
                    </div>
                    <div className="flex-1 pt-0.5 leading-relaxed">{opt.text}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-1.5 transition disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentQIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition animate-shimmer"
              >
                <span>Finish Quiz</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Finish Quiz Submission"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              You answered <strong className="text-white font-bold">{answeredCount}</strong> of <strong className="text-white font-bold">{totalQ}</strong> questions.
            </p>

            {answeredCount < totalQ && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Unanswered questions will count as incorrect.</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleQuizSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Scoring...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // View 2: Quiz Catalog Browser
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Adaptive Assessment Engine"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="Quizzes & Concept Practice"
        subtitle="Challenge your understanding with topic quizzes. Scores instantly update your dynamic learning pathway."
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-violet-500 shadow-inner"
            >
              <option value="">All Disciplines</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Quizzes List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading quiz catalog...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Quizzes Found</h3>
          <p className="text-xs text-slate-400">Try selecting a different subject or clearing your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {quiz.topic_name}
                  </span>
                  <DifficultyBadge difficulty={quiz.difficulty} size="xs" />
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{quiz.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                  Reinforce concept mastery with multi-choice questions covering core mechanics.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{quiz.time_limit || 10} mins</span>
                </div>

                <button
                  onClick={() => startQuizById(quiz.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Quiz</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
