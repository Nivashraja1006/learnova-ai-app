import React from 'react';
import { motion } from 'framer-motion';

export const ProgressRing = ({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  colorGradient = ['#8b5cf6', '#6366f1'],
  label,
  sublabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const gradientId = `ring-grad-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
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
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
          filter={`url(#glow-${gradientId})`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {label !== undefined ? label : `${Math.round(clamped)}%`}
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
