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
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, collapsed = false, onToggleCollapse }) => {
  const { isAdmin, user } = useAuth();

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
    { to: '/admin/questions', label: 'Question Bank', icon: FileQuestion },
    { to: '/admin/quizzes', label: 'Manage Quizzes', icon: HelpCircle },
    { to: '/admin/materials', label: 'Learning Materials', icon: BookOpen },
  ];

  const links = isAdmin ? adminLinks : studentLinks;
  const brandText = isAdmin ? 'ADMIN' : 'STUDENT';

  return (
    <>
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
        fixed top-16 bottom-0 left-0 z-40 glass-panel bg-[#090d18]/95 border-r border-white/[0.08]
        transition-all duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        ${collapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/20 via-transparent to-violet-500/20 pointer-events-none" />

        <div className="flex flex-col h-full py-4 px-2.5">
          <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-white/[0.08]">
            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-2'}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-400 shadow-md shadow-violet-500/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black tracking-[0.3em] text-slate-500">LEARNOVA</span>
                  <span className="text-[9px] font-semibold text-violet-300">AI</span>
                </div>
              )}
            </div>
            {!collapsed && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-lg border border-white/10 bg-slate-900/80 p-1.5 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-300"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {collapsed && onToggleCollapse && (
            <div className="mb-3 flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-lg border border-white/10 bg-slate-900/80 p-1.5 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-300"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className={`px-2 pb-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 ${collapsed ? 'text-center' : 'flex items-center justify-between'}`}>
            {!collapsed && <span>{brandText}</span>}
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) => `
                    relative flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActivePill"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent pointer-events-none"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                        <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-400'
                        }`} />
                        {!collapsed && <span className="tracking-wide">{link.label}</span>}
                      </div>

                      {!collapsed && link.badge && (
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

          <div className="pt-4 mt-auto border-t border-white/[0.08]">
            <div className={`rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 p-2.5 shadow-inner ${collapsed ? 'px-2 py-2.5' : ''}`}>
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-1.5`}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-1.5'} text-violet-400 text-[10px] font-bold`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {!collapsed && <span>Learnova ML Engine</span>}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[9px] text-emerald-400">ONLINE</span>
                  </div>
                )}
              </div>
              {!collapsed && (
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Scikit-learn decision tree & prerequisite graph actively recalibrating.
                </p>
              )}
            </div>

            {!collapsed && user && (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-violet-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-white">{user.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">{isAdmin ? 'Admin' : 'Student'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
