import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/common/Modal';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
  Search,
  FileText,
  Video,
  Code,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    topic_id: '',
    title: '',
    description: '',
    content_type: 'Notes',
    difficulty: 'Beginner',
    estimated_minutes: 15,
    url: '',
    markdown_content: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMaterials();
    loadTopics();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials');
      setMaterials(res.data);
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
    setEditingMaterial(null);
    setFormData({
      topic_id: topics[0]?.id?.toString() || '',
      title: '',
      description: '',
      content_type: 'Notes',
      difficulty: 'Beginner',
      estimated_minutes: 15,
      url: '',
      markdown_content: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMaterial(m);
    setFormData({
      topic_id: m.topic_id?.toString() || '',
      title: m.title,
      description: m.description || '',
      content_type: m.content_type || 'Notes',
      difficulty: m.difficulty || 'Beginner',
      estimated_minutes: m.estimated_minutes || 15,
      url: m.url || '',
      markdown_content: m.markdown_content || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        topic_id: parseInt(formData.topic_id),
        estimated_minutes: parseInt(formData.estimated_minutes)
      };

      if (editingMaterial) {
        await api.put(`/admin/materials/${editingMaterial.id}`, payload);
      } else {
        await api.post('/admin/materials', payload);
      }
      setIsModalOpen(false);
      await loadMaterials();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently remove study module "${title}"?`)) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete material.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
      case 'practice':
        return <Code className="w-3.5 h-3.5 text-emerald-400" />;
      case 'notes':
      default:
        return <FileText className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  const filtered = materials.filter(m =>
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.topic_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Curated Study Content"
        badgeIcon={BookOpen}
        badgeColor="emerald"
        title="Learning Materials & Notes"
        subtitle="Curate algorithmic study notes, guided practice problems, and external reference materials for students."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material title or concept name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading materials...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Materials Found</h3>
          <p className="text-xs text-slate-400">Click "Add Material" to create notes for this topic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-300">
                    {getTypeIcon(m.content_type)}
                    <span>{m.content_type || 'Notes'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Material"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-violet-400 font-bold mb-1">
                  {m.topic_name || `Topic #${m.topic_id}`}
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3 font-normal">
                  {m.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{m.estimated_minutes} mins</span>
                </span>
                <DifficultyBadge difficulty={m.difficulty} size="xs" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Edit Learning Material' : 'Add Learning Material'}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Content Type</label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="Notes">Notes (Markdown)</option>
                <option value="Video">Video Tutorial</option>
                <option value="Practice">Interactive Practice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Asynchronous Coroutines Masterclass"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Reading Duration (Mins)</label>
              <input
                type="number"
                value={formData.estimated_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_minutes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Brief Summary</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Quick one-line summary..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">External Resource URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://docs.python.org/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Markdown Notes Content</label>
            <textarea
              rows={5}
              value={formData.markdown_content}
              onChange={(e) => setFormData({ ...formData, markdown_content: e.target.value })}
              placeholder="Write detailed study notes or algorithmic code snippets here..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
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
              {saving ? 'Saving...' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
