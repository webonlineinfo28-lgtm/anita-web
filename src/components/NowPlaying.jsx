import { AnimatePresence, motion } from "framer-motion";
import { Disc3, Heart, Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";
import { COLORS } from "../lib/colors.js";

// Convierte una URL en un título legible sin depender de APIs externas.
function prettyTitle(url) {
  if (!url) return "Sin título";
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (host.includes("youtu")) return "YouTube";
    if (host.includes("soundcloud")) return "SoundCloud";
    if (last) {
      const clean = decodeURIComponent(last)
        .replace(/\.[a-z0-9]{2,4}$/i, "")
        .replace(/[-_+]/g, " ");
      if (clean.length > 3) return clean.slice(0, 48);
    }
    return host;
  } catch {
    return url.slice(0, 48);
  }
}

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function NowPlaying({
  track,
  dj,
  djAvatar,
  accent = COLORS.pink,
  isPlaying,
  played = 0, // fracción 0..1
  playedSeconds = 0,
  canControl = false,
  onTogglePlay,
  onSkip,
  onReact,
}) {
  const [liked, setLiked] = useState(false);
  const visible = !!track;

  // Reinicia el "like" al cambiar de canción.
  useEffect(() => {
    setLiked(false);
  }, [track?.id]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          <div className="mx-auto max-w-[1600px] px-3 pb-3" style={{ pointerEvents: "none" }}>
            <div
              className="glass-card-heavy flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                pointerEvents: "auto",
                boxShadow: `0 -8px 40px ${accent}22, 0 8px 32px rgba(0,0,0,.6)`,
              }}
            >
              {/* Disco girando */}
              <motion.div
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40"
              >
                <Disc3 size={20} style={{ color: accent }} />
              </motion.div>

              {/* DJ mini avatar */}
              <div className="hidden shrink-0 sm:block">
                <Avatar config={djAvatar} size={38} live={isPlaying} />
              </div>

              {/* Info canción */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    {isPlaying ? "Sonando" : "En pausa"}
                  </span>
                  {dj && (
                    <span className="hidden text-[10px] font-bold uppercase tracking-wider text-zinc-500 md:inline">
                      · DJ {dj}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm font-bold text-white">
                  {prettyTitle(track?.title || track?.url)}
                </p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-linear"
                    style={{
                      width: `${Math.min(100, Math.max(0, played * 100))}%`,
                      background: `linear-gradient(90deg, ${accent}, ${COLORS.purple})`,
                      boxShadow: `0 0 8px ${accent}88`,
                    }}
                  />
                </div>
              </div>

              {/* Tiempo transcurrido */}
              <span className="hidden shrink-0 text-xs font-bold tabular-nums text-zinc-500 sm:block">
                {formatTime(playedSeconds)}
              </span>

              {/* Controles */}
              <div className="flex shrink-0 items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setLiked(true);
                    onReact?.("❤️");
                  }}
                  title="Reaccionar"
                  className={`rounded-full p-2.5 transition-colors ${
                    liked
                      ? "bg-pink-500/20 text-pink-400"
                      : "text-zinc-500 hover:bg-white/5 hover:text-pink-400"
                  }`}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                </motion.button>

                {canControl && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={onTogglePlay}
                      title={isPlaying ? "Pausar" : "Reproducir"}
                      className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-3 text-white shadow-lg shadow-pink-500/30 transition-transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={onSkip}
                      title="Siguiente canción"
                      className="rounded-full bg-white/5 p-3 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <SkipForward size={16} fill="currentColor" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
