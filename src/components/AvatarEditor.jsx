﻿import { useState } from "react";
import { Dices, RotateCcw, X } from "lucide-react";

import Avatar from "./Avatar.jsx";
import {
  ACCESSORIES,
  AVATAR_DEFAULTS,
  AVATAR_PALETTES,
  BROWS,
  EYES,
  HAIRS,
  HATS,
  MOUTHS,
  PETS,
  normalizeAvatar,
  randomAvatar,
} from "../lib/avatars.js";

const TABS = [
  { id: "face", label: "Cara" },
  { id: "hair", label: "Pelo" },
  { id: "outfit", label: "Ropa" },
  { id: "extras", label: "Extras" },
  { id: "pet", label: "Mascota" },
];

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
        active
          ? "border-pink-500 bg-pink-600 text-white shadow-lg shadow-pink-600/20"
          : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function ColorSwatch({ color, name, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={name}
      className={`h-8 w-8 rounded-full border-2 transition-all ${
        active
          ? "scale-110 border-white shadow-[0_0_10px_rgba(236,72,153,0.6)]"
          : "border-white/20 hover:scale-105"
      }`}
      style={{ background: color }}
    />
  );
}

function PickerRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function AvatarEditor({ config, onSave, onClose }) {
  const [draft, setDraft] = useState(() => normalizeAvatar(config));
  const [tab, setTab] = useState("face");

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const sortedKeys = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => ({ k, v }))
      .sort((a, b) => a.v.localeCompare(b.v));

  const renderTab = () => {
    switch (tab) {
      case "face":
        return (
          <>
            <PickerRow label="Piel">
              {sortedKeys(AVATAR_PALETTES.skin).map(({ k, v }) => (
                <ColorSwatch
                  key={k}
                  color={v}
                  name={k}
                  active={draft.skin === k}
                  onClick={() => set("skin", k)}
                />
              ))}
            </PickerRow>
            <PickerRow label="Ojos">
              {EYES.map((e) => (
                <Chip key={e} label={e} active={draft.eyes === e} onClick={() => set("eyes", e)} />
              ))}
            </PickerRow>
            <PickerRow label="Cejas">
              {BROWS.map((b) => (
                <Chip key={b} label={b} active={draft.brows === b} onClick={() => set("brows", b)} />
              ))}
            </PickerRow>
            <PickerRow label="Boca">
              {MOUTHS.map((m) => (
                <Chip key={m} label={m} active={draft.mouth === m} onClick={() => set("mouth", m)} />
              ))}
            </PickerRow>
          </>
        );
      case "hair":
        return (
          <>
            <PickerRow label="Peinado">
              {HAIRS.map((h) => (
                <Chip key={h} label={h} active={draft.hair === h} onClick={() => set("hair", h)} />
              ))}
            </PickerRow>
            <PickerRow label="Color de pelo">
              {sortedKeys(AVATAR_PALETTES.hair).map(({ k, v }) => (
                <ColorSwatch
                  key={k}
                  color={v}
                  name={k}
                  active={draft.hairColor === k}
                  onClick={() => set("hairColor", k)}
                />
              ))}
            </PickerRow>
          </>
        );
      case "outfit":
        return (
          <>
            <PickerRow label="Atuendo">
              {Object.keys(AVATAR_PALETTES.outfit).map((o) => (
                <Chip key={o} label={o} active={draft.outfit === o} onClick={() => set("outfit", o)} />
              ))}
            </PickerRow>
            <PickerRow label="Color de acento (glow)">
              {sortedKeys(AVATAR_PALETTES.accent).map(({ k, v }) => (
                <ColorSwatch
                  key={k}
                  color={v}
                  name={k}
                  active={draft.accent === k}
                  onClick={() => set("accent", k)}
                />
              ))}
            </PickerRow>
          </>
        );
      case "extras":
        return (
          <>
            <PickerRow label="Accesorio">
              {ACCESSORIES.map((a) => (
                <Chip key={a} label={a} active={draft.accessory === a} onClick={() => set("accessory", a)} />
              ))}
            </PickerRow>
            <PickerRow label="Sombrero">
              {HATS.map((h) => (
                <Chip key={h} label={h} active={draft.hat === h} onClick={() => set("hat", h)} />
              ))}
            </PickerRow>
          </>
        );
      case "pet":
        return (
          <PickerRow label="Mascota compaÃ±era">
            {Object.entries(PETS).map(([k, emoji]) => (
              <Chip
                key={k}
                label={emoji ? `${emoji} ${k}` : "Ninguna"}
                active={draft.pet === k}
                onClick={() => set("pet", k)}
              />
            ))}
          </PickerRow>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">
              DiseÃ±a tu <span className="text-pink-500">avatar cÃ³smico</span>
            </h2>
            <p className="text-[10px] text-zinc-500">La fiesta te mirarÃ¡ asÃ­ ðŸ‘€</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-6">
          <div className="shrink-0 rounded-3xl border border-white/10 bg-black/40 p-3">
            <Avatar config={draft} size={130} live />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                  tab === t.id
                    ? "bg-pink-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[40vh] overflow-y-auto pr-1">{renderTab()}</div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/5 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDraft(randomAvatar())}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/10 hover:text-pink-400"
            >
              <Dices size={12} /> Aleatorio
            </button>
            <button
              onClick={() => setDraft(normalizeAvatar(AVATAR_DEFAULTS))}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/10"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/10">
              Cancelar
            </button>
            <button
              onClick={() => onSave(normalizeAvatar(draft))}
              className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-pink-600/20 transition-all hover:from-pink-500 hover:to-purple-500"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
