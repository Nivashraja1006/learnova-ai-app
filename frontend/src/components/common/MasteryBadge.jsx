import React from 'react';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const MasteryBadge = ({ level, size = 'sm' }) => {
  const getStyles = () => {
    switch (level?.toLowerCase()) {
      case 'mastered':
        return {
          pill: 'bg-purple-500/15 text-purple-300 border-purple-500/35 shadow-purple-500/20',
          dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]',
        };
      case 'proficient':
        return {
          pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35 shadow-indigo-500/20',
          dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]',
        };
      case 'developing':
        return {
          pill: 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-amber-500/20',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]',
        };
      case 'novice':
      default:
        return {
          pill: 'bg-slate-800/60 text-slate-400 border-slate-700/50 shadow-black/20',
          dot: 'bg-slate-500',
        };
    }
  };

  const { pill, dot } = getStyles();
  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md font-semibold border backdrop-blur-sm shadow-sm ${sizeClasses} ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dot}`} />
      {level || 'Novice'}
    </span>
  );
};
