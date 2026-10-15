import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/client';
import confetti from 'canvas-confetti';
import { PageHeader } from '../components/ui/PageHeader';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  Award,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
  Lock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/achievements');
      setAchievements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-violet-400" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-indigo-400" />;
      case 'Award':
      default:
        return <Award className="w-6 h-6 text-purple-400" />;
    }
  };

  const handleBadgeClick = (isUnlocked) => {
    if (isUnlocked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          Loading Gamification Achievements...
        </p>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <PageHeader
        badge="Academic Milestones & Gamification"
        badgeIcon={Sparkles}
        badgeColor="violet"
        title="Badges & Achievements"
        subtitle="Unlock distinguished honors as you conquer diagnostic assessments, build daily study habits, and master technical topics."
        actions={
          <div className="px-4 py-2 rounded-2xl glass-panel border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unlocked Badges</div>
            <div className="text-lg font-black text-violet-400 font-mono">
              <AnimatedNumber value={`${unlockedCount} / ${achievements.length}`} />
            </div>
          </div>
        }
      />

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const isUnlocked = ach.is_unlocked;
          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => handleBadgeClick(isUnlocked)}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                isUnlocked
                  ? 'glass-panel bg-gradient-to-br from-slate-900/90 via-violet-950/25 to-slate-900/90 border-violet-500/35 shadow-xl shadow-violet-500/10'
                  : 'bg-slate-950/40 border-white/5 opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-violet-500/30 shadow-lg shadow-violet-500/15'
                      : 'bg-slate-950 border-white/5 text-slate-600'
                  }`}>
                    {isUnlocked ? getIcon(ach.icon) : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isUnlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-slate-900 text-slate-500 border-white/5'
                  }`}>
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">{ach.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{ach.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Criteria: {ach.criteria_type}</span>
                {isUnlocked && (
                  <span className="text-violet-400 font-semibold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Honored</span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
