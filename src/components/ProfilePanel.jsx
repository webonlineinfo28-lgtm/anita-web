import { motion } from "framer-motion";
import { BadgeCheck, Crown, X, Target, Ruler, Disc3, Heart } from "lucide-react";

import Avatar from "./Avatar.jsx";
import { BADGES } from "../lib/stats.js";
import { levelProgress } from "../lib/stats.js";

const STAT_ICONS = [
  { label: "Bingos", key: "bingos", Icon: Target, color: "#ec4899" },
  { label: "Líneas", key: "lines", Icon: Ruler, color: "#a855f7" },
  { label: "Sets DJ", key: "djSets", Icon: Disc3, color: "#22d3ee" },
  { label: "Reacciones", key: "reactionsReceived", Icon: Heart, color: "#fbbf24" },
];

export default function ProfilePanel({ user, isAdmin, avatar, stats, onClose }) {
  const prog = levelProgress(stats?.xp || 0);
  const badgeDetails = BADGES.filter((b) => (stats?.badges || []).includes(b.id));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-pink-500/20 bg-zinc-900/90 glass-card hero-epic p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-black uppercase tracking-tighter">
            Tu <span className="text-pink-500">perfil</span>
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/30 p-4">
          <Avatar config={avatar} size={84} live />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isAdmin && <Crown size={12} className="fill-yellow-400/70 text-yellow-400" />}
              <h3 className="truncate text-lg font-black uppercase tracking-tighter">
                {user}
              </h3>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">
              {prog.icon} {prog.title}
            </p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[7px] font-black uppercase tracking-widest text-zinc-500">
                <span>Nivel {prog.level}</span>
                <span>
                  {stats?.xp || 0} XP{prog.next ? ` / ${prog.nextMin} XP` : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  animate={{ width: `${prog.pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {STAT_ICONS.map(({ label, key, Icon, color }) => (
            <div key={key} className="rounded-xl border border-white/5 bg-white/5 px-1 py-2">
              <div className="flex justify-center">
                <Icon size={16} style={{ color }} />
              </div>
              <p className="mt-0.5 text-sm font-black text-white">{stats?.[key] || 0}</p>
              <p className="text-[6px] font-black uppercase tracking-widest text-zinc-600">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
            <BadgeCheck size={12} className="text-pink-500" />
            Insignias ({badgeDetails.length}/{BADGES.length})
          </p>
          {badgeDetails.length ? (
            <div className="grid grid-cols-3 gap-1.5">
              {badgeDetails.map((b) => (
                <div
                  key={b.id}
                  title={b.desc}
                  className="flex flex-col items-center rounded-xl border px-1 py-2 text-center"
                  style={{ borderColor: `${b.color || "#ec4899"}40`, background: `${b.color || "#ec4899"}10` }}
                >
                  <span className="text-sm font-black" style={{ color: b.color || "#ec4899" }}>{b.icon}</span>
                  <span className="mt-0.5 text-[6px] font-black uppercase tracking-wider" style={{ color: b.color || "#ec4899" }}>
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-center text-[8px] font-black uppercase italic tracking-widest text-zinc-600">
              Consigue tu primera insignia jugando al bingo o pinchando
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
