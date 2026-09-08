import { motion } from "framer-motion";
import { PartyPopper, Sparkles, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import Avatar from "./Avatar.jsx";
import { COLORS, colorWithAlpha } from "../lib/colors.js";

// Fanfarria corta con WebAudio (sin ficheros de audio).
function playFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    setTimeout(() => ctx.close(), 1600);
  } catch {
    /* silencio si el navegador lo bloquea */
  }
}

function launchConfetti() {
  // canvas-confetti es dependencia del proyecto; carga diferida para no bloquear.
  import("canvas-confetti")
    .then((mod) => {
      const confetti = mod.default;
      const opts = { spread: 100, ticks: 220, gravity: 0.9, zIndex: 100 };
      confetti({ ...opts, particleCount: 90, origin: { x: 0.2, y: 0.6 }, colors: [COLORS.pink, COLORS.purple, COLORS.amber] });
      confetti({ ...opts, particleCount: 90, origin: { x: 0.8, y: 0.6 }, colors: [COLORS.cyan, COLORS.purple, COLORS.amber] });
      setTimeout(() => confetti({ ...opts, particleCount: 130, origin: { x: 0.5, y: 0.4 } }), 250);
    })
    .catch(() => {});
}

export default function LevelUpOverlay({ level, title, avatar, user, onClose }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    playFanfare();
    launchConfetti();
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-xl"
    >
      {/* Halos de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${colorWithAlpha(COLORS.amber, 0.25)}, transparent 65%)` }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-yellow-500/30"
        />
      </div>

      <motion.div
        initial={{ scale: 0.5, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-heavy relative z-10 flex w-[min(92vw,440px)] flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-500/15 px-4 py-1.5"
        >
          <Sparkles size={14} className="text-yellow-400" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
            ¡Nivel alcanzado!
          </span>
          <Sparkles size={14} className="text-yellow-400" />
        </motion.div>

        <div className="relative">
          <Avatar config={avatar} size={128} live />
          <div className="absolute -inset-3 animate-pulse-glow rounded-full border-2 border-yellow-400/50" />
          <motion.div
            animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
            className="absolute -right-4 -top-3"
          >
            <Star size={30} className="text-yellow-400" fill="currentColor" />
          </motion.div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">{user}</p>

        <div>
          <p className="text-6xl font-black text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.amber}, #f59e0b, ${COLORS.pink})`, WebkitBackgroundClip: "text", backgroundClip: "text" }}>
            Nv. {level}
          </p>
          <p className="mt-1 text-xl font-black uppercase tracking-wide text-white">{title}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
          className="btn btn-primary btn-lg mt-2"
        >
                    ¡Seguir la fiesta! <PartyPopper size={16} className="ml-1.5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
