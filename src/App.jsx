import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpCircle,
  Bot,
  Crown,
  Disc3,
  History,
  Laptop,
  ListMusic,
  Loader2,
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
  Plus,
  Radio,
  RotateCcw,
  SkipForward,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Tv,
  User,
  X,
} from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useBingo } from "./hooks/useBingo.js";
import { useRoom } from "./lib/useRoom.js";
import { renderAvatar, randomAvatar } from "./lib/avatars.js";
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
import "./App.css";

const ReactPlayer = lazy(() => import("react-player"));

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("anita_session")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = useCallback(({ name, isHost }) => {
    const newSession = { user: name, role: isHost ? 'admin' : 'player', loginTime: new Date().toISOString() };
    setSession(newSession);
    try {
      localStorage.setItem("anita_session", JSON.stringify(newSession));
    } catch (e) {
      console.error("Error saving session:", e);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("anita_session");
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

  
  const addSong = useCallback(async () => {
    if (!inputUrl.trim()) return;
    setAddError("");
    try {
      await room.addSong(inputUrl.trim());
      setInputUrl("");
    } catch (e) {
      setAddError(e.message || "Error al agregar canción");
    }
  }, [inputUrl, room]);

  const isHostPlayer = isAdmin;
  const inWaitlist = room.waitlist.includes(user);
  const myStats = room.statsMap[user] || null;
  const avatarKey = room.avatars[user] || {};

  return (
    <>
      <CosmicBackground />
      <div className="relative z-10 min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden">
        {addError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 text-red-400 animate-bounce">
              <AlertCircle size={18} />
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

                <main className="max-w-[1600px] mx-auto px-4 pb-8">
          {/* DJ BOOTH - EL SOL CENTRAL */}
          <section className="mb-4">
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
            {isHostPlayer && room.currentTrack && (
              <div className="flex gap-4 justify-center mt-6">
                <button onClick={room.togglePlay} className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_100%] text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-pink-500/40 transition-all hover:shadow-pink-500/60 hover:scale-105 animate-[shimmer_2s_ease-in-out_infinite]">
                  {room.isPlaying ? <Pause size={18} className="inline mr-2" /> : <Play size={18} className="inline mr-2" />}
                  {room.isPlaying ? "Pausar" : "Reproducir"}
                </button>
                <button onClick={room.playNext} className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-black text-sm uppercase tracking-widest backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105">
                  <SkipForward size={18} className="inline mr-2" /> Saltar
                </button>
              </div>
            )}
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <BingoPanel bingo={bingo} avatars={room.avatars} isAdmin={isAdmin} />
            </div>
            <div className="flex flex-col" style={{ maxHeight: "420px" }}>
              <ChatPanel messages={room.messages} avatars={room.avatars} onSend={room.sendMessage} onReact={room.react} trackReactions={room.trackReactions} />
            </div>
          </section>
          <section className="mb-4">
            <PlayerPanel playlist={room.playlist} history={room.history} currentTrack={room.currentTrack} isPlaying={room.isPlaying} isAdmin={isAdmin} inputUrl={inputUrl} setInputUrl={setInputUrl} onAddSong={addSong} isLoading={false} error={addError} onPlayNext={room.playNext} onTogglePlay={room.togglePlay} onSelectTrack={room.setCurrentTrack} onRemoveSong={(id) => room.removeSong(id)} user={user} played={room.played} playedSeconds={room.playedSeconds} onProgress={room.onProgress} onSeek={room.onSeek} onDuration={room.onDuration} />
          </section>
          <section className="mb-4">
            <RankingPanel permanentCounts={permanentCounts} winners={bingoWinners} avatars={room.avatars} />
          </section>
        </main>
        <style>{`@keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
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
    </>
  );
}

export default App;

