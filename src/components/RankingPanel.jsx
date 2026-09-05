import { Crown, Medal, Star, Trophy } from "lucide-react";

import Avatar from "./Avatar.jsx";
import { levelFromXp } from "../lib/stats.js";

// Ranking del festival basado en bingos permanentes, con avatares y niveles.
// El XP se deriva del conteo de bingos (150 XP cada uno) para mostrar nivel.
export default function RankingPanel({ permanentCounts, winners, avatars = {} }) {
  const sorted = Object.entries(permanentCounts || {})
    .map(([user, count]) => ({ user, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const hasBingos = sorted.some((s) => s.count > 0);
  const lastWinner = winners?.slice().reverse().find((w) => w.winType === "bingo");

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-pink-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Leyendas del festival
          </span>
        </div>
        {hasBingos && (
          <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-pink-400">
            {sorted.reduce((acc, s) => acc + s.count, 0)} bingos
          </span>
        )}
      </div>

      {hasBingos ? (
        <div className="space-y-2">
          {sorted.map((entry, i) => {
            const xp = entry.count * 150;
            const lvl = levelFromXp(xp);
            return (
              <div
                key={entry.user}
                className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 transition-all ${
                  i === 0
                    ? "border-yellow-400/20 bg-gradient-to-r from-yellow-500/15 to-pink-500/10"
                    : "border-white/5 bg-zinc-900/30"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                    {i === 0 ? (
                      <Crown size={16} className="fill-yellow-400/70 text-yellow-400" />
                    ) : (
                      <Medal size={14} className="text-zinc-500" />
                    )}
                  </span>
                  <Avatar config={avatars[entry.user]} size={28} />
                  <div className="min-w-0">
                    <span className="block truncate text-[10px] font-black uppercase tracking-widest text-zinc-300">
                      {entry.user}
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">
                      {lvl.icon} {lvl.title}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Star size={10} className="fill-pink-500/40 text-pink-500" />
                  <span className="text-sm font-black text-pink-400">
                    {entry.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-2 py-3 text-center text-[9px] font-black uppercase italic tracking-widest text-zinc-800">
          Aún no hay leyendas… el primer bingo de la historia está por llegar
        </p>
      )}

      {lastWinner && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <p className="truncate px-1 text-[8px] font-medium uppercase tracking-widest text-zinc-600">
            Último bingo:{" "}
            <span className="font-black text-pink-400">{lastWinner.user}</span> ·{" "}
            {new Date(lastWinner.timestamp).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}