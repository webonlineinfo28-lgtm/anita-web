import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpCircle,
  Disc3,
  History,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Plus,
  SkipForward,
  Trash2,
  User,
} from "lucide-react";

const ReactPlayer = lazy(() => import("react-player"));

// Tarjeta de una canción en la cola/historial.
function TrackCard({
  track,
  isCurrent,
  showHistory,
  isAdmin,
  onSelect,
  onRemove,
  onMoveUp,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => !showHistory && onSelect(track)}
      className={`group relative min-w-[280px] overflow-hidden rounded-2xl border p-5 transition-all ${
        isCurrent
          ? "border-pink-500 bg-pink-600/10 shadow-lg"
          : showHistory
            ? "border-white/5 bg-zinc-900/20 opacity-50 grayscale"
            : "cursor-pointer border-white/5 bg-black/40 hover:border-white/20"
      }`}
    >
      {isAdmin && !showHistory && !isCurrent && (
        <div className="absolute right-3 top-3 z-30 flex gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(track);
            }}
            title="Mover arriba"
            className="rounded-lg border border-white/10 bg-zinc-900/60 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-pink-500/40 hover:bg-pink-600/80"
          >
            <ArrowUpCircle size={11} className="text-zinc-400 group-hover:text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(track.id);
            }}
            title="Eliminar"
            className="rounded-lg border border-white/10 bg-zinc-900/60 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-red-500/40 hover:bg-red-600/80"
          >
            <Trash2 size={11} className="text-zinc-400 group-hover:text-white" />
          </button>
        </div>
      )}

      <p
        className={`truncate text-[10px] font-bold uppercase ${
          isCurrent ? "text-pink-500" : "text-zinc-400"
        }`}
      >
        {track.title}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <User size={10} className="text-pink-500/50" />
        <p className="text-[8px] font-black uppercase italic tracking-widest opacity-30">
          Por {track.addedBy}
        </p>
      </div>

      {isCurrent && (
        <>
          <div className="absolute bottom-2 right-4">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-pink-500" />
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-pink-400">
            <Disc3 size={10} className="animate-spin-slow" /> sonando
          </div>
        </>
      )}
    </motion.div>
  );
}

// Panel principal de música: añadir canciones, reproducir y gestionar cola.
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
    showHistory,
    setShowHistory,
    onAddSong,
    onPlayNext,
    onRemoveSong,
    onMoveUp,
    onSelectTrack,
    onTogglePlay,
    onProgress,
  } = props;

  const displayList = showHistory ? history : playlist;

  return (
    <section className="flex flex-col gap-6">
      <div className="glass-card p-8">
        {/* Añadir canción */}
        <div className="mb-8 flex gap-4">
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && inputUrl.trim() && onAddSong(inputUrl)
            }
            placeholder="Pega link de YouTube..."
            className="glass-input flex-1 rounded-2xl px-6 py-5 text-[11px] font-bold text-white placeholder:text-zinc-600 focus:!border-pink-500"
          />
          <button
            disabled={isLoading || !inputUrl.trim()}
            onClick={() => onAddSong(inputUrl)}
            className={`flex w-16 items-center justify-center rounded-2xl transition-all transform ${
              isLoading || !inputUrl.trim()
                ? "cursor-not-allowed opacity-50"
                : "bg-pink-600 hover:bg-pink-500 hover:scale-105 active:scale-95"
            }`}
            title="Añadir a la cola"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Plus size={24} />
            )}
          </button>
        </div>

        {/* Reproductor */}
        <div className="group relative mb-10 overflow-hidden rounded-[2rem] border border-white/5 bg-black shadow-2xl">
          <div className="aspect-video">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center text-zinc-600">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              }
            >
              {currentTrack ? (
                <ReactPlayer
                  url={currentTrack.url}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  controls={true}
                  onPlay={() => onTogglePlay(true)}
                  onPause={() => onTogglePlay(false)}
                  onProgress={({ played }) => onProgress?.(played || 0)}
                  onEnded={onPlayNext}
                  onError={() => onPlayNext()}
                  config={{
                    youtube: {
                      playerVars: {
                        autoplay: 1,
                        controls: 1,
                        rel: 0,
                        showinfo: 0,
                        modestbranding: 1,
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900/40 to-black">
                  <Disc3 size={40} className="text-zinc-700" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">
                    Sin canción en el aire
                  </p>
                </div>
              )}
            </Suspense>
          </div>

          {currentTrack && (
            <>
              <button
                onClick={onPlayNext}
                title="Saltar a la siguiente"
                className="absolute bottom-6 right-24 z-20 rounded-full border border-white/10 bg-white/10 p-4 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-pink-600 group-hover:opacity-100"
              >
                <SkipForward size={20} />
              </button>
              <button
                onClick={() => onTogglePlay()}
                title={isPlaying ? "Pausar" : "Reproducir"}
                className="absolute bottom-6 right-6 z-20 rounded-full border border-white/10 bg-white/10 p-4 opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-pink-600 group-hover:opacity-100"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </>
          )}
        </div>

        {/* Cabecera de lista */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Disc3
              size={14}
              className={`text-pink-500 ${!showHistory ? "animate-spin-slow" : ""}`}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {showHistory ? "Historial pasado" : "Gestión de playlist"}
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all hover:bg-white/10"
          >
            {showHistory ? <ListMusic size={12} /> : <History size={12} />}
            {showHistory ? "Ver cola" : "Ver historial"}
          </button>
        </div>

        {/* Cola de canciones */}
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 scroll-smooth">
          <AnimatePresence mode="popLayout">
            {displayList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-8 text-center text-[9px] font-black uppercase italic text-zinc-800"
              >
                {showHistory
                  ? "Aún no hay historial"
                  : "Lista vacía: ¡añade tu primera canción!"}
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
                  onMoveUp={onMoveUp}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}