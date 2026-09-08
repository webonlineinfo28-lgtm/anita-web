import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Heart, Star, Zap, PartyPopper, Sparkles, Smile } from "lucide-react";
import Avatar from "./Avatar.jsx";
import { REACTION_COLORS, colorWithAlpha } from "../lib/colors.js";

const REACTIONS = [
  { emoji: "Heart", icon: Heart, color: REACTION_COLORS.heart, glow: colorWithAlpha(REACTION_COLORS.heart, 0.4) },
  { emoji: "Star", icon: Star, color: REACTION_COLORS.star, glow: colorWithAlpha(REACTION_COLORS.star, 0.4) },
  { emoji: "Zap", icon: Zap, color: REACTION_COLORS.zap, glow: colorWithAlpha(REACTION_COLORS.zap, 0.4) },
  { emoji: "Party", icon: PartyPopper, color: REACTION_COLORS.party, glow: colorWithAlpha(REACTION_COLORS.party, 0.4) },
  { emoji: "Sparkles", icon: Sparkles, color: REACTION_COLORS.sparkles, glow: colorWithAlpha(REACTION_COLORS.sparkles, 0.4) },
];

function FloatingReaction({ icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2"
    >
      <Icon size={20} style={{ color }} />
    </motion.div>
  );
}

function ChatMessage({ message, avatar, accent, isOwn, onReaction, userReacted }) {
  const [showReactions, setShowReactions] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const timeoutsRef = useRef(new Set());

  // Limpieza de timeouts pendientes al desmontar (evita setState en componente muerto).
  useEffect(() => {
    const pending = timeoutsRef.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleReaction = (reaction) => {
    if (!userReacted) {
      onReaction?.(reaction);
      const id = Date.now() + Math.random();
      setFloatingEmojis((prev) => [...prev, { id, icon: reaction.icon, color: reaction.color }]);
      const t = setTimeout(() => {
        timeoutsRef.current.delete(t);
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 1000);
      timeoutsRef.current.add(t);
    }
    setShowReactions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      <div className="shrink-0">
        <Avatar config={avatar} size={36} />
      </div>

      <div className={`relative max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent || "#a1a1aa" }}>
            {message.user}
          </span>
          <span className="text-[9px] text-zinc-600">
            {formatMsgTime(message.time)}
          </span>
        </div>

        <div
          className={`relative rounded-2xl px-4 py-2.5 ${
            message.type === "system"
              ? "bg-pink-500/10 border border-pink-500/20 text-pink-300"
              : isOwn
                ? "bg-gradient-to-br from-pink-600/30 to-purple-600/20 border border-pink-500/20"
                : "bg-white/5 border border-white/10"
          }`}
        >
          <p className="text-sm leading-relaxed text-zinc-200">{message.text}</p>

          {message.type !== "system" && (
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Smile size={12} className="text-zinc-400" />
            </button>
          )}

          <AnimatePresence>
            {floatingEmojis.map((emoji) => (
              <FloatingReaction key={emoji.id} icon={emoji.icon} color={emoji.color} />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className="absolute bottom-full left-0 mb-2 flex gap-1 p-1.5 rounded-xl bg-zinc-900/95 border border-white/10 shadow-xl backdrop-blur-sm"
              >
                {REACTIONS.map((r, i) => {
                  const RIcon = r.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(r)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}
                    >
                      <RIcon size={14} style={{ color: r.color }} />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
            {message.reactions.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}30` }}
              >
                <r.icon size={10} /> {r.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Hora de mensaje blindada: si el timestamp no es válido, no muestra nada raro.
function formatMsgTime(t) {
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({ messages, avatars, onSend, onReact, trackReactions, disabled, sessionUser }) {
  const [input, setInput] = useState("");
  const [localReactions, setLocalReactions] = useState({});
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setLocalReactions({});
  }, [messages?.find((m) => m?.type === "song_change")?.time]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend?.(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleReaction = (messageIdx, reaction) => {
    const key = `${messageIdx}-${reaction?.emoji ?? ""}`;
    if (!localReactions[key]) {
      setLocalReactions((prev) => ({ ...prev, [key]: true }));
      onReact?.(reaction?.emoji);
    }
  };

  const showTimestamp = (m, i) => {
    if (i === 0) return true;
    const prev = messages[i - 1];
    if (typeof m?.time !== "number" || typeof prev?.time !== "number") return false;
    return m.time - prev.time > 300000 || prev.type === "song_change";
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/20">
          <MessageSquare size={18} className="text-pink-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Chat</h3>
          <p className="text-[10px] text-zinc-500">Sala en vivo</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 cosmic-scrollbar">
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600">
            <MessageSquare size={32} className="mb-2 opacity-30" />
            <p className="text-xs font-semibold">No hay mensajes aún</p>
            <p className="text-[10px] text-zinc-700">¡Sé el primero en hablar!</p>
          </div>
        ) : (
          (messages || []).map((message, i) => (
            <div key={message?.id || i}>
              {showTimestamp(message, i) && (
                <div className="flex items-center justify-center">
                  <span className="text-[9px] font-bold text-zinc-600 px-2 py-0.5 rounded-full bg-white/5">
                    {formatMsgTime(message?.time)}
                  </span>
                </div>
              )}
              <ChatMessage
                message={message || {}}
                avatar={avatars?.[message?.user]}
                accent={message?.accent}
                isOwn={message?.user === sessionUser}
                onReaction={(r) => handleReaction(i, r)}
                userReacted={Object.keys(localReactions).some((k) => k.startsWith(`${i}-`))}
              />
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 240))}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={disabled}
              placeholder="Escribe un mensaje..."
              className="glass-input w-full px-4 py-3 pr-12 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-mono">
              {input.length}/240
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="btn btn-primary px-4"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}



