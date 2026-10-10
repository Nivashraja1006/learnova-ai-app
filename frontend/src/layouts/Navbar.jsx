import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Bell, 
  Flame, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user && !isAdmin) {
      loadNotifications();
    }
  }, [user, isAdmin]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/students/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/students/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadList = notifications.filter(n => !n.is_read);
      await Promise.all(unreadList.map(n => api.put(`/students/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const streakDays = user?.profile?.streak_days || 1;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] bg-[#060911]/85 backdrop-blur-2xl">
      {/* Specular hairline top accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full">
        {/* Left Section: Mobile Menu + Brand Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition lg:hidden"
            aria-label="Toggle Sidebar Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105 border border-white/20">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#060911]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  LEARNOVA<span className="text-violet-400 font-extrabold">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-extrabold tracking-widest px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                  v2.5 ML
                </span>
              </div>
              <span className="hidden md:block text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                Adaptive Cognitive Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: Streak, Notifications, Profile, Role, Logout */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Learning Streak Pill (for students) */}
          {!isAdmin && user && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold shadow-sm shadow-amber-500/10 cursor-default"
              title={`${streakDays} consecutive day study streak!`}
            >
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Streak</span>
            </motion.div>
          )}

          {/* Notifications Dropdown */}
          {!isAdmin && user && (
            <div className="relative" ref={notifRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={`relative p-2 rounded-xl text-slate-400 hover:text-white transition border ${
                  showNotifMenu
                    ? 'bg-slate-800 text-white border-white/10'
                    : 'hover:bg-slate-800/80 border-transparent hover:border-white/5'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-400 rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-[#060911]" />
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel bg-[#0b0f19]/95 border border-white/10 rounded-3xl shadow-2xl shadow-black/70 p-4 z-50 backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-violet-400" />
                        <h4 className="text-sm font-bold text-white">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-violet-400 hover:text-violet-300 transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">All caught up! No notifications.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all duration-200 ${
                              n.is_read
                                ? 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/70'
                                : 'bg-gradient-to-r from-violet-950/40 to-slate-900/80 border-violet-500/30 text-slate-200 hover:border-violet-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white">{n.title}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Info & Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-white/10 group text-left"
            >
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition leading-tight">
                  {user?.name || 'Account'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1 mt-0.5">
                  {isAdmin ? (
                    <span className="text-amber-400 font-semibold flex items-center space-x-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Faculty</span>
                    </span>
                  ) : (
                    <span className="text-indigo-300 font-medium">Student Learner</span>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-500/25 border border-white/20 group-hover:scale-105 transition">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-60 glass-panel bg-[#0b0f19]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl"
                >
                  <div className="p-3 border-b border-white/10 mb-1">
                    <div className="text-xs font-bold text-white">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>

                  {!isAdmin && (
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>My Profile & Settings</span>
                    </Link>
                  )}

                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Admin Analytics</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                    >
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Student Dashboard</span>
                    </Link>
                  )}

                  <div className="pt-1 mt-1 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
