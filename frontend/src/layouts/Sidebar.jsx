import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  BrainCircuit,
  Compass,
  BookOpen,
  HelpCircle,
  BarChart3,
  Award,
  User,
  Users,
  FolderTree,
  FileQuestion,
  Layers,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assessment', label: 'Initial Assessment', icon: ClipboardCheck },
    { to: '/ai-analysis', label: 'AI Student Analysis', icon: BrainCircuit, badge: 'AI ML' },
    { to: '/learning-path', label: 'Learning Path', icon: Compass },
    { to: '/materials', label: 'Study Content', icon: BookOpen },
    { to: '/quizzes', label: 'Quizzes & Practice', icon: HelpCircle },
    { to: '/performance', label: 'Performance Report', icon: BarChart3 },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview Analytics', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Manage Students', icon: Users },
    { to: '/admin/subjects', label: 'Manage Subjects', icon: FolderTree },
    { to: '/admin/topics', label: 'Manage Topics', icon: Layers },
    { to: '/admin/questions', label: 'Question Bank (MCQ)', icon: FileQuestion },
    { to: '/admin/quizzes', label: 'Manage Quizzes', icon: HelpCircle },
    { to: '/admin/materials', label: 'Learning Materials', icon: BookOpen },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel bg-[#060911]/95 border-r border-white/[0.08]
        transition-all duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Specular right line */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />

        <div className="flex flex-col h-full py-5 px-3.5">
          {/* Section Heading */}
          <div className="px-3 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
            <span>{isAdmin ? 'ADMINISTRATIVE CONSOLE' : 'STUDENT WORKSPACE'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => `
                    relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Pill Glow */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActivePill"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent pointer-events-none"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <div className="flex items-center space-x-3 relative z-10">
                        <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-400'
                        }`} />
                        <span className="tracking-wide">{link.label}</span>
                      </div>

                      {link.badge && (
                        <span className="relative z-10 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/35 uppercase tracking-wider">
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom AI System Status Card */}
          <div className="pt-4 mt-auto border-t border-white/[0.08]">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 border border-indigo-500/20 shadow-inner">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 text-violet-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Learnova ML Engine</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">ONLINE</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Scikit-learn decision tree & prerequisite graph actively recalibrating.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
