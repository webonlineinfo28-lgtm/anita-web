import { Camera, Save, Shuffle } from "lucide-react";
import { useState } from "react";
import { getAdminPassword, HOST_USERNAME } from "../lib/constants.js";
import { renderAvatar, randomAvatar } from "../lib/avatars.js";
import AvatarEditor from "./AvatarEditor.jsx";
import RulesPanel from "./RulesPanel.jsx";
import "./login-screen.css";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isHostMode, setIsHostMode] = useState(false);
  const [avatarCfg, setAvatarCfg] = useState(randomAvatar());
  const [showEditor, setShowEditor] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState("");

  const avatarSvg = renderAvatar(avatarCfg);

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (trimmedName === HOST_USERNAME) {
      onLogin(trimmedName, "admin", "");
      return;
    }

    if (isHostMode) {
      if (password === getAdminPassword()) {
        onLogin(trimmedName, "admin", password);
        return;
      }
      setError("Contrasena de host incorrecta");
      return;
    }

    onLogin(trimmedName, "user", "");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const saveAvatar = (cfg) => {
    setAvatarCfg(cfg);
    setShowEditor(false);
  };

  return (
    <div className="ls-root">
      <div className="ls-card">
        <div className="ls-head">
          <div className="ls-logo">
            <img src="/favicon.svg" alt="Anita Festival" className="ls-logo-img" />
          </div>
          <h1 className="ls-title">
            Anita <span className="ls-pink">Festival</span>
          </h1>
          <p className="ls-sub">Ingresa tu nombre para acceder a la sala de fiesta</p>
        </div>

        {error && <div className="ls-error">{error}</div>}

        <div className="ls-form">
          <input
            className="ls-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={onKeyDown}
            placeholder="Tu nombre"
            autoFocus
          />

          <div className="ls-host-row">
            <input
              type="password"
              className="ls-input ls-input-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isHostMode ? "Contrasena del host" : "Password (opcional)"}
              disabled={!isHostMode}
            />
            <label className="ls-switch">
              <input
                type="checkbox"
                checked={isHostMode}
                onChange={(e) => {
                  setIsHostMode(e.target.checked);
                  if (!e.target.checked) setPassword("");
                }}
              />
              <span className="ls-switch-knob" />
              <span className="ls-switch-label">Soy el host</span>
            </label>
          </div>

          <div className="ls-avatar-preview">
            <div className="ls-avatar" dangerouslySetInnerHTML={{ __html: avatarSvg }} />
          </div>

          <div className="ls-avatar-actions">
            <button type="button" className="ls-btn ls-btn-ghost" onClick={() => setAvatarCfg(randomAvatar())}>
              <Shuffle size={16} />
              <span>Aleatorio</span>
            </button>
            <button type="button" className="ls-btn ls-btn-ghost" onClick={() => setShowEditor(true)}>
              <Camera size={16} />
              <span>Editar avatar</span>
            </button>
          </div>

          <button className="ls-btn ls-btn-primary" disabled={!name.trim()} onClick={submit}>
            <Save size={16} />
            <span>{isHostMode ? "Entrar como Host" : "Entrar al Festival"}</span>
          </button>

          <button
            type="button"
            className="ls-btn ls-btn-ghost ls-btn-rules"
            onClick={() => setShowRules(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>Reglas del Festival</span>
          </button>
        </div>
      </div>

      {showEditor && (
        <AvatarEditor config={avatarCfg} onSave={saveAvatar} onClose={() => setShowEditor(false)} />
      )}

      {showRules && (
        <RulesPanel onClose={() => setShowRules(false)} />
      )}
    </div>
  );
}