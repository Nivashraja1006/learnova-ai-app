import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/common/Modal';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', icon: 'BookOpen' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '', description: '', icon: 'BookOpen' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj) => {
    setEditingSubject(subj);
    setFormData({
      name: subj.name,
      code: subj.code || '',
      description: subj.description || '',
      icon: subj.icon || 'BookOpen'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Please provide subject title and course code.');
      return;
    }

    setSaving(true);
    try {
      if (editingSubject) {
        await api.put(`/admin/subjects/${editingSubject.id}`, formData);
      } else {
        await api.post('/admin/subjects', formData);
      }
      setIsModalOpen(false);
      await loadSubjects();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently remove subject "${name}" and all associated topics?`)) {
      return;
    }
    try {
      await api.delete(`/admin/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Curriculum Architecture"
        badgeIcon={FolderTree}
        badgeColor="indigo"
        title="Subject Disciplines"
        subtitle="Manage academic curriculum disciplines, prerequisite topic domains, and course identifiers."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        }
      />

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading subjects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subj) => (
            <motion.div
              key={subj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 font-mono">
                    {subj.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(subj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(subj.id, subj.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{subj.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                  {subj.description || 'Comprehensive foundational course discipline.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                  <span>{subj.topics?.length || 0} Modules</span>
                </span>
                <span className="text-[10px] text-slate-500">ID #{subj.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject Discipline' : 'Add Subject Discipline'}
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Distributed Systems"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Course Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. DIST101"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Overview Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of course contents..."
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
              {saving ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
