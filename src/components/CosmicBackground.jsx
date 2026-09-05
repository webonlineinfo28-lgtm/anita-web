import { useMemo } from "react";

export default function CosmicBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.5,
      delay: `${(Math.random() * 8).toFixed(2)}s`,
      duration: `${(4 + Math.random() * 6).toFixed(2)}s`,
    })),
    []
  );

  const nebulae = useMemo(() => [
    { x: "-10%", y: "-10%", size: "40rem", color: "#ec4899", opacity: 0.12, delay: "0s" },
    { x: "60%", y: "20%", size: "35rem", color: "#a855f7", opacity: 0.1, delay: "-4s" },
    { x: "20%", y: "60%", size: "30rem", color: "#6366f1", opacity: 0.08, delay: "-8s" },
    { x: "80%", y: "70%", size: "25rem", color: "#22d3ee", opacity: 0.06, delay: "-6s" },
  ], []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-[#0a0a12] to-[#030303]" />

      {nebulae.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[120px] animate-blob"
          style={{
            left: n.x,
            top: n.y,
            width: n.size,
            height: n.size,
            background: `radial-gradient(circle, ${n.color}${Math.round(n.opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            animationDelay: n.delay,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(3, 3, 3, 0.3) 100%)`,
        }}
      />

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

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob { animation: blob 14s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-blob, [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
