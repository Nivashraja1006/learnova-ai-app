import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/common/Modal';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import {
  FileQuestion,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle
} from 'lucide-react';

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    topic_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 'Beginner',
    explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
    loadSubjectsAndTopics();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/questions');
      setQuestions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsAndTopics = async () => {
    try {
      const res = await api.get('/subjects');
      const allT = [];
      res.data.forEach(s => {
        (s.topics || []).forEach(t => allT.push({ ...t, subject_name: s.name }));
      });
      setTopics(allT);
      if (allT.length > 0 && !formData.topic_id) {
        setFormData(prev => ({ ...prev, topic_id: allT[0].id.toString() }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      topic_id: selectedTopicId || (topics[0]?.id?.toString() || ''),
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      difficulty: 'Beginner',
      explanation: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      topic_id: q.topic_id?.toString() || '',
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer,
      difficulty: q.difficulty || 'Beginner',
      explanation: q.explanation || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.question_text.trim() || !formData.option_a.trim() || !formData.option_b.trim()) {
      setError('Please provide question text and at least options A and B.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        topic_id: parseInt(formData.topic_id)
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }
      setIsModalOpen(false);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this MCQ from the question bank?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete question.');
    }
  };

  const filtered = questions.filter(q => {
    const matchesSearch = (q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.topic_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicId ? q.topic_id.toString() === selectedTopicId : true;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Evaluations & Question Bank"
        badgeIcon={FileQuestion}
        badgeColor="amber"
        title="Question Bank (MCQ Repository)"
        subtitle="Curate diagnostic and quiz questions with multi-choice options, correct answers, and algorithmic rationales."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New MCQ</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text or concept name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject_name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading questions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <FileQuestion className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Questions Found</h3>
          <p className="text-xs text-slate-400">Click "Add New MCQ" to create items for this concept.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.02 }}
              className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {q.topic_name || `Topic #${q.topic_id}`}
                  </span>
                  <DifficultyBadge difficulty={q.difficulty} size="xs" />
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit MCQ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete MCQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {q.question_text}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'A' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-950/70 border-white/5 text-slate-300'}`}>
                  A. {q.option_a}
                </div>
                <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'B' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-950/70 border-white/5 text-slate-300'}`}>
                  B. {q.option_b}
                </div>
                {q.option_c && (
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'C' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-950/70 border-white/5 text-slate-300'}`}>
                    C. {q.option_c}
                  </div>
                )}
                {q.option_d && (
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'D' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-950/70 border-white/5 text-slate-300'}`}>
                    D. {q.option_d}
                  </div>
                )}
              </div>

              {q.explanation && (
                <div className="text-[11px] text-slate-400 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 leading-relaxed">
                  <span className="text-violet-400 font-semibold">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question (MCQ)'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Topic</label>
              <select
                value={formData.topic_id}
                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subject_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Question Text</label>
            <textarea
              rows={3}
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="State problem statement..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Option A</label>
              <input
                type="text"
                value={formData.option_a}
                onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Option B</label>
              <input
                type="text"
                value={formData.option_b}
                onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Option C (Optional)</label>
              <input
                type="text"
                value={formData.option_c}
                onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Option D (Optional)</label>
              <input
                type="text"
                value={formData.option_d}
                onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Correct Answer</label>
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-violet-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Explanation / Rationale</label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Why this answer is correct..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save MCQ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
