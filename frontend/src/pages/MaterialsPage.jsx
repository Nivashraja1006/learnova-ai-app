import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { Modal } from '../components/common/Modal';
import {
  BookOpen,
  Search,
  Clock,
  ExternalLink,
  FileText,
  Video,
  Code,
  Sparkles
} from 'lucide-react';

export const MaterialsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || '';

  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reader Modal state
  const [activeMaterial, setActiveMaterial] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [selectedSubjectId, selectedTopicId, selectedDifficulty, selectedContentType, searchQuery]);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubjectId) params.subject_id = selectedSubjectId;
      if (selectedTopicId) params.topic_id = selectedTopicId;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedContentType) params.content_type = selectedContentType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/materials', { params });
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'practice':
        return <Code className="w-4 h-4 text-emerald-400" />;
      case 'notes':
      default:
        return <FileText className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Curated Knowledge Library"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="Learning Content & Study Notes"
        subtitle="Explore structured algorithmic notes, deep-dive reference materials, and guided code examples calibrated to your level."
      />

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, topics, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-violet-500"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Content Type Pills */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/5 overflow-x-auto pb-1">
          {['', 'Notes', 'Video', 'Practice'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedContentType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedContentType === type
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {type || 'All Content Types'}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading study modules...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Materials Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          <button
            onClick={() => {
              setSelectedSubjectId('');
              setSelectedTopicId('');
              setSelectedDifficulty('');
              setSelectedContentType('');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <motion.div
              key={mat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover bg-gradient-to-br from-slate-900/80 via-[#0d1322] to-slate-950 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-bold text-slate-300">
                    {getTypeIcon(mat.content_type)}
                    <span>{mat.content_type || 'Notes'}</span>
                  </div>
                  <DifficultyBadge difficulty={mat.difficulty} size="xs" />
                </div>

                <div className="text-[11px] text-violet-400 font-semibold mb-1">
                  {mat.topic_name || 'General Subject'}
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{mat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3 font-normal">
                  {mat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{mat.estimated_minutes || 15} mins</span>
                </div>

                <button
                  onClick={() => setActiveMaterial(mat)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen Reading Modal */}
      <Modal
        isOpen={Boolean(activeMaterial)}
        onClose={() => setActiveMaterial(null)}
        title={activeMaterial?.title || 'Study Material'}
        maxWidth="max-w-3xl"
      >
        {activeMaterial && (
          <div className="space-y-6 text-slate-300 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/10">
              <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                {activeMaterial.topic_name}
              </span>
              <DifficultyBadge difficulty={activeMaterial.difficulty} size="xs" />
              <span className="text-xs text-slate-400 flex items-center space-x-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeMaterial.estimated_minutes} min read</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {activeMaterial.description}
            </p>

            {/* Markdown / Note Content */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 font-normal leading-relaxed whitespace-pre-line text-slate-200">
              {activeMaterial.markdown_content || 'Comprehensive study notes are currently being prepared for this module.'}
            </div>

            {activeMaterial.url && (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <a
                  href={activeMaterial.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 flex items-center space-x-2 transition"
                >
                  <span>Open External Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
