import { useState } from "react";
import { motion } from "framer-motion";
import { Disc3, Mic2, Crown, User, Sparkles, Zap } from "lucide-react";
import { getAdminPassword } from "../lib/constants.js";
import { COLORS, colorWithAlpha } from "../lib/colors.js";
import "./login-screen.css";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [hostKey, setHostKey] = useState("");
  const [isHostMode, setIsHostMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    setIsLoading(true);
    setError("");

    // El host recibe su rol SOLO si la contraseña coincide con la de .env
    // (con fallback de desarrollo). El secreto nunca vive en el bundle
    // como literal visible en producción.
    const isHost = isHostMode && hostKey === getAdminPassword();

    if (isHostMode && !isHost) {
      setIsLoading(false);
      setError("Contraseña de host incorrecta. Puedes entrar como invitado.");
      return;
    }

    await new Promise((r) => setTimeout(r, 400));
    onLogin({
      name: cleanName.slice(0, 20),
      isHost,
    });
  };

  return (
    <div className="login-root">
      <div className="login-gradient" />
      <div className="login-noise" />
      <div className="login-grid" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header-glow" />

        <div className="login-logo-container">
          <motion.div
            className="login-logo"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 size={48} style={{ color: COLORS.pink, filter: `drop-shadow(0 0 12px ${colorWithAlpha(COLORS.pink, 0.6)})` }} />
          </motion.div>
        </div>

        <motion.h1
          className="login-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Anita <span className="login-title-accent">Festival</span>
        </motion.h1>

        <motion.p
          className="login-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          La noche donde la música nunca para
        </motion.p>

        <form onSubmit={handleSubmit} className="login-form">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <label className="login-label">Tu nombre</label>
            <div className="login-input-wrapper">
              <User size={14} className="login-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre aquí..."
                maxLength={20}
                autoFocus
                required
                className="login-input"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div className="login-toggle-row">
              <label className="login-label">Modo Host</label>
              <button
                type="button"
                onClick={() => setIsHostMode(!isHostMode)}
                className={`login-toggle ${isHostMode ? "login-toggle-active" : ""}`}
              >
                <motion.div
                  className="login-toggle-thumb"
                  animate={{ x: isHostMode ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {isHostMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="login-host-field"
              >
                <div className="login-input-wrapper">
                  <Crown size={14} className="login-input-icon" style={{ color: COLORS.amber }} />
                  <input
                    type="password"
                    value={hostKey}
                    onChange={(e) => setHostKey(e.target.value)}
                    placeholder="Password de host"
                    className="login-input"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="login-error"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="login-button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="login-loading">Conectando...</span>
            ) : (
              <>
                <Mic2 size={14} />
                Entrar al Festival
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          className="login-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="login-feature">
            <Disc3 size={12} />
            <span>Bingo cósmico</span>
          </div>
          <div className="login-feature">
            <Mic2 size={12} />
            <span>Cola DJ</span>
          </div>
          <div className="login-feature">
            <Sparkles size={12} />
            <span>Chat en vivo</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="login-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Zap size={10} />
        <span>Todo local - sin registros</span>
      </motion.div>
    </div>
  );
}
