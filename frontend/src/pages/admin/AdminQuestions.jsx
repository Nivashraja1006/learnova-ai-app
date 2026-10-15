import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Check,
  X
} from 'lucide-react';

const pageSize = 6;

const defaultFormData = {
  topic_id: '',
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  difficulty: 'Beginner',
  explanation: ''
};

export const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    loadQuestions();
    loadSubjects();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSubjectId, selectedTopicId, selectedDifficulty, selectedType, sortBy]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/questions');
      setQuestions((res.data || []).map((question) => ({ ...question, question_type: 'MCQ' })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const topicOptions = useMemo(() => {
    return subjects.flatMap((subject) =>
      (subject.topics || []).map((topic) => ({
        ...topic,
        subject_name: subject.name,
        subject_id: subject.id
      }))
    );
  }, [subjects]);

  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const allSubjectNames = new Set(
      questions.map((question) => question.subject_name).filter(Boolean)
    );
    const availableSubjects = allSubjectNames.size || subjects.length || 0;

    const difficultyMap = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    questions.forEach((question) => {
      const difficulty = question.difficulty || 'Beginner';
      if (difficultyMap[difficulty] !== undefined) {
        difficultyMap[difficulty] += 1;
      }
    });

    const recentQuestions = [...questions]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 5).length;

    return {
      totalQuestions,
      availableSubjects,
      difficultyMap,
      recentQuestions
    };
  }, [questions, subjects]);

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const next = questions.filter((question) => {
      const matchesSearch =
        !normalizedQuery ||
        (question.question_text || '').toLowerCase().includes(normalizedQuery) ||
        (question.topic_name || '').toLowerCase().includes(normalizedQuery) ||
        (question.subject_name || '').toLowerCase().includes(normalizedQuery);

      const matchesSubject =
        selectedSubjectId === 'all' || String(question.subject_id || question.topic_id) === String(selectedSubjectId);

      const matchesTopic =
        selectedTopicId === 'all' || String(question.topic_id) === String(selectedTopicId);

      const matchesDifficulty =
        selectedDifficulty === 'all' || (question.difficulty || 'Beginner') === selectedDifficulty;

      const matchesType =
        selectedType === 'all' || (question.question_type || 'MCQ') === selectedType;

      return matchesSearch && matchesSubject && matchesTopic && matchesDifficulty && matchesType;
    });

    return [...next].sort((a, b) => {
      if (sortBy === 'oldest') {
        return Number(a.id) - Number(b.id);
      }
      return Number(b.id) - Number(a.id);
    });
  }, [questions, searchQuery, selectedSubjectId, selectedTopicId, selectedDifficulty, selectedType, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const visibleQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      ...defaultFormData,
      topic_id: topicOptions[0]?.id ? String(topicOptions[0].id) : '',
      difficulty: 'Beginner',
      correct_answer: 'A'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      topic_id: String(question.topic_id || ''),
      question_text: question.question_text || '',
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || 'A',
      difficulty: question.difficulty || 'Beginner',
      explanation: question.explanation || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.question_text.trim() || !formData.option_a.trim() || !formData.option_b.trim()) {
      setError('Please add the question text and at least two answer options before saving.');
      return;
    }

    if (!formData.topic_id) {
      setError('Select a topic before saving this question.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        topic_id: Number(formData.topic_id),
        correct_answer: String(formData.correct_answer).toUpperCase(),
        question_text: formData.question_text.trim(),
        option_a: formData.option_a.trim(),
        option_b: formData.option_b.trim(),
        option_c: formData.option_c.trim(),
        option_d: formData.option_d.trim(),
        explanation: formData.explanation.trim()
      };

      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }

      setIsModalOpen(false);
      await loadQuestions();
      if (selectedSubjectId !== 'all' || selectedTopicId !== 'all') {
        setSelectedSubjectId('all');
        setSelectedTopicId('all');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Unable to save this question. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question from the question bank? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/questions/${questionId}`);
      setQuestions((current) => current.filter((question) => question.id !== questionId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to delete this question.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubjectId('all');
    setSelectedTopicId('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSortBy('newest');
  };

  const toggleExplanation = (questionId) => {
    setExpandedQuestions((current) => ({
      ...current,
      [questionId]: !current[questionId]
    }));
  };

  const selectedSubjectTopics = useMemo(() => {
    if (selectedSubjectId === 'all') {
      return topicOptions;
    }

    return topicOptions.filter((topic) => String(topic.subject_id) === String(selectedSubjectId));
  }, [selectedSubjectId, topicOptions]);

  const metricCards = [
    {
      label: 'Total Questions',
      value: stats.totalQuestions,
      accent: 'violet',
      icon: FileQuestion,
      subtitle: 'Active MCQs in bank'
    },
    {
      label: 'Available Subjects',
      value: stats.availableSubjects,
      accent: 'cyan',
      icon: BookOpen,
      subtitle: 'Curriculum domains'
    },
    {
      label: 'Beginner',
      value: stats.difficultyMap.Beginner || 0,
      accent: 'emerald',
      icon: Sparkles,
      subtitle: 'Foundation track'
    },
    {
      label: 'Intermediate',
      value: stats.difficultyMap.Intermediate || 0,
      accent: 'amber',
      icon: SlidersHorizontal,
      subtitle: 'Skill-building'
    },
    {
      label: 'Advanced',
      value: stats.difficultyMap.Advanced || 0,
      accent: 'rose',
      icon: CheckCircle2,
      subtitle: 'Expert level'
    },
    {
      label: 'Questions Added Recently',
      value: stats.recentQuestions,
      accent: 'indigo',
      icon: Plus,
      subtitle: 'Latest 5 active records'
    }
  ];

  return (
    <div className="space-y-7 pb-12">
      <PageHeader
        badge="Question Repository"
        badgeIcon={FileQuestion}
        badgeColor="violet"
        title="Question Bank"
        subtitle="Manage conceptual assessments, curate answer explanations, and keep the learning engine aligned with your curriculum."
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] hover:shadow-violet-500/30"
          >
            <Plus className="h-4 w-4" />
            Add New Question
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
        <span className="text-slate-500">Admin</span>
        <span>/</span>
        <span>Content</span>
        <span>/</span>
        <span className="font-semibold text-violet-300">Question Bank</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const palette = {
            violet: 'border-violet-500/20 bg-violet-500/5 text-violet-300',
            cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300',
            emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
            amber: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
            rose: 'border-rose-500/20 bg-rose-500/5 text-rose-300',
            indigo: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300'
          };

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/30 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</span>
                <div className={`rounded-xl border p-2 ${palette[card.accent]}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {typeof card.value === 'number' ? card.value : 0}
                </div>
                <span className="text-[10px] text-slate-400">{card.subtitle}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/30">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search questions or concepts"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </label>

          <select
            value={selectedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All topics</option>
            {selectedSubjectTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(event) => setSelectedDifficulty(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All question types</option>
            <option value="MCQ">MCQ</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300 transition hover:border-violet-500/30 hover:text-violet-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Loading question bank</p>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center">
          <FileQuestion className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <h3 className="text-lg font-bold text-white">No questions match your filters</h3>
          <p className="mt-2 text-sm text-slate-400">Try a different subject, topic, or search text to continue curating the bank.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleQuestions.map((question, index) => {
            const isExpanded = !!expandedQuestions[question.id];
            const options = [
              { key: 'A', value: question.option_a },
              { key: 'B', value: question.option_b },
              { key: 'C', value: question.option_c },
              { key: 'D', value: question.option_d }
            ].filter((option) => option.value && String(option.value).trim());

            return (
              <motion.article
                key={question.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ y: -2 }}
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/40"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                      Q{question.id}
                    </span>
                    <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-300">
                      {question.subject_name || 'General'}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                      {question.topic_name || 'Topic'}
                    </span>
                    <DifficultyBadge difficulty={question.difficulty || 'Beginner'} size="xs" />
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(question)}
                      className="rounded-xl border border-white/10 bg-slate-950/70 p-2 text-slate-400 transition hover:border-indigo-400/30 hover:text-white"
                      title="Edit question"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(question.id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2 text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-500/10"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold leading-relaxed text-white">
                    {question.question_text}
                  </h3>

                  <div className="grid gap-2 md:grid-cols-2">
                    {options.map((option) => {
                      const isCorrect = question.correct_answer === option.key;
                      return (
                        <div
                          key={option.key}
                          className={`rounded-2xl border p-3 text-sm ${
                            isCorrect
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-slate-950/70 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {option.key}
                            </span>
                            <span className="leading-relaxed">{option.value}</span>
                            {isCorrect && <Check className="ml-auto h-4 w-4 text-emerald-300" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                      <button
                        type="button"
                        onClick={() => toggleExplanation(question.id)}
                        className="flex w-full items-center justify-between text-left text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300"
                      >
                        <span>Explanation</span>
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-200">
                          {isExpanded ? 'Hide' : 'View'}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">{question.explanation}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {filteredQuestions.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p>
            Showing <span className="font-bold text-white">{Math.min(filteredQuestions.length, (page - 1) * pageSize + visibleQuestions.length)}</span> of <span className="font-bold text-white">{filteredQuestions.length}</span> questions
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-xl border border-white/10 bg-slate-950/70 p-2 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] font-bold text-white">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-white/10 bg-slate-950/70 p-2 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Topic</label>
              <select
                value={formData.topic_id}
                onChange={(event) => setFormData((current) => ({ ...current, topic_id: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                required
              >
                <option value="">Select a topic</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.subject_name} / {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(event) => setFormData((current) => ({ ...current, difficulty: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Question text</label>
            <textarea
              rows={3}
              value={formData.question_text}
              onChange={(event) => setFormData((current) => ({ ...current, question_text: event.target.value }))}
              placeholder="Write the assessment question..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {['option_a', 'option_b', 'option_c', 'option_d'].map((field) => (
              <div key={field}>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                  {field === 'option_a' ? 'Option A' : field === 'option_b' ? 'Option B' : field === 'option_c' ? 'Option C' : 'Option D'}
                </label>
                <input
                  type="text"
                  value={formData[field]}
                  onChange={(event) => setFormData((current) => ({ ...current, [field]: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                  required={field === 'option_a' || field === 'option_b'}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Correct answer</label>
            <select
              value={formData.correct_answer}
              onChange={(event) => setFormData((current) => ({ ...current, correct_answer: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Explanation / rationale</label>
            <textarea
              rows={3}
              value={formData.explanation}
              onChange={(event) => setFormData((current) => ({ ...current, explanation: event.target.value }))}
              placeholder="Add the concept explanation to help reinforce the learning loop..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingQuestion ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
