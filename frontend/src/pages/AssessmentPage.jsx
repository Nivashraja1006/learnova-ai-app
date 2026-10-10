import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Flag,
  Check,
  Layers
} from 'lucide-react';

export const AssessmentPage = () => {
  const navigate = useNavigate();

  // Setup state
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active assessment state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: "A" | "B" | "C" | "D" }
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    let timer;
    if (isStarted) {
      timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted]);

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

  const handleStartAssessment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/subjects/${selectedSubjectId}/assessment-questions`);
      if (res.data.length === 0) {
        alert('No questions configured yet for this subject. Please choose another.');
        return;
      }
      setQuestions(res.data);
      setUserAnswers({});
      setMarkedForReview(new Set());
      setSecondsElapsed(0);
      setCurrentIndex(0);
      setIsStarted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionKey) => {
    const qId = questions[currentIndex].id;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  const toggleMarkForReview = () => {
    const qId = questions[currentIndex].id;
    setMarkedForReview(prev => {
      const updated = new Set(prev);
      if (updated.has(qId)) {
        updated.delete(qId);
      } else {
        updated.add(qId);
      }
      return updated;
    });
  };

  const handleSubmitAssessment = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        selected_answer: userAnswers[q.id] || null
      }));

      const res = await api.post('/assessments/submit', {
        subject_id: parseInt(selectedSubjectId),
        answers: formattedAnswers,
        time_taken_seconds: secondsElapsed
      });

      setShowSubmitModal(false);
      navigate(`/assessment/result/${res.data.id}`, { state: { resultData: res.data } });
    } catch (err) {
      console.error(err);
      alert('Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && !isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Loading Diagnostic Assessment...
        </p>
      </div>
    );
  }

  // View 1: Not started yet - Intro and Subject Choice
  if (!isStarted) {
    const currentSubj = subjects.find(s => s.id.toString() === selectedSubjectId);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-violet-950/20 to-slate-900/90 shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Diagnostic Benchmark</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Initial Diagnostic Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            Evaluate your knowledge tier and baseline cognitive velocity. Our Scikit-learn recommendation engine analyzes your responses to construct a personalized syllabus.
          </p>

          <div className="max-w-md mx-auto mb-8 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Target Discipline
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-violet-500 transition shadow-inner"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
            {currentSubj?.description && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {currentSubj.description}
              </p>
            )}
          </div>

          <button
            onClick={handleStartAssessment}
            className="px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] border border-white/20 animate-shimmer"
          >
            Begin Diagnostic Assessment
          </button>
        </div>

        {/* 3 Guideline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Balanced Coverage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions span all introductory, intermediate, and advanced curriculum topics to build a complete profile.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <span>AI Classification</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Adaptive Calibration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your overall score and concept accuracy calibrate the ML classifier between Beginner, Intermediate, and Advanced.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">No Penalties</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take your time and answer candidly. Missed questions help the engine isolate prerequisite topics for study.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Active Test Taking Cockpit
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const isMarked = currentQ ? markedForReview.has(currentQ.id) : false;

  const options = [
    { key: 'A', text: currentQ.option_a },
    { key: 'B', text: currentQ.option_b },
    { key: 'C', text: currentQ.option_c },
    { key: 'D', text: currentQ.option_d },
  ].filter(o => Boolean(o.text));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Test Cockpit Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-black text-violet-400 uppercase tracking-widest px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            Question {currentIndex + 1} of {totalQ}
          </span>
          <DifficultyBadge difficulty={currentQ.difficulty} size="xs" />
        </div>

        {/* Live Timer Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 border border-white/10 text-xs font-mono font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <button
            onClick={toggleMarkForReview}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center space-x-1 ${
              isMarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isMarked ? 'Marked' : 'Flag'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0b0f19]/90 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Concept: <span className="text-violet-300">{currentQ.topic_name || 'Fundamental Concept'}</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed">
          {currentQ.question_text}
        </h2>

        {/* Option Choices */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = userAnswers[currentQ.id] === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
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

      {/* Navigation & Submit Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 glass-panel hover:bg-slate-800 border border-white/10 flex items-center space-x-1.5 transition disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentIndex < totalQ - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalQ - 1, prev + 1))}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 transition"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition animate-shimmer"
            >
              <span>Finish & Submit</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Question Tracker Palette (Bottom Drawer) */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-slate-900/60 mt-6">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Question Palette</span>
          <span>{answeredCount} of {totalQ} Answered</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const hasAns = userAnswers[q.id] !== undefined;
            const isFlg = markedForReview.has(q.id);
            const isCur = idx === currentIndex;

            let btnClass = 'bg-slate-950 border-white/10 text-slate-400';
            if (isCur) {
              btnClass = 'ring-2 ring-violet-500 bg-violet-600/20 text-white font-bold border-violet-500';
            } else if (isFlg) {
              btnClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            } else if (hasAns) {
              btnClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center ${btnClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Diagnostic Assessment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            You have answered <strong className="text-white font-bold">{answeredCount}</strong> of <strong className="text-white font-bold">{totalQ}</strong> questions in <strong className="text-white font-bold">{formatTime(secondsElapsed)}</strong>.
          </p>

          {answeredCount < totalQ && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>You have {totalQ - answeredCount} unanswered questions. They will be marked incorrect.</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Resume Test
            </button>
            <button
              onClick={handleSubmitAssessment}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Confirm & Generate Path'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
