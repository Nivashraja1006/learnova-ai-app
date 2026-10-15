import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Compass,
  Target,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  Layers,
  ChevronRight,
  Activity,
  Check,
  X
} from 'lucide-react';
import { AnimatedNumber, AnimatedCounter } from '../components/ui/AnimatedNumber';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('weakness');

  const demoScenarios = {
    weakness: {
      tag: 'Practice Reinforcement Needed',
      tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      title: 'Exception Handling & Tracebacks',
      score: 42,
      scoreColor: 'text-rose-400',
      barColor: 'from-rose-500 to-pink-500',
      reason: 'AI detected low score (42%) in try-except hierarchy and custom exceptions. Scheduled immediate 5-question targeted micro-quiz.',
      actionText: 'Take Targeted Practice',
      actionLink: '/login',
      status: 'Weakness Hotspot Detected'
    },
    prereq: {
      tag: 'Prerequisite Satisfied',
      tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      title: 'Functions & Scope Closures',
      score: 82,
      scoreColor: 'text-indigo-400',
      barColor: 'from-indigo-500 to-violet-500',
      reason: 'Prerequisite Control Flow achieved (82%). Engine automatically unlocked Advanced Functions (*args/**kwargs and lambda expressions).',
      actionText: 'Start Next Module',
      actionLink: '/login',
      status: 'Pathway Unlocked'
    },
    mastery: {
      tag: 'Mastery Level Achieved',
      tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      title: 'Object-Oriented Programming (OOP)',
      score: 92,
      scoreColor: 'text-purple-400',
      barColor: 'from-purple-500 to-fuchsia-500',
      reason: 'Demonstrated 92% mastery across multiple quizzes. Engine promoted difficulty level to Advanced with algorithmic edge cases.',
      actionText: 'Explore Advanced Track',
      actionLink: '/login',
      status: 'Promoted to Advanced Tier'
    }
  };

  const currentDemo = demoScenarios[activeTab];

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Grids and Ambient Glow */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-[20%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-violet-600/15 via-pink-600/10 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.08] bg-[#060911]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                LEARNOVA<span className="text-violet-400">.AI</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
                SaaS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition tracking-wide">How It Works</a>
            <a href="#ai-preview" className="hover:text-white transition tracking-wide">AI Simulator</a>
            <a href="#features" className="hover:text-white transition tracking-wide">Features</a>
            <a href="#comparison" className="hover:text-white transition tracking-wide">Platform Comparison</a>
            <a href="#stats" className="hover:text-white transition tracking-wide">Metrics</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition border border-transparent hover:border-white/10"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-[1.02] border border-white/20 animate-shimmer"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-fuchsia-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold mb-6 shadow-sm shadow-violet-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Next-Gen Machine Learning Curriculum Engine</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-white font-mono font-normal">v2.5</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6"
          >
            Learning That <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              Adapts to You.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 font-normal leading-relaxed"
          >
            AI-driven personalized education that evaluates conceptual mastery, isolates learning bottlenecks, and continuously adapts your syllabus in real-time.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] border border-white/20 group"
            >
              <span>Start Free Diagnostic Assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-slate-200 glass-panel hover:bg-slate-800/80 border border-white/10 flex items-center justify-center space-x-2 transition-all duration-300 hover:border-violet-500/30"
            >
              <span>Explore Demo Account</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>

          {/* Floating Metric Preview Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Knowledge Engine</div>
              <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Brain className="w-4 h-4 text-violet-400" />
                <span>Decision Tree ML</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recalibration Speed</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>&lt; 24ms Real-Time</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dynamic Sequencing</div>
              <div className="text-sm font-bold text-indigo-300 flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Prerequisite Graph</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cognitive Velocity</div>
              <div className="text-sm font-bold text-amber-300 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Latency Modeling</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Trust Bar */}
      <div className="py-6 border-y border-white/[0.08] bg-[#060911]/60 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-slate-400 font-semibold">
          <span className="text-slate-500 uppercase tracking-widest text-[10px]">Built With Modern Enterprise Tech:</span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>FastAPI Python</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Scikit-Learn ML</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>React 19 & Vite</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Framer Motion</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Tailwind CSS</span>
          </span>
        </div>
      </div>

      {/* Interactive AI Recommendation Preview Simulator */}
      <section id="ai-preview" className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Demonstration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Learnova AI Diagnoses Your Needs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Click the scenarios below to see how our Machine Learning models detect friction points and dynamically recalibrate your pathway.
            </p>
          </div>

          {/* Simulator Tabs */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <button
              onClick={() => setActiveTab('weakness')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'weakness'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              1. Weakness Detection
            </button>
            <button
              onClick={() => setActiveTab('prereq')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'prereq'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              2. Prerequisite Unlocking
            </button>
            <button
              onClick={() => setActiveTab('mastery')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'mastery'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              3. Advanced Mastery Acceleration
            </button>
          </div>

          {/* Interactive Card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1322] to-slate-950 shadow-2xl"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-2.5 ${currentDemo.tagColor}`}>
                  {currentDemo.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{currentDemo.title}</h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                  <span>Engine State:</span>
                  <span className="text-violet-300 font-semibold">{currentDemo.status}</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-medium">Concept Proficiency</div>
                <div className={`text-4xl font-black font-mono ${currentDemo.scoreColor}`}>
                  <AnimatedNumber value={`${currentDemo.score}%`} />
                </div>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Benchmark Progress Indicator</span>
                  <span className="font-mono text-white font-bold">
                    <AnimatedNumber value={`${currentDemo.score}%`} /> / 100%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={false}
                    animate={{ width: `${currentDemo.score}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${currentDemo.barColor}`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                <span className="text-violet-400 font-bold">AI Diagnosis Rationale: </span>
                "{currentDemo.reason}"
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Scikit-Learn classification cluster updated in live database</span>
              </div>

              <Link
                to={currentDemo.actionLink}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-1.5 transition self-start sm:self-auto"
              >
                <span>{currentDemo.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works (4 Sequenced Steps) */}
      <section id="how-it-works" className="py-24 bg-[#0a0e1a]/40 border-y border-white/[0.08] relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
              <Target className="w-3.5 h-3.5" />
              <span>Intelligent Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Learnova AI Customizes Your Path
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Our 4-stage pipeline turns standard curriculum into a living, responsive learning engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Diagnostic Baseline',
                desc: 'Take an initial multi-topic assessment. The engine calculates latency and baseline accuracy across all prerequisite concepts.',
                icon: Target,
                color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10'
              },
              {
                step: '02',
                title: 'Machine Learning Analysis',
                desc: 'A decision-tree ML classifier categorizes your knowledge level, clusters error distributions, and identifies weak topics.',
                icon: Brain,
                color: 'text-violet-400 border-violet-500/20 bg-violet-500/10'
              },
              {
                step: '03',
                title: 'Dynamic Prerequisite Path',
                desc: 'Our engine generates a sequenced roadmap that unlocks new topics only when foundational concepts achieve ≥75% mastery.',
                icon: Compass,
                color: 'text-purple-400 border-purple-500/20 bg-purple-500/10'
              },
              {
                step: '04',
                title: 'Targeted Mastery Quizzes',
                desc: 'Reinforce weak concepts with curated study notes, practice questions, milestone badges, and real-time score progression.',
                icon: Award,
                color: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/10'
              }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover relative group bg-gradient-to-b from-slate-900/80 to-[#0b0f19]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-indigo-400/40 font-mono">{s.step}</span>
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 text-[10px] text-slate-500 flex items-center space-x-1">
                    <span>Phase {s.step} Complete</span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Capabilities 6-Card Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Academic & Technical Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Every feature is built on genuine algorithmic recommendation logic, not hardcoded mock data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Knowledge-Level ML Classifier',
                desc: 'Categorizes learners into Beginner, Intermediate, and Advanced tiers using Scikit-Learn depth-3 decision trees.',
                icon: Brain,
                color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
              },
              {
                title: 'Weakness Hotspot Detection',
                desc: 'Automatically isolates concepts with accuracy below 60% and schedules targeted reinforcement exercises immediately.',
                icon: Zap,
                color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              },
              {
                title: 'Dynamic Prerequisite Mapping',
                desc: 'Curriculum topics are chained with dependencies. Advanced concepts stay locked until fundamental precursors are conquered.',
                icon: Layers,
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
              },
              {
                title: 'Interactive Question Bank & Quizzes',
                desc: 'Diagnostic assessments with timed MCQ challenges, review flagging, instant scoring, and detailed algorithmic rationales.',
                icon: BookOpen,
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
              },
              {
                title: 'Cognitive Velocity Analytics',
                desc: 'Tracks latency per problem and score gradient trajectory across repeated attempts to determine learning speed.',
                icon: TrendingUp,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              },
              {
                title: 'Gamification & Achievement Badges',
                desc: 'Multi-day focus streaks, milestone unlocks, andCollectible achievement badges celebrate authentic academic progress.',
                icon: Award,
                color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 glass-card-hover flex flex-col justify-between bg-gradient-to-br from-slate-900/80 to-[#0d1322]"
                >
                  <div>
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-5 ${f.color}`}>
                      <Icon className="w-5 h-5 text-current" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-[11px] text-slate-500">
                    <span>Active In Engine</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Traditional vs Learnova AI */}
      <section id="comparison" className="py-24 bg-[#0a0e1a]/60 border-y border-white/[0.08] relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Comparative Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Static Learning vs Learnova AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Why modern engineering students achieve higher retention with adaptive ML systems.
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 p-4 sm:p-6 bg-slate-900/90 border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <div>Feature</div>
              <div className="text-slate-500">Traditional Platforms</div>
              <div className="text-violet-400">Learnova AI Platform</div>
            </div>

            {[
              {
                feature: 'Curriculum Progression',
                trad: 'Fixed linear order for all students',
                learnova: 'Dynamic prerequisite graphs adapted to score',
              },
              {
                feature: 'Weakness Treatment',
                trad: 'Manual review or re-reading notes',
                learnova: 'Automated weak topic isolation & micro-quizzes',
              },
              {
                feature: 'Difficulty Calibration',
                trad: 'Static difficulty set by instructor',
                learnova: 'ML classification adapts Beginner/Int/Adv',
              },
              {
                feature: 'Cognitive Velocity',
                trad: 'Untracked (only final grades)',
                learnova: 'Tracks problem solving latency & pace',
              },
              {
                feature: 'Diagnostic Feedback',
                trad: 'Generic percentage score',
                learnova: 'Instant AI diagnostic critique with next steps',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 p-4 sm:p-6 border-b border-white/5 text-xs items-center hover:bg-slate-900/40 transition"
              >
                <div className="font-semibold text-white pr-2">{row.feature}</div>
                <div className="text-slate-400 flex items-center space-x-1.5 pr-2">
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{row.trad}</span>
                </div>
                <div className="text-indigo-300 font-semibold flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{row.learnova}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section id="stats" className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1 font-mono">
                <AnimatedCounter value="6+" />
              </div>
              <div className="text-xs text-slate-400 font-medium">Core Tech Subjects</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="text-3xl sm:text-4xl font-black text-violet-400 mb-1 font-mono">
                <AnimatedCounter value="32+" />
              </div>
              <div className="text-xs text-slate-400 font-medium">Curriculum Topics</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="text-3xl sm:text-4xl font-black text-fuchsia-400 mb-1 font-mono">
                <AnimatedCounter value="100%" />
              </div>
              <div className="text-xs text-slate-400 font-medium">Data-Driven AI Logic</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1 font-mono">
                &lt; 24ms
              </div>
              <div className="text-xs text-slate-400 font-medium">Real-Time Evaluation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 relative z-10 bg-gradient-to-b from-transparent via-violet-950/20 to-[#060911] border-t border-white/[0.08] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready To Unlock Your Potential?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Experience Personalized Learning Today.
          </h2>

          <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Take our 10-question diagnostic test to immediately reveal your knowledge tier and generate your adaptive roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.02] border border-white/20 animate-shimmer"
            >
              Start Free Assessment
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-slate-300 glass-panel hover:bg-slate-800/80 border border-white/10 transition"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/[0.08] text-xs text-slate-500 relative z-10 bg-[#060911]/90">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-300">LEARNOVA AI</span>
            <span>— "Your Learning Path. Powered by AI."</span>
          </div>
          <div>Academic Final Year Capstone Project Demonstration</div>
        </div>
      </footer>
    </div>
  );
};
