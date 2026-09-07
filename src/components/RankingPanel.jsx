import { Crown, Medal, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import Avatar from "./Avatar.jsx";
import { levelFromXp } from "../lib/stats.js";

const PODIUM_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-zinc-300 to-zinc-400",
  "from-amber-600 to-amber-700",
];

const PODIUM_HEIGHT = ["h-20", "h-14", "h-10"];

export default function RankingPanel({ permanentCounts, winners, avatars = {} }) {
  const sorted = Object.entries(permanentCounts || {})
    .map(([user, count]) => ({ user, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const hasBingos = sorted.some((s) => s.count > 0);
  const lastWinner = winners?.slice().reverse().find((w) => w.winType === "bingo");

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-pink-500" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
            Leyendas del festival
          </span>
        </div>
        {hasBingos && (
          <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-pink-400">
            {sorted.reduce((acc, s) => acc + s.count, 0)} bingos
          </span>
        )}
      </div>

      {hasBingos ? (
        <div className="space-y-2">
          {sorted.map((entry, i) => {
            const xp = entry.count * 150;
            const lvl = levelFromXp(xp);
            const isFirst = i === 0;

            return (
              <motion.div
                key={entry.user}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-all ${
                  isFirst
                    ? "border-yellow-400/20 bg-gradient-to-r from-yellow-500/15 to-pink-500/10"
                    : "border-white/5 bg-zinc-900/30"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {i === 0 ? (
                      <Crown size={18} className="fill-yellow-400/70 text-yellow-400" />
                    ) : i === 1 ? (
                      <Medal size={16} className="text-zinc-400" />
                    ) : i === 2 ? (
                      <Medal size={16} className="text-amber-600" />
                    ) : (
                      <span className="text-xs font-black text-zinc-600">#{i + 1}</span>
                    )}
                  </span>
                  <div className="shrink-0">
                    <Avatar config={avatars[entry.user]} size={40} />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold uppercase tracking-wider text-zinc-300">
                      {entry.user}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      {lvl.icon} {lvl.title}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Star size={12} className="fill-pink-500/40 text-pink-500" />
                  <span className="text-lg font-black text-pink-400">
                    {entry.count}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-zinc-700 opacity-30" />
          <p className="text-xs font-black uppercase italic tracking-widest text-zinc-700">
            Aún no hay leyendas… el primer bingo de la historia está por llegar
          </p>
        </div>
      )}

      {lastWinner && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="truncate px-1 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Último bingo:{" "}
            <span className="font-black text-pink-400">{lastWinner.user}</span>
            {lastWinner.timestamp &&
              !Number.isNaN(new Date(lastWinner.timestamp).getTime()) && (
                <>
                  {" "}·{" "}
                  {new Date(lastWinner.timestamp).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
          </p>
        </div>
      )}
    </div>
  );
}

