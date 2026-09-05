import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Heart, Star, Zap, PartyPopper, Sparkles } from "lucide-react";

const REACTIONS = [
  { emoji: "Heart", icon: Heart, color: "#ec4899", glow: "rgba(236,72,153,0.4)" },
  { emoji: "Star", icon: Star, color: "#fbbf24", glow: "rgba(251,191,36,0.4)" },
  { emoji: "Zap", icon: Zap, color: "#a855f7", glow: "rgba(168,85,247,0.4)" },
  { emoji: "Party", icon: PartyPopper, color: "#22d3ee", glow: "rgba(34,211,238,0.4)" },
  { emoji: "Sparkles", icon: Sparkles, color: "#34d399", glow: "rgba(52,211,153,0.4)" },
];

export default function ChatPanel({ messages, onSend, onReact, disabled }) {
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState({});
  const [showReactions, setShowReactions] = useState(false);
  const [localReactions, setLocalReactions] = useState({});
  const listRef = useRef(null);
  const lastSongId = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, localReactions]);

  useEffect(() => {
    setLocalReactions({});
    lastSongId.current = null;
  }, [messages.find((m) => m.type === "song_change")]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleReaction = (idx) => {
    const songIdx = messages.findLastIndex((m) => m.type === "song_change");
    const key = `${songIdx}-${idx}`;
    if (!localReactions[key]) {
      const updated = { ...localReactions, [key]: true };
      setLocalReactions(updated);
      onReact(REACTIONS[idx].emoji);
      setShowReactions(false);
    }
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.06]"
      style={{
        height: "100%",
        background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(8,8,12,0.98) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(8,8,12,1) 0%, transparent 100%)", zIndex: 2 }}
      />

      <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.15) 100%)",
            border: "1px solid rgba(236,72,153,0.2)",
            boxShadow: "0 0 20px rgba(236,72,153,0.15)",
          }}
        >
          <MessageSquare size={18} style={{ color: "#ec4899" }} />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Chat</h3>
          <p className="text-[8px] font-semibold text-zinc-500">Sala en vivo</p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "#34d399",
                boxShadow: "0 0 6px #34d399",
                animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
            <span className="text-[7px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="relative flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((msg, i) => {
          if (msg.type === "system") {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 py-1"
              >
                <div className="h-px flex-1 opacity-20" style={{ background: "linear-gradient(to right, transparent, #ec4899)" }} />
                <p className="text-[8px] font-bold uppercase tracking-widest text-pink-400/70 whitespace-nowrap">
                  {msg.text}
                </p>
                <div className="h-px flex-1 opacity-20" style={{ background: "linear-gradient(to left, transparent, #ec4899)" }} />
              </motion.div>
            );
          }

          if (msg.type === "song_change") {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center gap-2 py-4"
              >
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    borderColor: "rgba(168,85,247,0.2)",
                  }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#a855f7", boxShadow: "0 0 8px #a855f7" }}
                  />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-purple-400">
                    Nueva cancion
                  </span>
                </div>
                <p className="text-[10px] font-bold text-white text-center leading-snug px-4">
                  {msg.text}
                </p>
              </motion.div>
            );
          }

          if (msg.type === "reaction") {
            const songIdx = messages.slice(0, i).filter((m) => m.type === "song_change").length;
            const reactionKey = `${songIdx}-${REACTIONS.findIndex((r) => r.emoji === msg.emoji)}`;
            const isNew = localReactions[reactionKey];

            return (
              <motion.div
                key={i}
                initial={isNew ? { scale: 0, opacity: 0 } : { opacity: 0.5, scale: 0.8 }}
                animate={{ scale: 1, opacity: isNew ? 1 : 0.5 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-[9px] font-semibold text-zinc-400">{msg.user}</span>
                  <span className="text-zinc-600">reacciona</span>
                  <span className="text-[10px]">con</span>
                  <span className="text-[10px] font-bold" style={{ color: msg.color }}>
                    {msg.emoji}
                  </span>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group"
            >
              <div
                className="inline-flex flex-col rounded-2xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[9px] font-bold text-pink-400/80 mb-0.5">{msg.user}</span>
                <span className="text-[10px] font-medium text-zinc-200 leading-relaxed">{msg.text}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative px-4 py-3 border-t border-white/[0.04]">
        <div className="absolute inset-x-0 bottom-full h-8 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(8,8,12,1) 0%, transparent 100%)", zIndex: 2 }} />

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 240))}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={disabled}
              placeholder="Escribe un mensaje..."
              className="w-full rounded-xl border border-white/[0.06] bg-black/40 px-4 py-2.5 pr-16 text-[10px] text-white placeholder-zinc-600 outline-none transition-all focus:border-pink-500/30 focus:bg-black/50"
              style={{ fontSize: "10px" }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[7px] text-zinc-600 font-mono">{input.length}/240</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #ec4899 0%, #c026d3 100%)" : "rgba(255,255,255,0.05)",
              color: input.trim() ? "white" : "#71717a",
              boxShadow: input.trim() ? "0 4px 12px rgba(236,72,153,0.4)" : "none",
            }}
          >
            <Send size={14} />
          </motion.button>
        </div>

        <div className="relative mt-2">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-semibold text-zinc-500 border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] transition-all uppercase tracking-wider"
            >
              <Zap size={8} />
              <span>Reaccionar</span>
            </button>
          </div>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1.5"
              >
                {REACTIONS.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleReaction(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all"
                      style={{
                        background: `${r.color}15`,
                        borderColor: `${r.color}40`,
                        boxShadow: `0 0 12px ${r.glow}`,
                      }}
                    >
                      <Icon size={14} style={{ color: r.color }} />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
