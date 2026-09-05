import { useState } from "react";
import { motion } from "framer-motion";
import { Dices, X } from "lucide-react";

import Avatar from "./Avatar.jsx";

// Ruleta cósmica: elige al azar quién sube a la cabina.
export default function DjWheel({ users, avatars, onPick, onClose }) {
  const [deg, setDeg] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const n = users.length;
  const radius = 96;

  const angle = (i) => (360 / n) * i - 90;

  const spin = () => {
    if (spinning || n < 2) return;
    setSpinning(true);
    setWinnerIdx(null);
    const idx = Math.floor(Math.random() * n);
    const target = 5 * 360 + ((270 - angle(idx)) % 360);
    setDeg(target);
    window.setTimeout(() => {
      setWinnerIdx(idx);
      setSpinning(false);
      window.setTimeout(() => onPick(users[idx]), 900);
    }, 3400);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900/90 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-start justify-between">
          <h2 className="text-lg font-black uppercase tracking-tighter">
            Sorteo <span className="text-amber-400">cósmico</span> 🎡
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-[10px] text-zinc-500">
          La rueda decidirá quién sube a la cabina.
        </p>

        <div className="relative mx-auto mb-4 h-60 w-60">
          {/* Cono que señala al ganador */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 text-2xl">
            🔻
          </div>

          <motion.div
            className="absolute inset-0"
            animate={{ rotate: deg }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
          >
            {users.map((user, i) => (
              <div
                key={user}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${angle(i)}deg) translateY(-${radius}px)` }}
              >
                <div style={{ transform: `rotate(${-angle(i)}deg)` }}>
                  <Avatar
                    config={avatars[user]}
                    size={44}
                    live={winnerIdx === i}
                  />
                </div>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-800" />
          </motion.div>
        </div>

        {winnerIdx !== null && (
          <p className="mb-3 text-lg font-black uppercase tracking-tighter">
            🎉 <span style={{ color: "#fbbf24" }}>{users[winnerIdx]}</span> sube a la cabina
          </p>
        )}

        <button
          onClick={spin}
          disabled={spinning || n < 2}
          className="rounded-full bg-gradient-to-r from-amber-500 to-pink-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="flex items-center gap-2">
            <Dices size={14} /> {spinning ? "Girando…" : "Girar la rueda"}
          </span>
        </button>
      </div>
    </div>
  );
}