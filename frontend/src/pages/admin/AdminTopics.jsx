import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/common/Modal';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Link2
} from 'lucide-react';

export const AdminTopics = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    description: '',
    difficulty: 'Beginner',
    order_index: 1,
    prerequisites: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadTopics(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
      if (res.data.length > 0) {
        setSelectedSubjectId(res.data[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTopics = async (subjId) => {
    try {
      setLoading(true);
      const res = await api.get(`/subjects/${subjId}/topics`);
      setTopics(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTopic(null);
    setFormData({
      subject_id: selectedSubjectId,
      name: '',
      description: '',
      difficulty: 'Beginner',
      order_index: (topics.length + 1),
      prerequisites: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      subject_id: topic.subject_id.toString(),
      name: topic.name,
      description: topic.description || '',
      difficulty: topic.difficulty || 'Beginner',
      order_index: topic.order_index || 1,
      prerequisites: topic.prerequisites || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Topic title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        subject_id: parseInt(formData.subject_id || selectedSubjectId),
        order_index: parseInt(formData.order_index)
      };

      if (editingTopic) {
        await api.put(`/admin/topics/${editingTopic.id}`, payload);
      } else {
        await api.post('/admin/topics', payload);
      }
      setIsModalOpen(false);
      await loadTopics(selectedSubjectId);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently remove topic "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/topics/${id}`);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete topic.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Curriculum Prerequisite Graph"
        badgeIcon={Layers}
        badgeColor="violet"
        title="Topic Modules & Dependencies"
        subtitle="Configure individual concept modules, difficulty classifications, sequence indices, and prerequisite requirements."
        actions={
          <div className="flex items-center space-x-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-violet-500 shadow-inner"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          </div>
        }
      />

      {/* Topics Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Topics In This Subject</h3>
          <p className="text-xs text-slate-400">Click "Add Topic" to create the first concept module.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/10 font-mono">
                    Step #{t.order_index}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Topic"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{t.name}</h3>
                  <DifficultyBadge difficulty={t.difficulty} size="xs" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 font-normal">
                  {t.description || 'Core syllabus topic.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-1 text-[11px] text-slate-400">
                {t.prerequisites ? (
                  <div className="flex items-center space-x-1.5 text-violet-300">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Prereq: {t.prerequisites}</span>
                  </div>
                ) : (
                  <span className="text-slate-500">No Prerequisites (Foundational)</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Edit Topic Module' : 'Add Topic Module'}
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Topic Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Asynchronous I/O & Coroutines"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Sequence Index</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Prerequisites (Optional)</label>
            <input
              type="text"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              placeholder="e.g. Control Flow & Loops (≥75%)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Concepts explored..."
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
              {saving ? 'Saving...' : 'Save Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
