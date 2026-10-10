import React from 'react';
import { motion } from 'framer-motion';

export const AmbientBackground = ({ children, variant = 'default' }) => {
  return (
    <div className="relative min-h-screen bg-[#060911] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />

      {/* Floating Animated Ambient Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed top-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] pointer-events-none z-0"
      />

      <motion.div
        animate={{
          x: [0, -40, 25, 0],
          y: [0, 35, -25, 0],
          scale: [1, 0.92, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-indigo-900/10 blur-[140px] pointer-events-none z-0"
      />

      {variant === 'landing' && (
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="fixed top-[30%] left-[40%] w-[600px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/15 to-purple-500/15 blur-[160px] pointer-events-none z-0"
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
