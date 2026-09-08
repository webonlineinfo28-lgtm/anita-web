import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Trophy, X } from "lucide-react";
import { TOAST_COLORS, colorWithAlpha } from "../lib/colors.js";

const TYPES = {
  success: { icon: CheckCircle2, color: TOAST_COLORS.success, bg: colorWithAlpha(TOAST_COLORS.success, 0.12), border: colorWithAlpha(TOAST_COLORS.success, 0.35) },
  info: { icon: Info, color: TOAST_COLORS.info, bg: colorWithAlpha(TOAST_COLORS.info, 0.12), border: colorWithAlpha(TOAST_COLORS.info, 0.35) },
  warning: { icon: AlertTriangle, color: TOAST_COLORS.warning, bg: colorWithAlpha(TOAST_COLORS.warning, 0.12), border: colorWithAlpha(TOAST_COLORS.warning, 0.35) },
  levelup: { icon: Trophy, color: TOAST_COLORS.levelup, bg: colorWithAlpha(TOAST_COLORS.levelup, 0.15), border: colorWithAlpha(TOAST_COLORS.levelup, 0.45) },
};

let toastId = 0;
export function makeToast(type, message) {
  return { id: ++toastId, type, message };
}

function ToastItem({ toast, onClose }) {
  const meta = TYPES[toast.type] || TYPES.info;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-xl"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,.45), 0 0 20px ${meta.color}22`,
      }}
    >
      <Icon size={18} style={{ color: meta.color }} className="shrink-0" />
      <span className="text-sm font-bold text-white">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-2 shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
        title="Cerrar"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.slice(-3).map((t) => (
          <ToastItem key={t.id} toast={t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
