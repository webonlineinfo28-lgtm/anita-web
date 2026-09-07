import { useEffect, useMemo, useRef } from "react";

// Estrellas fugaces: ciclo largo CSS puro con delays escalonados.
// Cero timers de JS, cero re-renders.
const SHOOTING_STARS = [
  { top: "12%", left: "55%", delay: "3s", duration: "14s", scale: 1 },
  { top: "28%", left: "70%", delay: "9.5s", duration: "18s", scale: 0.7 },
  { top: "6%", left: "20%", delay: "15s", duration: "22s", scale: 1.2 },
];

export default function CosmicBackground({ accent = "#ec4899" }) {
  const rootRef = useRef(null);

  // Parallax de ratón: 1 listener + rAF escribe 2 variables CSS en el
  // contenedor; cada estrella multiplica según su profundidad. Cero re-renders.
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = rootRef.current;
        if (!el) return;
        const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        el.style.setProperty("--mx", nx.toFixed(3));
        el.style.setProperty("--my", ny.toFixed(3));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 110 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.15 + Math.random() * 0.5,
        delay: `${(Math.random() * 8).toFixed(2)}s`,
        duration: `${(4 + Math.random() * 6).toFixed(2)}s`,
        depth: 4 + Math.random() * 18, // px máx. de desplazamiento parallax
      })),
    []
  );

  const nebulae = useMemo(
    () => [
      { x: "-10%", y: "-10%", size: "40rem", color: accent, opacity: 0.14, delay: "0s" },
      { x: "60%", y: "20%", size: "35rem", color: "#a855f7", opacity: 0.1, delay: "-4s" },
      { x: "20%", y: "60%", size: "30rem", color: "#6366f1", opacity: 0.08, delay: "-8s" },
      { x: "80%", y: "70%", size: "25rem", color: accent, opacity: 0.09, delay: "-6s" },
    ],
    [accent]
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ "--mx": 0, "--my": 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-[#0a0a12] to-[#030303]" />

      {/* Nebulosas — tiñen el cielo con el color de acento del DJ actual */}
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
            transition: "background 1.2s ease",
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(3, 3, 3, 0.3) 100%)`,
        }}
      />

      {/* Estrellas con parallax por profundidad (heredan --mx/--my) */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            transform: `translate3d(calc(var(--mx) * ${s.depth.toFixed(1)}px), calc(var(--my) * ${s.depth.toFixed(1)}px), 0)`,
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      {/* Estrellas fugaces */}
      {SHOOTING_STARS.map((m, i) => (
        <span
          key={`meteor-${i}`}
          className="shooting-star"
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
            scale: String(m.scale),
          }}
        />
      ))}

      <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; scale: 1; }
          50% { opacity: 0.7; scale: 1.2; }
        }
        @keyframes blob {
          0%, 100% { translate: 0 0; scale: 1; }
          33% { translate: 30px -40px; scale: 1.05; }
          66% { translate: -20px 20px; scale: 0.95; }
        }
        .animate-blob { animation: blob 14s ease-in-out infinite; }
        @keyframes shoot {
          0% { translate: 0 0; opacity: 0; }
          4% { opacity: 1; }
          12% { translate: -520px 520px; opacity: 0; }
          100% { translate: -520px 520px; opacity: 0; }
        }
        .shooting-star {
          position: absolute;
          width: 130px;
          height: 1.5px;
          border-radius: 9999px;
          background: linear-gradient(270deg, #fff 0%, rgba(255,255,255,0.6) 30%, transparent 100%);
          box-shadow: 0 0 6px rgba(255,255,255,0.8);
          rotate: 45deg;
          opacity: 0;
          animation: shoot 16s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .star, .animate-blob, .shooting-star { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
