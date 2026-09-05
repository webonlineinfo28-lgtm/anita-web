import { motion } from "framer-motion";
import { Disc3, MessageSquare, Sparkles, Star, Users, Crown, X, Zap, BookOpen, Info } from "lucide-react";

const RULES = [
  { id: "cabina", icon: Disc3, color: "#ec4899", glow: "rgba(236,72,153,0.15)", label: "La Cabina DJ", subtitle: "Música y rotación", items: [
    { icon: "🎵", text: "Máximo 1 canción por persona en la cola activa" }, { icon: "⏱", text: "Duración máxima 8 minutos por track" }, { icon: "🚫", text: "Contenido NSFW o ilegal = expulsión inmediata" },
    { icon: "🤝", text: "El DJ decide qué suena — respeta su turno" }, { icon: "🔄", text: "La cola rota automáticamente al terminar tema" }, { icon: "🎡", text: "El host puede sortear quién sube a la cabina" },
  ]},
  { id: "bingo", icon: Star, color: "#a855f7", glow: "rgba(168,85,247,0.15)", label: "El Bingo", subtitle: "Sorteo cósmico", items: [
    { icon: "👑", text: "Solo el host controla el bombo compartido" }, { icon: "🎴", text: "Cartón permanente — no cambia durante la partida" }, { icon: "🛑", text: "Línea pausa 13s · Bingo nueva partida" },
    { icon: "🤝", text: "Cada jugador celebra su cartón de forma local" }, { icon: "🎉", text: "Línea y Bingo disparan confeti épico + sonido" }, { icon: "🔢", text: "75 bolas sin repetidos, 3s entre extracciones" },
  ]},
  { id: "chat", icon: MessageSquare, color: "#22d3ee", glow: "rgba(34,211,238,0.12)", label: "Chat de Sala", subtitle: "Comunicación", items: [
    { icon: "📏", text: "Máximo 240 caracteres por mensaje" }, { icon: "🚫", text: "Sin spam ni flood — 60 mensajes máximo" }, { icon: "🎯", text: "Reacciones vinculadas a la canción activa" },
    { icon: "⚙️", text: "Un emoji por usuario y canción" }, { icon: "💫", text: "Mensajes del sistema en rosa neón" }, { icon: "🌐", text: "Chat sincronizado entre todas las pestañas" },
  ]},
  { id: "fama", icon: Zap, color: "#fbbf24", glow: "rgba(251,191,36,0.12)", label: "Sistema Fama", subtitle: "XP y niveles", items: [
    { icon: "🏆", text: "Bingo +150 XP · Línea +60 XP" }, { icon: "🎧", text: "Set DJ +20 XP · Canción +10 XP" }, { icon: "❤️", text: "Reacción recibida +5 XP" },
    { icon: "🌟", text: "7 niveles: Novato Cósmico → Leyenda del Festival" }, { icon: "🏅", text: "9 insignias coleccionables en tu perfil" }, { icon: "📊", text: "Ranking de leyendas basado en bingos totales" },
  ]},
  { id: "convivencia", icon: Users, color: "#34d399", glow: "rgba(52,211,153,0.12)", label: "Convivencia", subtitle: "Normas sociales", items: [
    { icon: "✨", text: "Respeta a todos los asistentes siempre" }, { icon: "🎭", text: "Nombre de usuario apropiado — sin ofensas" }, { icon: "🌐", text: "Todo funciona entre pestañas automáticamente" },
    { icon: "🔒", text: "Todo local — ningún dato sale del navegador" }, { icon: "📺", text: "Modo proyector para pantallas grandes" }, { icon: "🕵", text: "Supabase opcional para sincronización cruzada" },
  ]},
  { id: "host", icon: Crown, color: "#f59e0b", glow: "rgba(245,158,11,0.12)", label: "El Host", subtitle: "Administración", items: [
    { icon: "🔑", text: "Acceso: Anita_sorrita o password + Soy el host" }, { icon: "🎛", text: "Control total: bombo, rotación, expulsión DJs" }, { icon: "🎡", text: "Sorteo cósmico para elegir próximo DJ" },
    { icon: "📣", text: "La sala funciona mientras el host esté activo" }, { icon: "🎮", text: "Puede mover o eliminar canciones de la cola" }, { icon: "⚡", text: "Gestiona la partida de bingo (pausar, reiniciar)" },
  ]},
];

export default function RulesPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 cursor-pointer" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1080px] max-h-[88vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/[0.07]"
        style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(32px) saturate(180%)", boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        <div className="relative flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40"
            style={{ background: "radial-gradient(ellipse 70% 120% at 50% -10%, rgba(236,72,153,0.22), transparent 70%)" }} />
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08]"
              style={{ background: "linear-gradient(145deg, rgba(236,72,153,0.18), rgba(168,85,247,0.12))", boxShadow: "0 0 24px rgba(236,72,153,0.25), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <BookOpen size={20} className="text-pink-400" style={{ filter: "drop-shadow(0 0 10px rgba(236,72,153,0.7))" }} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Protocolo del <span style={{ color: "#ec4899", textShadow: "0 0 24px rgba(236,72,153,0.5)" }}>Festival</span>
              </h2>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <Info size={10} className="text-pink-500/50" />6 categorías · 36 reglas · protocolo cósmico
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-zinc-500 transition-all duration-300 hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-400"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <X size={16} />
            <span className="absolute -bottom-7 text-[8px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "rgba(236,72,153,0.6)" }}>Cerrar</span>
          </button>
        </div>
        <div className="relative flex-1 overflow-y-auto px-8 pb-6 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          <div className="grid grid-cols-3 gap-5">
            {RULES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 cursor-default"
                  style={{ background: `linear-gradient(145deg, ${cat.color}0d, transparent)`, borderColor: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "40"; e.currentTarget.style.boxShadow = `0 12px 40px ${cat.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div className="h-[2px] w-full opacity-50" style={{ background: `linear-gradient(to right, ${cat.color}, transparent)` }} />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300"
                        style={{ background: cat.color + "14", borderColor: cat.color + "35", boxShadow: `0 0 14px ${cat.color}18` }}>
                        <Icon size={18} style={{ color: cat.color }} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</h3>
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">{cat.subtitle}</p>
                      </div>
                    </div>
                    <div className="h-px w-full opacity-15" style={{ background: `linear-gradient(to right, ${cat.color}, transparent)` }} />
                    <ul className="flex flex-col gap-2">
                      {cat.items.map((item, ri) => (
                        <li key={ri} className="flex items-start gap-2.5">
                          <span className="mt-0.5 shrink-0 text-[13px] leading-none">{item.icon}</span>
                          <span className="text-[10px] font-medium leading-snug text-zinc-300 group-hover:text-zinc-100 transition-colors">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="relative flex items-center justify-between px-8 py-4 shrink-0 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Sparkles size={11} className="text-pink-500/40" />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">Anita Festival · Protocolo Cósmico v2.0</p>
            <Sparkles size={11} className="text-pink-500/40" />
          </div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">La diversión es el único requisito</p>
        </div>
      </motion.div>
    </div>
  );
}
