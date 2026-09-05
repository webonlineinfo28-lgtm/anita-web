import { renderAvatar } from "../lib/avatars.js";

// Renderiza el avatar SVG procedental de un usuario con glow de "en directo" opcional.
export default function Avatar({
  config,
  size = 40,
  live = false,
  muted = false,
  className = "",
}) {
  const svg = renderAvatar(config);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {live && (
        <span
          className="pointer-events-none absolute -inset-1 rounded-full animate-pulse"
          style={{ boxShadow: `0 0 ${Math.max(10, size / 3)}px rgba(236,72,153,0.45)` }}
        />
      )}
      <div
        className={`h-full w-full overflow-hidden rounded-full ${
          muted ? "opacity-50 grayscale" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}