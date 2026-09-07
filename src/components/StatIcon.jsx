import {
  Crown,
  Disc3,
  Flame,
  Heart,
  Mic,
  Music,
  Plus,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Zap,
} from "lucide-react";

/** Mapeo de claves de icono (strings simples) → componentes lucide. */
const ICON_MAP = {
  sparkle: Sparkles,
  music: Music,
  mic: Mic,
  star: Star,
  crown: Crown,
  flame: Flame,
  trophy: Trophy,
  ticket: Ticket,
  zap: Zap,
  disc: Disc3,
  plus: Plus,
  heart: Heart,
};

/**
 * StatIcon
 * Renderiza un icono de lucide a partir de una clave (`icon` de LEVEL_TITLES/BADGES).
 * Siempre con fallback a Sparkles: ningún dato del catálogo puede romper el UI.
 */
export default function StatIcon({ name, size = 14, className = "", style }) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon size={size} className={className} style={style} />;
}
