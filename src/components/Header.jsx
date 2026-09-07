import { motion } from "framer-motion";
import {
  Laptop,
  LogOut,
  Palette,
  Tv,
  User,
  BookOpen,
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import RulesPanel from "./RulesPanel.jsx";
import { useState } from "react";

export default function Header({
  session,
  user,
  avatar,
  isHostPlayer,
  onLogout,
  roomMode,
  setRoomMode,
  onEditAvatar,
  onProfile,
}) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] mx-auto flex justify-between items-center mb-8 p-4 rounded-2xl glass-card"
      >
        <div className="flex items-center gap-4 pl-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <img src="/favicon.svg" alt="Anita Festival" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">
              Anita <span className="text-gradient-cosmic">Festival</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              sala social cósmica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2 flex-wrap justify-end">
          <button
            onClick={() => setShowRules(true)}
            title="Reglas del Festival"
            className="btn btn-ghost btn-icon"
          >
            <BookOpen size={16} />
          </button>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1">
            <button
              onClick={() => setRoomMode("normal")}
              title="Modo sala normal"
              className={`rounded-full p-2 text-xs transition-all ${
                roomMode === "normal"
                  ? "bg-pink-600/20 text-pink-400 shadow-pink-500/20 shadow-lg"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Laptop size={14} />
            </button>
            <button
              onClick={() => setRoomMode("projector")}
              title="Modo proyector / TV"
              className={`rounded-full p-2 text-xs transition-all ${
                roomMode === "projector"
                  ? "bg-purple-600/20 text-purple-400 shadow-purple-500/20 shadow-lg"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Tv size={14} />
            </button>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <button
              onClick={onProfile}
              className="relative flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/30 px-3 py-2 backdrop-blur transition-all hover:border-pink-500/30"
            >
              <Avatar config={avatar} size={36} live={isHostPlayer} />
              <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-zinc-300">
                {user}
              </span>
              {session?.role === "admin" && (
                <span className="absolute -top-1 -right-1 rounded-full border border-yellow-400/30 bg-yellow-500/20 p-1">
                  <User size={10} className="text-yellow-400" />
                </span>
              )}
            </button>
          </motion.div>

          <button
            onClick={onEditAvatar}
            title="Editar avatar"
            className="btn btn-ghost btn-icon"
          >
            <Palette size={16} />
          </button>

          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="btn btn-ghost btn-icon hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={16} />
          </button>
        </div>
      </motion.header>

      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}
    </>
  );
}

