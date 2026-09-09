import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, History, User, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBingo } from "./hooks/useBingo.js";
import { useRoom } from "./lib/useRoom.js";
import { renderAvatar, randomAvatar, AVATAR_PALETTES } from "./lib/avatars.js";
import CosmicBackground from "./components/CosmicBackground.jsx";
import Header from "./components/Header.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import PlayerPanel from "./components/PlayerPanel.jsx";
import BingoPanel from "./components/BingoPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import DjBoothCard from "./components/DjBoothCard.jsx";
import DjWheel from "./components/DjWheel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import AvatarEditor from "./components/AvatarEditor.jsx";
import RankingPanel from "./components/RankingPanel.jsx";
import NowPlaying from "./components/NowPlaying.jsx";
import LevelUpOverlay from "./components/LevelUpOverlay.jsx";
import ToastContainer, { makeToast } from "./components/Toast.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { levelProgress } from "./lib/stats.js";
import { STORAGE_KEYS } from "./lib/constants.js";
import "./App.css";

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = useCallback(({ name, isHost }) => {
    const newSession = { user: name, role: isHost ? 'admin' : 'player', loginTime: new Date().toISOString() };
    setSession(newSession);
    try {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(newSession));
    } catch (e) {
      console.error("Error saving session:", e);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, []);

  if (!session) {
    return (
      <>
        <CosmicBackground />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <AppAuthenticated session={session} onLogout={handleLogout} />
  );
}


function AppAuthenticated({ session, onLogout }) {
  const isAdmin = session?.role === "admin";
  const user = session?.user ?? "Anónimo";

  const room = useRoom(session);
  const bingo = useBingo();
  useEffect(() => {
    bingo.setHostRole(isAdmin);
  }, [bingo.setHostRole, isAdmin]);

  const permanentCounts = bingo.permanentCounts;
  const bingoWinners = bingo.winners;

  // Conectar la fama del bingo con la del perfil social.
  const localWinCheck = useMemo(
    () => bingo.checkWin(bingo.card, bingo.drawnNumbers),
    [bingo.card, bingo.drawnNumbers],
  );
  const localWinRef = useMemo(() => ({ bingo: false, line: false }), []);
  useEffect(() => {
    if (localWinCheck.bingo && !localWinRef.bingo) {
      localWinRef.bingo = true;
      localWinRef.line = false;
      room.awardXp("bingo");
    } else if (
      localWinCheck.hasLine &&
      !localWinCheck.bingo &&
      !localWinRef.line &&
      !localWinRef.bingo
    ) {
      localWinRef.line = true;
      room.awardXp("line");
    }
  }, [localWinCheck, room, localWinRef]);

  const [showProfile, setShowProfile] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [showDjWheel, setShowDjWheel] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [roomMode, setRoomMode] = useState("normal"); // "normal" | "projector"

  // ─── Sistema de notificaciones Toast ───
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((type, message) => {
    const t = makeToast(type, message);
    setToasts((prev) => [...prev.slice(-2), t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3500);
  }, []);
  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  
  const addSong = useCallback(async () => {
    if (!inputUrl.trim()) return;
    setAddError("");
    try {
      await room.addSong(inputUrl.trim());
      setInputUrl("");
      pushToast("success", "Canción añadida a la cola");
    } catch (e) {
      const msg = e.message || "Error al agregar canción";
      setAddError(msg);
      pushToast("warning", msg);
    }
  }, [inputUrl, room, pushToast]);

  const isHostPlayer = isAdmin;
  const inWaitlist = room.waitlist.includes(user);
  const myStats = room.statsMap[user] || null;
  const avatarKey = room.avatars[user] || {};

  // ─── Detección de subida de nivel (overlay épico) ───
  const myLevel = levelProgress(myStats?.xp || 0);
  const prevLevelRef = useRef(myLevel.level);
  const [levelUp, setLevelUp] = useState(null);
  useEffect(() => {
    if (myLevel.level > prevLevelRef.current) {
      setLevelUp({ level: myLevel.level, title: myLevel.title });
    }
    prevLevelRef.current = myLevel.level;
  }, [myLevel.level, myLevel.title]);

  // Color de acento del DJ actual (para la barra Now Playing).
  const djAccent = AVATAR_PALETTES.accent?.[room.avatars[room.dj]?.accent] || "#ec4899";

  return (
    <>
      <CosmicBackground accent={djAccent} />
      <div className="relative z-10 min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden flex flex-col gap-4 pb-32">
        {addError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 text-red-400 animate-bounce">
              <X size={18} />
              <span className="text-sm font-bold">{addError}</span>
              <button onClick={() => setAddError(null)} className="ml-2 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <Header
          session={session}
          user={user}
          avatar={avatarKey}
          isHostPlayer={isHostPlayer}
          onLogout={onLogout}
          roomMode={roomMode}
          setRoomMode={setRoomMode}
          onEditAvatar={() => setShowAvatarEditor(true)}
          onProfile={() => setShowProfile(true)}
        />

                <main className="mx-auto w-full flex flex-col gap-4">
          {/* ═══ DJ BOOTH — EL SOL CENTRAL DEL FESTIVAL ═══ */}
          <section className="mb-5">
            <div className="mx-auto w-full max-w-5xl">
              <ErrorBoundary label="La cabina DJ">
                <DjBoothCard
                  currentDj={room.dj}
                  djAvatar={room.avatars[room.dj] || {}}
                  djTitle=""
                  track={room.currentTrack}
                  played={room.played}
                  isPlaying={room.isPlaying}
                  isAdmin={isAdmin}
                  sessionUser={user}
                  waitlist={room.waitlist}
                  avatars={room.avatars}
                  inWaitlist={inWaitlist}
                  onJoin={room.joinCabina}
                  onLeave={room.leaveCabina}
                  onEject={room.ejectFromCabina}
                  onOpenWheel={() => setShowDjWheel(true)}
                  reactionsTotal={room.reactionsTotal}
                  bursts={room.bursts}
                />
              </ErrorBoundary>
            </div>
          </section>

          {/* ═══ GRID SOCIAL: Bingo | Chat | Ranking ═══ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4 min-h-0 flex-1">
            <ErrorBoundary label="El bingo">
              <ErrorBoundary label="Bingo">
              <BingoPanel bingo={bingo} avatars={room.avatars} isAdmin={isAdmin} />
            </ErrorBoundary>
            </ErrorBoundary>
            <div className="flex-1 min-h-0 flex flex-col order-first xl:order-none lg:col-span-2 xl:col-span-1" style={{ minHeight: "420px" }}>
              <ErrorBoundary label="El chat">
                <ErrorBoundary label="Chat">
                <ChatPanel messages={room.messages} avatars={room.avatars} onSend={room.sendMessage} onReact={room.react} trackReactions={room.trackReactions} />
              </ErrorBoundary>
              </ErrorBoundary>
            </div>
            <ErrorBoundary label="El ranking">
              <ErrorBoundary label="Ranking">
              <RankingPanel permanentCounts={permanentCounts} winners={bingoWinners} avatars={room.avatars} />
            </ErrorBoundary>
            </ErrorBoundary>
          </section>

          {/* ═══ PLAYER / COLA DE CANCIONES ═══ */}
          <section className="mb-4">
            <ErrorBoundary label="El reproductor">
              <PlayerPanel playlist={room.playlist} history={room.history} currentTrack={room.currentTrack} isPlaying={room.isPlaying} isAdmin={isAdmin} inputUrl={inputUrl} setInputUrl={setInputUrl} onAddSong={addSong} isLoading={false} error={addError} onPlayNext={room.playNext} onTogglePlay={room.togglePlay} onSelectTrack={room.setCurrentTrack} onRemoveSong={(id) => room.removeSong(id)} played={room.played} onProgress={room.onProgress} onSeek={room.onSeek} onDuration={room.onDuration} />
            </ErrorBoundary>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {showProfile && (
          <ProfilePanel
            user={user}
            isAdmin={isAdmin}
            avatar={avatarKey}
            stats={myStats}
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAvatarEditor && (
          <AvatarEditor
            config={avatarKey}
            onSave={(cfg) => {
              room.saveAvatar(cfg);
              setShowAvatarEditor(false);
            }}
            onClose={() => setShowAvatarEditor(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDjWheel && (
          <DjWheel
            users={room.waitlist}
            avatars={room.avatars}
            onPick={(winner) => {
              room.setDj(winner);
              setShowDjWheel(false);
            }}
            onClose={() => setShowDjWheel(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ NOTIFICACIONES TOAST ═══ */}
      <ToastContainer toasts={toasts} onClose={closeToast} />

      {/* ═══ OVERLAY DE SUBIDA DE NIVEL ═══ */}
      <AnimatePresence>
        {levelUp && (
          <LevelUpOverlay
            level={levelUp.level}
            title={levelUp.title}
            avatar={avatarKey}
            user={user}
            onClose={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>

      {/* ═══ BARRA NOW PLAYING (footer fijo) ═══ */}
      {/* ═══ BOTÓN VOLVER ARRIBA (aparece al hacer scroll) ═══ */}
      <ScrollTopButton />
      <NowPlaying
        track={room.currentTrack}
        dj={room.dj}
        djAvatar={room.avatars[room.dj] || {}}
        accent={djAccent}
        isPlaying={room.isPlaying}
        played={room.played}
        playedSeconds={room.playedSeconds}
        canControl={isHostPlayer}
        onTogglePlay={room.togglePlay}
        onSkip={room.playNext}
        onReact={room.react}
      />
    </>
  );
}


// Botón "volver arriba" — solo visible al hacer scroll (patrón estándar, no interfiere)
function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = false;
    const onScroll = () => {
      if (!raf) {
        raf = true;
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 600);
          raf = false;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-6 bottom-24 z-40 btn btn-sm btn-ghost btn-icon text-zinc-400 hover:text-white hover:bg-white/10 shadow-xl shadow-black/30 rounded-full"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ArrowUp size={18} />
    </motion.button>
  );
}

export default App;

