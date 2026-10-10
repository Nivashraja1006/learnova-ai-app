import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Users,
  Search,
  Trash2,
  GraduationCap,
  Sparkles,
  Flame,
  Award,
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently remove student account "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete student.');
    }
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.target_subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Institutional Roster"
        badgeIcon={Users}
        badgeColor="indigo"
        title="Student Management"
        subtitle="View registered students, enrolled subject tracks, academic levels, and study streaks."
        actions={
          <div className="px-3.5 py-1.5 rounded-xl glass-panel border border-white/10 text-xs font-mono font-bold text-slate-300">
            {students.length} Total Enrolled
          </div>
        }
      />

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, or target subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Loading roster...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3 max-w-md mx-auto">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Students Found</h3>
          <p className="text-xs text-slate-400">Try modifying your search query.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/60">
                  <th className="py-3.5 px-6 font-bold">Student Name</th>
                  <th className="py-3.5 px-6 font-bold">Email</th>
                  <th className="py-3.5 px-6 font-bold">Target Track</th>
                  <th className="py-3.5 px-6 font-bold">Academic Tier</th>
                  <th className="py-3.5 px-6 font-bold text-center">Streak</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 font-bold text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">{s.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {s.target_subject || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-[11px]">{s.education_level || 'Undergraduate'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{s.streak_days || 1}d</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
                        title="Delete Student Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
