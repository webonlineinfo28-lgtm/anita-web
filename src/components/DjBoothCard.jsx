import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Disc3,
  ListMusic,
  Shuffle,
  UserMinus,
  UserPlus,
  X,
  Sliders,
} from "lucide-react";

import Avatar from "./Avatar.jsx";
import { AVATAR_PALETTES } from "../lib/avatars.js";

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

function Equalizer({ active }) {
  if (!active) return null;
  // Alturas deterministas: la animación vive en CSS (equalizer-bar),
  // así las barras no cambian de tamaño en cada re-render del padre.
  const HEIGHTS = [38, 62, 45, 70, 30];
  return (
    <div className="equalizer">
      {HEIGHTS.map((h, i) => (
        <div key={i} className="equalizer-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

// Formatea segundos a m:ss para la barra de progreso.
function fmt(s) {
  const t = Math.max(0, Math.floor(Number(s) || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

export default function DjBoothCard({
  currentDj,
  djAvatar,
  djTitle = "Novato Cósmico",
  track,
  progress = 0,
  played = 0,
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
  // Guard doble: paleta indefinida o acento desconocido nunca deben romper la cabina.
  const accent = AVATAR_PALETTES.accent?.[djAvatar?.accent] || "#ec4899";
  const isHostPlayer = isAdmin && currentDj === sessionUser;
  const hasDj = !!currentDj;
  // Progreso siempre acotado a [0,1] para que la barra no desborde.
  const safeProgress = Math.min(1, Math.max(0, Number(progress) || 0));

  return (
    <div className="glass-card relative overflow-hidden p-6 border border-pink-500/20">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(60% 90% at 50% 0%, ${accent}55, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="live-indicator">
          <div className="live-dot" />
          <span>En Directo</span>
        </div>
        <Equalizer active={hasDj} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          <motion.div
            animate={hasDj ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Avatar config={djAvatar} size={120} live={hasDj} />
          </motion.div>
          <span
            className="absolute -inset-2 rounded-full border-2 animate-pulse-glow"
            style={{ borderColor: `${accent}66` }}
          />
          {isAdmin && (
            <span className="absolute -right-2 -top-2 z-10 rounded-full border border-yellow-400/40 bg-yellow-500/20 p-1.5">
              <Crown size={14} className="text-yellow-400" />
            </span>
          )}
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black uppercase tracking-tight"
          style={{ textShadow: `0 0 20px ${accent}66`, color: accent }}
        >
          {currentDj || "DJ Vacío"}
        </motion.h2>

        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
          {djTitle}
        </p>

        {track ? (
          <div className="mt-4 w-full max-w-xs">
            <div className="flex items-center gap-2 justify-center text-zinc-300">
              <Disc3 size={16} className="animate-spin-slow" style={{ color: accent }} />
              <p className="text-sm font-semibold truncate">{track.title}</p>
            </div>
            <div className="mt-3 relative">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 0 10px ${accent}88`,
                  }}
                  animate={{ width: `${safeProgress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-mono text-zinc-500">
                <span>{fmt(played)}</span>
                <span>{fmt(track.duration)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2 text-zinc-500">
            <Disc3 size={24} className="opacity-30" />
            <p className="text-xs font-semibold">Sin canción asignada</p>
          </div>
        )}
      </div>

      <div className="divider-gradient mb-4" />

      <div className="relative z-10 flex flex-wrap gap-2 justify-center">
        {inWaitlist ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLeave?.()}
            className="btn btn-secondary"
          >
            <UserMinus size={14} /> Salir de la cola
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onJoin?.()}
            className="btn btn-primary"
          >
            <UserPlus size={14} /> Subir a la cabina
          </motion.button>
        )}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenWheel?.()}
            disabled={waitlist.length < 2}
            className="btn"
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              color: "#fbbf24",
            }}
          >
            <Shuffle size={14} /> Sorteo
          </motion.button>
        )}
      </div>

      {reactionsTotal > 0 && (
        <div className="relative z-10 mt-4 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-xs font-bold text-pink-400">{reactionsTotal}</span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              reaccion{reactionsTotal !== 1 ? "es" : ""}
            </span>
          </div>
        </div>
      )}

      {waitlist.length > 0 && (
        <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <ListMusic size={12} /> Cabina - lista de espera ({waitlist.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {waitlist.map((user, i) => {
              const mine = user === sessionUser;
              return (
                <motion.div
                  key={user}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                    mine
                      ? "border-pink-500/40 bg-pink-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <span className="text-xs font-black text-zinc-600">#{i + 1}</span>
                  <Avatar config={avatars[user]} size={24} />
                  <span className="max-w-[100px] truncate text-xs font-bold uppercase tracking-wider text-zinc-300">
                    {user}
                  </span>
                  {mine && (
                    <span className="text-[10px] font-black uppercase text-pink-400">tu</span>
                  )}
                  {isAdmin && i > 0 && (
                    <button
                      onClick={() => onEject?.(user)}
                      title="Sacar de la cola"
                      className="ml-1 rounded-full p-1 text-zinc-600 transition-colors hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {isHostPlayer && (
        <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-center">
          <Sliders size={12} className="text-zinc-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            Estás pinchando en directo, disfruta el set
          </span>
        </div>
      )}

      <Bursts bursts={bursts} />
    </div>
  );
}

