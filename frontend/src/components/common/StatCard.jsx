import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const StatCard = ({ title, value, icon: Icon, subtitle, trend, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      gradient: 'from-indigo-600/15 via-indigo-900/5 to-transparent',
      glow: 'shadow-indigo-500/5 hover:shadow-indigo-500/15',
      iconBg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      gradient: 'from-emerald-600/15 via-emerald-900/5 to-transparent',
      glow: 'shadow-emerald-500/5 hover:shadow-emerald-500/15',
      iconBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      gradient: 'from-amber-600/15 via-amber-900/5 to-transparent',
      glow: 'shadow-amber-500/5 hover:shadow-amber-500/15',
      iconBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      gradient: 'from-rose-600/15 via-rose-900/5 to-transparent',
      glow: 'shadow-rose-500/5 hover:shadow-rose-500/15',
      iconBg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      gradient: 'from-cyan-600/15 via-cyan-900/5 to-transparent',
      glow: 'shadow-cyan-500/5 hover:shadow-cyan-500/15',
      iconBg: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      gradient: 'from-purple-600/15 via-purple-900/5 to-transparent',
      glow: 'shadow-purple-500/5 hover:shadow-purple-500/15',
      iconBg: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden bg-gradient-to-br ${scheme.gradient} border ${scheme.border} ${scheme.glow} transition-all duration-300 group`}
    >
      {/* Specular Top Border Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${scheme.iconBg}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2.5">
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
          <AnimatedNumber value={value} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
