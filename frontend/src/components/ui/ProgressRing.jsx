import React, { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { clampPercentage } from '../../utils/formatters';

export const ProgressRing = ({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  colorGradient = ['#8b5cf6', '#6366f1'],
  label,
  sublabel
}) => {
  const rawId = useId();
  const gradientId = `ring-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const isFirstMount = useRef(true);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clampPercentage(percentage);
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const initialOffset = isFirstMount.current ? circumference : false;
  isFirstMount.current = false;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorGradient[0]} />
            <stop offset="100%" stopColor={colorGradient[1]} />
          </linearGradient>
          <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={initialOffset !== false ? { strokeDashoffset: initialOffset } : false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
          filter={`url(#glow-${gradientId})`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums font-mono">
          {label !== undefined ? (
            label
          ) : (
            <AnimatedNumber value={`${Math.round(clamped)}%`} duration={900} />
          )}
        </span>
        {sublabel && (
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
