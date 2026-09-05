import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Disc3,
  ListMusic,
  Radio,
  Shuffle,
  UserMinus,
  UserPlus,
  X,
  Sliders,
} from "lucide-react";

import Avatar from "./Avatar.jsx";
import { AVATAR_PALETTES } from "../lib/avatars.js";

// Burbujas flotantes para las reacciones.
function Bursts({ bursts }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {bursts.map((b) => {
          const Icon = b.icon;
          return (
            <motion.span
              key={b.id}
              initial={{ opacity: 0, y: 10, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], y: -90, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2"
              style={{ color: b.color || "#ec4899" }}
            >
              <Icon size={32} />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Cabina del DJ: quien esta pinchando, la canción en el aire y la lista de espera.
export default function DjBoothCard({
  currentDj,
  djAvatar,
  djTitle = "Novato Cósmico",
  track,
  progress = 0,
  isAdmin,
  sessionUser,
  waitlist = [],
  avatars = {},
  bursts = [],
  inWaitlist,
  onJoin,
  onLeave,
  onEject,
  onOpenWheel,
  reactionsTotal = 0,
}) {
  const accent = AVATAR_PALETTES.accent[djAvatar?.accent] || "#ec4899";
  const isHostPlayer = isAdmin && currentDj === sessionUser;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(60% 90% at 50% 0%, ${accent}55, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative shrink-0">
          <Avatar config={djAvatar} size={88} live />
          <span
            className="absolute -inset-1.5 rounded-full border-2"
            style={{ borderColor: `${accent}66` }}
          />
          {isAdmin && (
            <span className="absolute -right-2 -top-2 z-10 rounded-full border border-yellow-400/40 bg-yellow-500/20 p-1">
              <Crown size={12} className="text-yellow-400" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/15 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-pink-400">
              <Radio size={8} className="animate-pulse" /> En directo
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
              {djTitle}
            </span>
          </div>

          <h2 className="mt-1 truncate text-2xl font-black uppercase tracking-tighter">
            {currentDj || "DJ Vacío"}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-zinc-300">
            {track ? (
              <>
                <Disc3
                  size={14}
                  className="shrink-0 animate-spin-slow text-pink-400"
                />
                <p className="truncate text-[11px] font-bold">
                  {track.title}
                </p>
              </>
            ) : (
              <p className="text-[10px] italic text-zinc-600">
                Sin canción asignada
              </p>
            )}
          </div>

          {track && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
        {inWaitlist ? (
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-pink-400 transition-all hover:bg-pink-500/20"
          >
            <UserMinus size={12} /> Salir
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-pink-600/20 transition-all hover:from-pink-500 hover:to-purple-500"
          >
            <UserPlus size={12} /> Subir a la cabina
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onOpenWheel}
            disabled={waitlist.length < 2}
            className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-amber-300 transition-all hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            title="Sorteo c�smico para elegir al pr�ximo DJ"
          >
            <Shuffle size={12} /> Sorteo
          </button>
        )}
      </div>

      <Bursts bursts={bursts} />

      {waitlist.length > 0 && (
        <div className="relative z-10 mt-4 border-t border-white/5 pt-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500">
              <ListMusic size={10} /> Cabina - lista de espera ({waitlist.length})
            </span>
            {reactionsTotal > 0 && (
              <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">
                {reactionsTotal} reaccion{reactionsTotal !== 1 ? "es" : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {waitlist.map((user, i) => {
              const mine = user === sessionUser;
              return (
                <div
                  key={user}
                  className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${
                    mine
                      ? "border-pink-500/40 bg-pink-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <span className="text-[8px] font-black text-zinc-600">#{i + 1}</span>
                  <Avatar config={avatars[user]} size={22} />
                  <span className="max-w-[80px] truncate text-[8px] font-black uppercase tracking-wider text-zinc-300">
                    {user}
                  </span>
                  {mine && (
                    <span className="text-[7px] font-black uppercase text-pink-400">tu</span>
                  )}
                  {isAdmin && i > 0 && (
                    <button
                      onClick={() => onEject(user)}
                      title="Sacar de la cola"
                      className="ml-0.5 rounded-full p-0.5 text-zinc-600 transition-colors hover:text-red-400"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isHostPlayer && (
        <p className="relative z-10 mt-3 flex items-center justify-center gap-1.5 text-center text-[7px] font-bold uppercase tracking-widest text-zinc-600">
          <Sliders size={10} />
          <span>Estas pinchando en directo, disfruta el set</span>
        </p>
      )}
    </div>
  );
}
