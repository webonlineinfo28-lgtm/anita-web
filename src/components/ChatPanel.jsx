import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles } from "lucide-react";

import Avatar from "./Avatar.jsx";
import { AVATAR_PALETTES } from "../lib/avatars.js";

export const REACTION_EMOJIS = ["🔥", "❤️", "👏", "😂", "😮", "🥳"];

// Un mensaje del chat con su avatar y color (por usuario).
function MessageRow({ message, avatar }) {
  const base = avatar || {};
  const isSystem = message.type === "system";
  if (isSystem) {
    return (
      <div className="flex items-center justify-center gap-1.5 px-2 py-1 text-center">
        <Sparkles size={9} className="text-pink-500/60" />
        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
          {message.text}
        </span>
      </div>
    );
  }
  const time = new Date(message.time).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const accentColor = AVATAR_PALETTES.accent[base.accent] || "#ec4899";

  return (
    <div className="flex items-start gap-2 px-1 py-0.5">
      <Avatar config={base} size={24} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span
            className="max-w-[110px] truncate text-[9px] font-black uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {message.user}
          </span>
          <span className="text-[7px] font-medium text-zinc-600">{time}</span>
        </div>
        <p className="break-words text-[11px] leading-snug text-zinc-200">
          {message.text}
        </p>
      </div>
    </div>
  );
}

export default function ChatPanel({
  messages,
  avatars,
  onSend,
  onReact,
  trackReactions,
}) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const hasReactions =
    trackReactions && Object.values(trackReactions).some((u) => u.length > 0);

  return (
    <div className="glass-card flex h-[300px] flex-col rounded-[2rem] p-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-pink-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Chat de la sala
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          En vivo
        </span>
      </div>

      {/* Reacciones a la canción actual */}
      <div className="mb-2 flex items-center justify-between gap-1 rounded-xl border border-white/5 bg-black/30 px-2 py-1.5">
        <div className="flex gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              title={`Reaccionar con ${emoji}`}
              className="rounded-lg px-1.5 py-0.5 text-lg leading-none transition-all hover:scale-125 hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
        </div>
        {hasReactions ? (
          <div className="flex max-w-[40%] flex-wrap justify-end gap-1">
            {Object.entries(trackReactions)
              .filter(([, u]) => u.length > 0)
              .slice(0, 4)
              .map(([emoji, users]) => (
                <span
                  key={emoji}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-black text-zinc-300"
                >
                  {emoji} {users.length}
                </span>
              ))}
          </div>
        ) : (
          <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">
            reacciona a esta canción
          </span>
        )}
      </div>

      <div
        ref={listRef}
        className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-1 py-1"
      >
        {messages.length === 0 ? (
          <p className="py-6 text-center text-[9px] font-black uppercase italic tracking-widest text-zinc-700">
            Silencio cósmico… di algo ✨
          </p>
        ) : (
          messages.map((m) => (
            <MessageRow key={m.id} message={m} avatar={avatars[m.user]} />
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Escribe algo para la sala…"
          className="glass-input flex-1 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white placeholder:text-zinc-600 focus:!border-pink-500"
          maxLength={240}
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="flex w-10 items-center justify-center rounded-xl bg-pink-600 text-white transition-all hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}