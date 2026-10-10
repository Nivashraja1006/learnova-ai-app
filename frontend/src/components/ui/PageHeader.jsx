import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const PageHeader = ({
  badge = 'AI System',
  title,
  subtitle,
  actions,
  badgeIcon: BadgeIcon = Sparkles,
  badgeColor = 'violet'
}) => {
  const badgeColors = {
    violet: 'bg-violet-500/10 border-violet-500/25 text-violet-300',
    indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
    amber: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  };

  const activeBadgeColor = badgeColors[badgeColor] || badgeColors.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        {badge && (
          <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold mb-2.5 backdrop-blur-sm shadow-sm ${activeBadgeColor}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
};
