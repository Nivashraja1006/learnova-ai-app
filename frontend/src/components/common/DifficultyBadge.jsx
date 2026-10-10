import React from 'react';

export const DifficultyBadge = ({ difficulty, size = 'sm' }) => {
  const getStyles = () => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        };
      case 'intermediate':
        return {
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/10',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
        };
      case 'advanced':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-rose-500/10',
          dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
        };
      default:
        return {
          pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-indigo-500/10',
          dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
        };
    }
  };

  const { pill, dot } = getStyles();
  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border backdrop-blur-sm shadow-sm tracking-wide ${sizeClasses} ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dot}`} />
      {difficulty || 'All Levels'}
    </span>
  );
};
