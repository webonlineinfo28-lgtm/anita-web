import { motion } from "framer-motion";
import { BadgeCheck, Crown, X, Target, Ruler, Disc3, Heart, Sparkles } from "lucide-react";

import Avatar from "./Avatar.jsx";
import StatIcon from "./StatIcon.jsx";
import { BADGES } from "../lib/stats.js";
import { levelProgress } from "../lib/stats.js";
import { STAT_COLORS } from "../lib/colors.js";


const STAT_ICONS = [
  { label: "Bingos", key: "bingos", Icon: Target, color: STAT_COLORS.bingos },
  { label: "Líneas", key: "lines", Icon: Ruler, color: STAT_COLORS.lines },
  { label: "Sets DJ", key: "djSets", Icon: Disc3, color: STAT_COLORS.djSets },
  { label: "Reacciones", key: "reactionsReceived", Icon: Heart, color: STAT_COLORS.reactionsReceived },
];

export default function ProfilePanel({ user, isAdmin, avatar, stats, onClose }) {
  const prog = levelProgress(stats?.xp || 0);
  const badgeDetails = BADGES.filter((b) => (stats?.badges || []).includes(b.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl glass-card-heavy border border-pink-500/20 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter">
            Tu <span className="text-gradient-cosmic">perfil</span>
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/30 p-4 mb-6">
          <Avatar config={avatar} size={84} live />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isAdmin && <Crown size={14} className="fill-yellow-400/70 text-yellow-400" />}
              <h3 className="truncate text-lg font-black uppercase tracking-tighter">
                {user}
              </h3>
            </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-400">
              <StatIcon name={prog.icon} size={13} className="inline" /> {prog.title}
            </p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>Nivel {prog.level}</span>
                <span>
                  {stats?.xp || 0} XP{prog.next ? ` / ${prog.nextMin} XP` : ""}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${prog.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {STAT_ICONS.map(({ label, key, Icon, color }) => (
            <div key={key} className="rounded-xl border border-white/5 bg-white/5 px-2 py-3 text-center">
              <div className="flex justify-center">
                <Icon size={18} style={{ color }} />
              </div>
              <p className="mt-1 text-lg font-black text-white">{stats?.[key] || 0}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <BadgeCheck size={14} className="text-pink-500" />
            Insignias ({badgeDetails.length}/{BADGES.length})
          </p>
          {badgeDetails.length ? (
            <div className="grid grid-cols-3 gap-2">
              {badgeDetails.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{ scale: 1.05 }}
                  title={b.desc}
                  className="flex flex-col items-center rounded-xl border px-2 py-3 text-center cursor-default"
                  style={{ borderColor: `${b.color || "#ec4899"}40`, background: `${b.color || "#ec4899"}10` }}
                >
                                     <StatIcon name={b.icon} size={22} style={{ color: b.color || "#ec4899" }} />
                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider" style={{ color: b.color || "#ec4899" }}>
                    {b.name}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-6 text-center">
              <Sparkles size={24} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-600">
                Consigue tu primera insignia jugando al bingo o pinchando
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

