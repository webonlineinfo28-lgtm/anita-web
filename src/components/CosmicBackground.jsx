import { useMemo } from "react";

// Fondo cósmico: orbes de gradiente animados + campo de estrellas.
// Pura decoración (aria-hidden) y respeta prefers-reduced-motion.
export default function CosmicBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2.4,
        opacity: 0.25 + Math.random() * 0.6,
        delay: `${(Math.random() * 7).toFixed(2)}s`,
        duration: `${(3 + Math.random() * 5).toFixed(2)}s`,
      })),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#030303]" />

      {/* Orbes cósmicos en movimiento */}
      <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-pink-600/25 blur-[110px] animate-blob" />
      <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-purple-600/25 blur-[120px] animate-blob [animation-delay:-4s]" />
      <div className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-600/15 blur-[110px] animate-blob [animation-delay:-8s]" />
      <div className="absolute top-10 left-1/2 h-72 w-72 rounded-full bg-[#ec4899]/10 blur-[90px] animate-blob [animation-delay:-6s]" />

      {/* Estrellas parpadeantes */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-blob, [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}