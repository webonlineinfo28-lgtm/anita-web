import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Disc3,
  History,
  ListMusic,
  Loader2,
  Music2,
  Pause,
  Play,
  Plus,
  SkipForward,
  Trash2,
} from "lucide-react";

const ReactPlayer = lazy(() => import("react-player"));

// Genera un tono estable por URL para el "thumbnail" de color de la tarjeta.
function trackHue(url = "") {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) % 360;
  return h;
}

function TrackCard({ track, isCurrent, showHistory, isAdmin, onSelect, onRemove }) {
  const hue = trackHue(track.url);
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 22%) 0%, hsl(${(hue + 40) % 360} 70% 14%) 100%)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => !showHistory && onSelect?.(track)}
      className={`group relative w-44 shrink-0 overflow-hidden rounded-2xl border transition-all ${
        isCurrent
          ? "border-pink-500/60 shadow-lg shadow-pink-500/20"
          : "border-white/10 hover:border-white/25"
      } ${showHistory ? "cursor-default" : "cursor-pointer"}`}
      style={{ background: bg }}
    >
      <Music2 size={64} className="absolute -right-3 -top-3 text-white/5" aria-hidden="true" />

      <div className="flex h-20 flex-col justify-end p-3">
        {isCurrent && (
          <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full bg-pink-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
            <span className="h-1 w-1 animate-ping rounded-full bg-white" /> Sonando
          </span>
        )}
        <p className="truncate text-xs font-bold text-white drop-shadow">
          {track.title || "Canción"}
        </p>
      </div>

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(track.id);
          }}
          title="Quitar de la cola"
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-600 hover:text-white group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      )}
    </motion.div>
  );
}

export default function PlayerPanel(props) {
  const {
    playlist,
    history,
    currentTrack,
    isPlaying,
    isAdmin,
    isLoading,
    inputUrl,
    setInputUrl,
    onAddSong,
    onPlayNext,
    onTogglePlay,
    onSelectTrack,
    onRemoveSong,
    played = 0,
    onProgress,
    onSeek,
    onDuration,
    error,
  } = props;

  // Estado interno: el historial es una vista de este panel, no de la sala.
  const [showHistory, setShowHistory] = useState(false);
  const displayList = showHistory ? history : playlist;
  const hue = trackHue(currentTrack?.url);

  return (
    <section className="glass-card p-5">
      {/* ═══ Input + error ═══ */}
      <div className="mb-5">
        <div className="flex gap-3">
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddSong()}
            placeholder="Pega un link de YouTube o SoundCloud..."
            className="glass-input flex-1 px-4 py-3 text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddSong}
            disabled={!inputUrl.trim() || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span className="hidden sm:inline">Añadir</span>
          </motion.button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400"
            >
              <AlertTriangle size={13} /> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Dock: mini-video + info + controles en una sola fila ═══ */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/40 p-3 sm:flex-row sm:items-center">
        {/* Mini video (necesita estar montado para que suene la música) */}
        <div className="relative mx-auto aspect-video w-full max-w-[240px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black sm:mx-0">
          {currentTrack ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              }
            >
              <ReactPlayer
                url={currentTrack.url}
                playing={isPlaying}
                width="100%"
                height="100%"
                onProgress={onProgress}
                onSeek={onSeek}
                onDuration={onDuration}
                onEnded={onPlayNext}
              />
            </Suspense>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-700">
              <Disc3 size={28} />
              <p className="text-[9px] font-black uppercase tracking-widest">Sin señal</p>
            </div>
          )}
        </div>
        {/* Info + progreso + controles */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10"
              style={{ background: `hsl(${hue} 60% 18%)` }}
            >
              <Disc3 size={16} style={{ color: `hsl(${hue} 80% 65%)` }} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {currentTrack?.title || "Nada suena todavía"}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                {currentTrack
                  ? isPlaying
                    ? "En el aire"
                    : "En pausa"
                  : "Añade una canción para empezar"}
              </p>
            </div>

            {currentTrack && isAdmin && (
              <div className="flex shrink-0 gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onTogglePlay}
                  title={isPlaying ? "Pausar" : "Reproducir"}
                  className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-2.5 text-white shadow-lg shadow-pink-500/25 transition-transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onPlayNext}
                  title="Siguiente"
                  className="rounded-full bg-white/5 p-2.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipForward size={14} fill="currentColor" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Barra de progreso con seek (click + teclado) */}
          {currentTrack && (
            <div
              role="slider"
              aria-label="Progreso de la canción"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(played * 100)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (!onSeek || !onDuration) return;
                if (e.key === "ArrowRight") onSeek(Math.min(1, played + 0.05));
                if (e.key === "ArrowLeft") onSeek(Math.max(0, played - 0.05));
              }}
              className="relative mt-3 h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={(e) => {
                if (!onSeek) return;
                const rect = e.currentTarget.getBoundingClientRect();
                onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400"
                style={{
                  width: `${Math.min(100, Math.max(0, played * 100))}%`,
                  boxShadow: "0 0 8px rgba(236,72,153,0.5)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ Header de la lista ═══ */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3 size={14} className={`text-pink-500 ${!showHistory ? "animate-spin-slow" : "opacity-50"}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            {showHistory ? "Historial" : "La Cola"} · {displayList.length}
          </span>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-sm">
          {showHistory ? <ListMusic size={12} /> : <History size={12} />}
          {showHistory ? "Ver cola" : "Ver historial"}
        </button>
      </div>

      {/* ═══ Track cards en carrusel horizontal ═══ */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {displayList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-6 text-center text-[10px] font-black uppercase italic tracking-widest text-zinc-700"
            >
              {showHistory ? "Aún no hay historial" : "Cola vacía: ¡añade la primera canción!"}
            </motion.div>
          ) : (
            displayList.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrent={currentTrack?.id === track.id && !showHistory}
                showHistory={showHistory}
                isAdmin={isAdmin}
                onSelect={onSelectTrack}
                onRemove={onRemoveSong}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
