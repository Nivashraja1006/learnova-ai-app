import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/common/Modal';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    topic_id: '',
    title: '',
    difficulty: 'Intermediate',
    time_limit: 10
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuizzes();
    loadTopics();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
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
    setEditingQuiz(null);
    setFormData({
      topic_id: topics[0]?.id?.toString() || '',
      title: '',
      difficulty: 'Intermediate',
      time_limit: 10
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuiz(q);
    setFormData({
      topic_id: q.topic_id?.toString() || '',
      title: q.title,
      difficulty: q.difficulty || 'Intermediate',
      time_limit: q.time_limit || 10
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        topic_id: parseInt(formData.topic_id),
        time_limit: parseInt(formData.time_limit)
      };

      if (editingQuiz) {
        await api.put(`/admin/quizzes/${editingQuiz.id}`, payload);
      } else {
        await api.post('/admin/quizzes', payload);
      }
      setIsModalOpen(false);
      await loadQuizzes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently remove quiz "${title}"?`)) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete quiz.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Adaptive Practice Management"
        badgeIcon={HelpCircle}
        badgeColor="purple"
        title="Topic Practice Quizzes"
        subtitle="Manage concept-level timed practice quizzes linked directly to learning pathways."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        }
      />

      {/* Quizzes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Quizzes Configured</h3>
          <p className="text-xs text-slate-400">Click "Create Quiz" to add a new assessment test.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {q.topic_name || `Topic #${q.topic_id}`}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Quiz"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{q.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <DifficultyBadge difficulty={q.difficulty} size="xs" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{q.time_limit} mins</span>
                </span>
                <span className="text-[10px] text-slate-500">Quiz ID #{q.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuiz ? 'Edit Practice Quiz' : 'Create Practice Quiz'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Quiz Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Asynchronous I/O Mastery Quiz"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Time Limit (Mins)</label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                min={1}
                max={60}
                required
              />
            </div>
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
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
