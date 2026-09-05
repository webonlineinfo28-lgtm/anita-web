import { motion } from "framer-motion";
import { Disc3, MessageSquare, Zap, Star, Users, Crown, X, BookOpen } from "lucide-react";

const RULES = [
  {
    id: "cabina",
    icon: Disc3,
    color: "#ec4899",
    gradient: "from-pink-500/10 via-transparent to-transparent",
    borderGlow: "rgba(236, 72, 153, 0.25)",
    label: "La Cabina DJ",
    subtitle: "M�sica y rotaci�n",
    items: [
      { text: "M�ximo 1 canci�n por persona en la cola activa" },
      { text: "Duraci�n m�xima 8 minutos por track" },
      { text: "Contenido NSFW o ilegal = expulsi�n inmediata" },
      { text: "El DJ decide que suena - respeta su turno" },
      { text: "La cola rota autom�ticamente al terminar tema" },
      { text: "El host puede sortear quien sube a la cabina" },
    ],
  },
  {
    id: "bingo",
    icon: Star,
    color: "#a855f7",
    gradient: "from-purple-500/10 via-transparent to-transparent",
    borderGlow: "rgba(168, 85, 247, 0.25)",
    label: "El Bingo",
    subtitle: "Sorteo c�smico",
    items: [
      { text: "Solo el host controla el bombo compartido" },
      { text: "Carton permanente - no cambia durante la partida" },
      { text: "L�nea pausa 13s - Bingo nueva partida" },
      { text: "Cada jugador celebra su carton de forma local" },
      { text: "L�nea y Bingo disparan confeti �pico + sonido" },
      { text: "75 bolas sin repetidos, 3s entre extracciones" },
    ],
  },
  {
    id: "chat",
    icon: MessageSquare,
    color: "#22d3ee",
    gradient: "from-cyan-500/10 via-transparent to-transparent",
    borderGlow: "rgba(34, 211, 238, 0.25)",
    label: "Chat de Sala",
    subtitle: "Comunicaci�n",
    items: [
      { text: "M�ximo 240 caracteres por mensaje" },
      { text: "Sin spam ni flood - 60 mensajes m�ximo" },
      { text: "Reacciones vinculadas a la canci�n activa" },
      { text: "Un emoji por usuario y canci�n" },
      { text: "Mensajes del sistema en rosa neon" },
      { text: "Chat sincronizado entre todas las pestanas" },
    ],
  },
  {
    id: "fama",
    icon: Zap,
    color: "#fbbf24",
    gradient: "from-amber-500/10 via-transparent to-transparent",
    borderGlow: "rgba(251, 191, 36, 0.25)",
    label: "Sistema Fama",
    subtitle: "XP y niveles",
    items: [
      { text: "Bingo +150 XP - Línea +60 XP" },
      { text: "Set DJ +20 XP - Canción +10 XP" },
      { text: "Reaccion recibida +5 XP" },
      { text: "7 niveles: Novato C�smico a Leyenda del Festival" },
      { text: "9 insignias coleccionables en tu perfil" },
      { text: "Ranking de leyendas basado en bingos totales" },
    ],
  },
  {
    id: "convivencia",
    icon: Users,
    color: "#34d399",
    gradient: "from-emerald-500/10 via-transparent to-transparent",
    borderGlow: "rgba(52, 211, 153, 0.25)",
    label: "Convivencia",
    subtitle: "Normas sociales",
    items: [
      { text: "Respeta a todos los asistentes siempre" },
      { text: "Nombre de usuario apropiado - sin ofensas" },
      { text: "Todo funciona entre pestanas autom�ticamente" },
      { text: "Todo local - ning�n dato sale del navegador" },
      { text: "Modo proyector para pantallas grandes" },
      { text: "Supabase opcional para sincronizaci�n cruzada" },
    ],
  },
  {
    id: "host",
    icon: Crown,
    color: "#f59e0b",
    gradient: "from-yellow-500/10 via-transparent to-transparent",
    borderGlow: "rgba(245, 158, 11, 0.25)",
    label: "El Host",
    subtitle: "Administracion",
    items: [
      { text: "Acceso: Anita_sorrita o password uwu.777" },
      { text: "Control total: bombo, rotaci�n, expulsi�n DJs" },
      { text: "Sorteo c�smico para elegir pr�ximo DJ" },
      { text: "La sala funciona mientras el host este activo" },
      { text: "Puede mover o eliminar canciones de la cola" },
      { text: "Gestiona la partida de bingo (pausar, reiniciar)" },
    ],
  },
];

export default function RulesPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/[0.08]"
        style={{
          background: "linear-gradient(180deg, rgba(12,12,18,0.98) 0%, rgba(8,8,12,0.99) 100%)",
          backdropFilter: "blur(40px) saturate(180%)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-48 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(236,72,153,0.25), transparent 70%)" }}
        />

        <div className="relative flex items-center justify-between px-8 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1]"
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.15) 100%)",
                boxShadow: "0 0 30px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <BookOpen size={20} style={{ color: "#ec4899", filter: "drop-shadow(0 0 8px rgba(236,72,153,0.6))" }} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                Protocolo <span className="text-gradient-pink">C�smico</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Reglas del Festival</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-400"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="relative flex-1 overflow-y-auto px-8 pb-6 pr-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RULES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br p-5 transition-all duration-300 cursor-default"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}08 0%, transparent 60%)`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = cat.color + "40";
                    e.currentTarget.style.boxShadow = `0 16px 48px ${cat.borderGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(to right, ${cat.color}, transparent)` }}
                  />

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300"
                      style={{
                        background: `${cat.color}15`,
                        borderColor: `${cat.color}40`,
                        boxShadow: `0 0 20px ${cat.color}20`,
                      }}
                    >
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: cat.color }}>
                        {cat.label}
                      </h3>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full mb-4 opacity-20" style={{ background: `linear-gradient(to right, ${cat.color}60, transparent)` }} />

                  <ul className="flex flex-col gap-2.5">
                    {cat.items.map((item, ri) => (
                      <li
                        key={ri}
                        className="flex items-start gap-3"
                      >
                        <div
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                          style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                        />
                        <span className="text-[10px] font-medium leading-relaxed text-zinc-300 group-hover:text-zinc-100 transition-colors duration-200">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-between px-8 py-4 shrink-0 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 opacity-30" style={{ background: "linear-gradient(to right, transparent, #ec4899)" }} />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">Anita Festival</p>
            <div className="h-px w-8 opacity-30" style={{ background: "linear-gradient(to left, transparent, #ec4899)" }} />
          </div>
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">la diversi�n es el unico requisito</p>
        </div>
      </motion.div>
    </div>
  );
}
