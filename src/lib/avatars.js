// ---------------------------------------------------------------------------
// Sistema de AVATARES procedenciales (sin imágenes externas, sin emojis).
// El config del usuario solo contiene CLAVES; cada clave se resuelve contra
// los catálogos de abajo, así que ningún dato libre llega al SVG.
// Las mascotas son arte vectorial dibujado, no emojis.
// ---------------------------------------------------------------------------

export const AVATAR_PALETTES = {
  skin: {
    ivory: "#ffe4c4",
    peach: "#ffd2a6",
    sand: "#f6c48f",
    camel: "#e5b277",
    honey: "#d99c5e",
    bronze: "#b87b4a",
    coffee: "#8d5a3b",
    cocoa: "#5d3a21",
    starlight: "#dbeafe",
    nebula: "#c4b5fd",
    mint: "#a7f3d0",
    ember: "#fca5a5",
  },
  hair: {
    black: "#1c1917",
    brown: "#7c4a24",
    darkbrown: "#4a2c16",
    blonde: "#fbbf24",
    strawberry: "#fb7185",
    pink: "#f472b6",
    purple: "#a855f7",
    blue: "#60a5fa",
    teal: "#2dd4bf",
    white: "#e7e5e4",
    galaxy: "#7c3aed",
    mint: "#6ee7b7",
    crimson: "#dc2626",
    sunset: "#fb923c",
    silver: "#cbd5e1",
  },
  accent: {
    pink: "#ec4899",
    purple: "#8b5cf6",
    cyan: "#22d3ee",
    lime: "#a3e635",
    amber: "#f59e0b",
    red: "#ef4444",
    blue: "#3b82f6",
    violet: "#a78bfa",
  },
  outfit: {
    tee: "#3f3f46",
    hoodie: "#52525b",
    suit: "#27272a",
    dress: "#ec4899",
    jacket: "#1e293b",
    shirt: "#334155",
    spacesuit: "#e5e7eb",
    cape: "#7c3aed",
    kimono: "#9f1239",
    armor: "#64748b",
  },
};

export const EYES = ["round", "happy", "sleepy", "cool", "star", "wink", "galaxy", "heart", "cyber", "dizzy", "flame"];
export const BROWS = ["neutral", "soft", "furrowed", "raised", "bold", "surprised", "wavy"];
export const MOUTHS = ["smile", "open", "grin", "frown", "flat", "kiss", "tongue", "smirk", "wow", "fangs", "robot", "beam"];
export const HAIRS = ["bob", "spiky", "long", "curly", "buzz", "ponytail", "mohawk", "twintail", "afro", "bun", "braids", "flame", "waves"];
export const ACCESSORIES = ["none", "glasses", "sunglasses", "monocle", "gem", "freckles", "earrings", "eyepatch", "blush", "warpaint", "visor"];
export const HATS = ["none", "crown", "cap", "halo", "headphones", "tophat", "beanie", "astronaut", "wizard", "party", "antennae", "flowercrown"];
export const PET_KEYS = ["none", "cat", "owl", "dragon", "robot", "alien", "moon", "star", "blob", "ghost"];

export const AVATAR_DEFAULTS = {
  skin: "peach",
  eyes: "round",
  brows: "soft",
  mouth: "smile",
  hair: "bob",
  hairColor: "pink",
  accessory: "none",
  hat: "none",
  outfit: "tee",
  accent: "pink",
  pet: "none",
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function randomAvatar() {
  return {
    skin: pick(Object.keys(AVATAR_PALETTES.skin)),
    eyes: pick(EYES),
    brows: pick(BROWS),
    mouth: pick(MOUTHS),
    hair: pick(HAIRS),
    hairColor: pick(Object.keys(AVATAR_PALETTES.hair)),
    accessory: pick(ACCESSORIES),
    hat: pick(HATS),
    outfit: pick(Object.keys(AVATAR_PALETTES.outfit)),
    accent: pick(Object.keys(AVATAR_PALETTES.accent)),
    pet: pick(PET_KEYS),
  };
}

export function normalizeAvatar(cfg) {
  const c = cfg && typeof cfg === "object" ? cfg : {};
  const inList = (list, key) => Array.isArray(list) && typeof key === "string" && list.includes(key);
  const inPalette = (cat, key) => AVATAR_PALETTES[cat] && typeof key === "string" && key in AVATAR_PALETTES[cat];

  return {
    skin: inPalette("skin", c.skin) ? c.skin : AVATAR_DEFAULTS.skin,
    eyes: inList(EYES, c.eyes) ? c.eyes : AVATAR_DEFAULTS.eyes,
    brows: inList(BROWS, c.brows) ? c.brows : AVATAR_DEFAULTS.brows,
    mouth: inList(MOUTHS, c.mouth) ? c.mouth : AVATAR_DEFAULTS.mouth,
    hair: inList(HAIRS, c.hair) ? c.hair : AVATAR_DEFAULTS.hair,
    hairColor: inPalette("hair", c.hairColor) ? c.hairColor : AVATAR_DEFAULTS.hairColor,
    accessory: inList(ACCESSORIES, c.accessory) ? c.accessory : AVATAR_DEFAULTS.accessory,
    hat: inList(HATS, c.hat) ? c.hat : AVATAR_DEFAULTS.hat,
    outfit: inPalette("outfit", c.outfit) ? c.outfit : AVATAR_DEFAULTS.outfit,
    accent: inPalette("accent", c.accent) ? c.accent : AVATAR_DEFAULTS.accent,
    pet: inList(PET_KEYS, c.pet) ? c.pet : AVATAR_DEFAULTS.pet,
  };
}

export function mergeAvatar(base, override) {
  return normalizeAvatar({ ...base, ...(override || {}) });
}

const colorOf = (paletteKey, k) =>
  (AVATAR_PALETTES[paletteKey] && AVATAR_PALETTES[paletteKey][k]) ||
  Object.values(AVATAR_PALETTES[paletteKey])[0];
const skinOf = (c) => colorOf("skin", c.skin);
const hairOf = (c) => colorOf("hair", c.hairColor);
const accentOf = (c) => colorOf("accent", c.accent);
const outfitOf = (c) => colorOf("outfit", c.outfit);

// --- Mascotas: arte vectorial dibujado por acento (nunca emojis) ---
const petSlot = (bg = "rgba(0,0,0,0.42)") =>
  `<circle cx="83" cy="18" r="13" fill="${bg}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;

function petCat(accent) {
  return petSlot() +
    `<path d="M74 9 L79 2 L86 9 Z" fill="${accent}"/>` +
    `<path d="M86 9 L81 2 L88 9 Z" fill="${accent}"/>` +
    `<circle cx="83" cy="19" r="7.5" fill="${accent}"/>` +
    `<circle cx="80.5" cy="18" r="1.1" fill="#18181b"/>` +
    `<circle cx="85.5" cy="18" r="1.1" fill="#18181b"/>` +
    `<path d="M81 21 q2 1.5 4 0" stroke="#18181b" stroke-width="0.8" fill="none" stroke-linecap="round"/>` +
    `<path d="M76 20 h7 M89 20 h7 M77 22 l7 -1 M90 22 l-7 -1" stroke="#fff" stroke-width="0.6" opacity="0.7"/>` +
    `<path d="M89 23 q5 3 4 -6" stroke="${accent}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
}

function petOwl(accent) {
  const body = "#374151";
  return petSlot() +
    `<circle cx="83" cy="19" r="8" fill="${body}"/>` +
    `<circle cx="83" cy="19" r="6" fill="${accent}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>` +
    `<path d="M77 13 L80 6 L83 13 Z" fill="${body}"/>` +
    `<path d="M83 13 L86 6 L89 13 Z" fill="${body}"/>` +
    `<circle cx="79" cy="19" r="2.8" fill="#fff"/>` +
    `<circle cx="87" cy="19" r="2.8" fill="#fff"/>` +
    `<circle cx="79" cy="19" r="1" fill="#18181b"/>` +
    `<circle cx="87" cy="19" r="1" fill="#18181b"/>` +
    `<path d="M81 23 L85 23 L83 26 Z" fill="#fb923c"/>` +
    `<path d="M75 20 q-4 3 -4 -4 q0 7 6 9 Z" fill="${body}" opacity="0.6"/>` +
    `<path d="M91 20 q4 3 4 -4 q0 7-6 9 Z" fill="${body}" opacity="0.6"/>`;
}

function petDragon(accent) {
  const dark = "#145a2a";
  return petSlot() +
    `<circle cx="83" cy="19" r="7.2" fill="#16a34a"/>` +
    `<path d="M77 13 L80 6 L83 11 Z" fill="${dark}"/>` +
    `<path d="M83 11 L86 6 L89 13 Z" fill="${dark}"/>` +
    `<path d="M75 20 q-6 -2 -4 -10 q2 1 4 4 Z" fill="${dark}" opacity="0.7"/>` +
    `<path d="M91 20 q6 -2 4 -10 q-2 1-4 4 Z" fill="${dark}" opacity="0.7"/>` +
    `<circle cx="85" cy="19" r="2" fill="#fff"/>` +
    `<circle cx="85.8" cy="18.8" r="1" fill="#18181b"/>` +
    `<path d="M89 25 q5 1 4 -4" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function petRobot(accent) {
  return petSlot("rgba(30,30,42,0.56)") +
    `<rect x="74" y="10" width="18" height="16" rx="3" fill="#9ca3af" stroke="#6b7280" stroke-width="0.6"/>` +
    `<line x1="83" y1="6" x2="83" y2="10" stroke="#d1d5db" stroke-width="1.2"/>` +
    `<circle cx="83" cy="5" r="2.2" class="pet-led" style="fill:${accent}"/>` +
    `<rect x="78.5" y="15" width="3.5" height="2.5" rx="0.5" fill="${accent}"/>` +
    `<rect x="88" y="15" width="3.5" height="2.5" rx="0.5" fill="${accent}"/>` +
    `<path d="M79 20 h8 M79 22 h8 M79 24 h8" stroke="#18181b" stroke-width="0.9"/>` +
    `<line x1="75" y1="13" x2="71" y2="11" stroke="#9ca3af" stroke-width="1"/>` +
    `<line x1="91" y1="13" x2="95" y2="11" stroke="#9ca3af" stroke-width="1"/>`;
}

function petAlien(accent) {
  return petSlot() +
    `<ellipse cx="83" cy="19" rx="7.5" ry="8.5" fill="#22d3ee"/>` +
    `<line x1="77" y1="11" x2="80" y2="5" stroke="#94a3b8" stroke-width="1.4"/>` +
    `<line x1="89" y1="11" x2="86" y2="5" stroke="#94a3b8" stroke-width="1.4"/>` +
    `<circle cx="80" cy="4" r="1.2" fill="${accent}"/>` +
    `<circle cx="86" cy="4" r="1.2" fill="${accent}"/>` +
    `<ellipse cx="79" cy="20" rx="2.2" ry="3.2" fill="#18181b"/>` +
    `<ellipse cx="87" cy="20" rx="2.2" ry="3.2" fill="#18181b"/>` +
    `<path d="M80 25 q3 2 6 0" stroke="#18181b" stroke-width="1" fill="none" stroke-linecap="round"/>`;
}

function petMoon() {
  const bg = "rgba(15,22,38,0.58)";
  const crater = (cx, cy, r, op) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" opacity="${op}"/>`;
  return petSlot(bg) +
    `<circle cx="83" cy="19" r="10" fill="#f1f5f9"/>` +
    `<circle cx="91" cy="15" r="10" fill="${bg}"/>` +
    `<circle cx="89" cy="17" r="10" fill="#f1f5f9"/>` +
    `<circle cx="85" cy="17" r="3.2" fill="#fff" opacity="0.7"/>` +
    crater(79, 16, 1.6, 0.6) + crater(88, 22, 1.3, 0.5) + crater(81, 24, 1, 0.55);
}

function petStar(accent) {
  const points = (a, r1, r2) => {
    let o = "", i = "", a1 = a, a2 = a + 0.6283;
    for (let k = 0; k < 5; k++) {
      o += `${83 + Math.cos(a1) * r1},${19 + Math.sin(a1) * r1} `;
      i += `${83 + Math.cos(a2) * r2},${19 + Math.sin(a2) * r2} `;
      a1 += 1.2566; a2 += 1.2566;
    }
    return o + i;
  };
  return petSlot() +
    `<polygon points="${points(0, 11, 5.5)}" fill="${accent}"/>` +
    `<polygon points="${points(0.314, 7, 3.2)}" fill="#fff"/>` +
    `<circle cx="83" cy="19" r="2" fill="#fff"/>`;
}

function petBlob(accent) {
  return petSlot() +
    `<path d="M76 20 q4 -8 10 -2 q6 4 4 10 q-2 6-8 6 q-8 2-10-4 q-2-6 4-10" fill="${accent}"/>` +
    `<circle cx="80" cy="19" r="5" fill="${accent}" opacity="0.9"/>` +
    `<circle cx="77" cy="18" r="1.3" fill="#18181b"/>` +
    `<circle cx="85" cy="21" r="1.3" fill="#18181b"/>` +
    `<path d="M77 23 q4 2 8 0" stroke="#18181b" stroke-width="0.8" fill="none" stroke-linecap="round"/>`;
}

function petGhost(accent) {
  return petSlot() +
    `<path d="M76 10 q7 -2 14 0 q5 4 0 9 q-3 4-7 5 q-4 1-7 -2 q-3-3-3-6" fill="#f8fafc" opacity="0.92" stroke="${accent}" stroke-width="1"/>` +
    `<circle cx="79" cy="16" r="1.8" fill="#18181b"/>` +
    `<circle cx="87" cy="16" r="1.8" fill="#18181b"/>` +
    `<path d="M79 21 q4 2 6 0" stroke="#18181b" stroke-width="1" fill="none" stroke-linecap="round"/>`;
}

export const PETS = {
  none: null,
  cat: petCat,
  owl: petOwl,
  dragon: petDragon,
  robot: petRobot,
  alien: petAlien,
  moon: petMoon,
  star: petStar,
  blob: petBlob,
  ghost: petGhost,
};

function pet(c) {
  const draw = PETS[c.pet];
  return typeof draw === "function" ? draw(accentOf(c)) : "";
}

// --- Piezas de dibujo (resuelven solo claves de catálogo → nunca datos libres) ---
function body(c) {
  const color = outfitOf(c);
  const skin = skinOf(c);
  const base =
    `<rect x="20" y="74" width="60" height="22" rx="11" fill="${color}"/>` +
    `<rect x="42" y="66" width="16" height="12" rx="5" fill="${skin}"/>`;

  if (c.outfit === "hoodie") return base + `<path d="M50 64 a12 12 0 0 1 12 12 h-24 a12 12 0 0 1 12-12z" fill="${color}"/>`;
  if (c.outfit === "suit") return base + `<path d="M45 68 l5 -8 l5 8 l-5 7 z" fill="#f4f4f5"/>` + `<rect x="48" y="76" width="4" height="16" fill="#f4f4f5"/>`;
  if (c.outfit === "dress") return base + `<path d="M34 80 L40 96 L60 96 L66 80 Z" fill="${color}"/>`;
  if (c.outfit === "jacket") return base + `<path d="M50 74 v22" stroke="#cbd5e1" stroke-width="2"/>`;
  if (c.outfit === "shirt") return base + `<path d="M44 70 l6 -4 l6 4 v8 h-12 z" fill="#94a3b8"/>`;
  if (c.outfit === "spacesuit") {
    return base + `<rect x="34" y="68" width="32" height="4" rx="2" fill="#cbd5e1"/>` + `<rect x="47" y="60" width="6" height="12" rx="3" fill="#cbd5e1"/>`;
  }
  if (c.outfit === "cape") {
    return base + `<path d="M20 72 l-12 -4 v18 l12 -8 Z" fill="${color}" opacity="0.85"/>` + `<path d="M80 72 l12 -4 v18 l-12 -8 Z" fill="${color}" opacity="0.85"/>`;
  }
  if (c.outfit === "kimono") {
    return base + `<path d="M30 72 l5 -10 l12 4 l7 -12 l6 12 l12 -4 l5 10 l-17 2 z" fill="${color}"/>`;
  }
  if (c.outfit === "armor") {
    return base + `<rect x="26" y="60" width="48" height="14" rx="7" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>` + `<rect x="33" y="62" width="34" height="10" rx="5" fill="#64748b" opacity="0.7"/>`;
  }
  return base;
}

function hairBack(c) {
  const color = hairOf(c);
  if (c.hair === "long") return `<rect x="17" y="44" width="13" height="36" rx="6" fill="${color}"/>` + `<rect x="70" y="44" width="13" height="36" rx="6" fill="${color}"/>`;
  if (c.hair === "ponytail") return `<circle cx="80" cy="26" r="9" fill="${color}"/>` + `<rect x="72" y="30" width="8" height="26" rx="4" fill="${color}"/>`;
  if (c.hair === "twintail") return `<circle cx="20" cy="26" r="9" fill="${color}"/>` + `<circle cx="80" cy="26" r="9" fill="${color}"/>`;
  if (c.hair === "curly") return `<circle cx="22" cy="36" r="8" fill="${color}"/>` + `<circle cx="78" cy="36" r="8" fill="${color}"/>`;
  return "";
}

function hairFront(c) {
  const color = hairOf(c);
  switch (c.hair) {
    case "spiky":
      return `<path d="M26 48 L32 22 L40 32 L46 16 L52 30 L58 18 L64 34 L72 24 L74 48 Z" fill="${color}"/>`;
    case "bob":
      return `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>` + `<path d="M20 48 v10 a8 8 0 0 0 14 4 v-14 z" fill="${color}"/>` + `<path d="M80 48 v10 a8 8 0 0 1-14 4 v-14 z" fill="${color}"/>`;
    case "long":
      return `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>`;
    case "curly":
      return `<circle cx="28" cy="34" r="8" fill="${color}"/>` + `<circle cx="38" cy="27" r="9" fill="${color}"/>` + `<circle cx="50" cy="25" r="9" fill="${color}"/>` + `<circle cx="62" cy="27" r="9" fill="${color}"/>` + `<circle cx="72" cy="34" r="8" fill="${color}"/>` + `<path d="M24 40 a26 26 0 0 1 52 0 v6 h-52 z" fill="${color}"/>`;
    case "buzz":
      return `<path d="M24 46 a26 26 0 0 1 52 0 v4 h-52 z" fill="${color}"/>`;
    case "ponytail":
      return `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>`;
    case "mohawk":
      return `<path d="M38 48 L35 22 L43 30 L46 14 L50 26 L54 14 L57 30 L65 22 L62 48 Z" fill="${color}"/>`;
    case "twintail":
      return `<path d="M18 46 a32 32 0 0 1 64 0 l-8 0 a24 24 0 0 0-48 0 z" fill="${color}"/>`;
    case "afro":
      return `<path d="M40 30 a10 10 0 0 1 20 0 a10 10 0 0 1 0 14 a10 10 0 0 1-20 0 a10 10 0 0 1 0-14" fill="${color}"/>` + `<circle cx="50" cy="46" r="12" fill="${color}"/>`;
    case "bun":
      return `<circle cx="50" cy="16" r="11" fill="${color}"/>` + `<path d="M28 46 a22 22 0 0 1 44 0 v6 h-44 z" fill="${color}"/>`;
    case "braids":
      return `<path d="M24 32 c-3 -5 2 -12 8 -12 c6 0 9 5 7 11 c-2 6-8 9-13 6" fill="${color}"/>` + `<path d="M78 36 c-8 -4-12 1-8 10 c4 11 12 14 19 9" fill="${color}"/>` + `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>`;
    case "flame":
      return `<path d="M30 46 L35 12 L42 34 L48 10 L52 32 L58 12 L70 46 Z" fill="${color}"/>`;
    case "waves":
      return `<path d="M20 48 a30 30 0 0 1 60 0 q-5 5-9 0 q-4-5-9 0 q-5 5-10 0 q-5-5-10 0" fill="${color}"/>`;
    default:
      return "";
  }
}

function eyes(c) {
  switch (c.eyes) {
    case "happy":
      return `<path d="M32 50 q6 6 12 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>` + `<path d="M56 50 q6 6 12 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "sleepy":
      return `<line x1="32" y1="52" x2="44" y2="52" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>` + `<line x1="56" y1="52" x2="68" y2="52" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`;
    case "cool":
      return `<line x1="30" y1="50" x2="46" y2="48" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>` + `<line x1="54" y1="48" x2="70" y2="50" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`;
    case "star": {
      const s = (x) => `<path d="M${x} 44 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" fill="#18181b"/>`;
      return s(38) + s(58);
    }
    case "wink":
      return `<circle cx="38" cy="51" r="5.5" fill="#18181b"/>` + `<line x1="56" y1="51" x2="68" y2="51" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`;
    case "galaxy": {
      const g = (x) => `<circle cx="${x}" cy="51.5" r="5.5" fill="#312e81"/><circle cx="${x}" cy="51.5" r="3" fill="#7c3aed"/><circle cx="${x}" cy="51.5" r="1.4" fill="#fff"/>`;
      return g(38) + g(58);
    }
    case "heart": {
      const h = (x) => `<path d="M${x} 46 c-2 -2-5-1-5 2 c0 2.5 4 4 5 4.2 c1-0.2 5-1.7 5-4.2 c0-3-3-4-5-2" fill="#fb126e"/>`;
      return h(34) + h(54);
    }
    case "cyber": {
      const a = accentOf(c);
      return `<rect x="30" y="48.5" width="16" height="3" rx="1.5" fill="${a}"/><rect x="54" y="48.5" width="16" height="3" rx="1.5" fill="${a}"/><circle cx="42" cy="50" r="1.4" fill="#fff"/><circle cx="62" cy="50" r="1.4" fill="#fff"/>`;
    }
        case "dizzy": {
      const d = (x) => `<polygon points="${x-3.2},43.8 ${x+3.2},46.2 ${x-3.2},48.6}" fill="#18181b"/>` + `<polygon points="${x+3.2},43.8 ${x-3.2},48.6 ${x+3.2},46.2}" fill="#18181b"/>`;
      return d(38) + d(58);
    }
    case "flame":
      return `<path d="M34 44 q3 5 6 0 q3 6 6 0 q-1 4 0 6 q3 4 6 0" stroke="#f97316" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + `<path d="M58 44 q3 5 6 0 q3 6 6 0 q-1 4 0 6 q3 4 6 0" stroke="#f97316" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    default:
      return `<circle cx="38" cy="51" r="5" fill="#18181b"/>` + `<circle cx="38" cy="49.5" r="1.8" fill="#fff"/>` + `<circle cx="62" cy="51" r="5" fill="#18181b"/>` + `<circle cx="62" cy="49.5" r="1.8" fill="#fff"/>`;
  }
}

function brows(c) {
  if (c.brows === "bold") return `<path d="M31 36 l8 0 M58 36 l8 0" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>`;
  if (c.brows === "surprised") return `<path d="M31 34 l8 0 M58 34 l8 0" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`;
  if (c.brows === "wavy") return `<path d="M30 38 q3 -3 6 0 q3 3 6 0 q3-3 6 0" stroke="#18181b" stroke-width="2.4" fill="none"/>`;
  const y = c.brows === "furrowed" ? 40 : c.brows === "raised" ? 34 : 38;
  const shape = c.brows === "furrowed" ? "l6 5 l6 -5" : "l6 -5 l6 5";
  return `<path d="M31 ${y} ${shape}" stroke="#18181b" stroke-width="3.2" fill="none" stroke-linecap="round"/>` + `<path d="M69 ${y} ${shape}" stroke="#18181b" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
}

function mouth(c) {
  if (c.mouth === "open") return `<ellipse cx="50" cy="60" rx="7" ry="5" fill="#18181b"/>`;
  if (c.mouth === "grin") return `<path d="M43 58 q7 6 14 0" stroke="#18181b" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + `<path d="M43 58 l14 0 v8 h-14 z" fill="#5a4a42"/>`;
  if (c.mouth === "frown") return `<path d="M43 64 q7 -6 14 0" stroke="#18181b" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (c.mouth === "flat") return `<line x1="40" y1="60" x2="60" y2="60" stroke="#18181b" stroke-width="2"/>`;
  if (c.mouth === "kiss") return `<circle cx="46" cy="59" r="1.2" fill="#ec4899"/><circle cx="54" cy="59" r="1.2" fill="#ec4899"/>` + `<path d="M46 62 C48 65 52 65 54 62" stroke="#ec4899" stroke-width="1.4" fill="none"/>`;
  if (c.mouth === "tongue") return `<path d="M43 58 q7 6 14 0 q-3 6-7 6 q-4 0-7-6z" fill="#fb7185"/>`;
  if (c.mouth === "smirk") return `<path d="M48 59 q5 3 10 0" stroke="#18181b" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (c.mouth === "wow") return `<ellipse cx="50" cy="58" rx="6" ry="5" fill="#18181b"/>`;
  if (c.mouth === "fangs") return `<path d="M44 57 l6 5 l6 -5" stroke="#18181b" stroke-width="1.4" fill="none"/>` + `<path d="M44 59 l6 6 l6 -6" stroke="#e5e7eb" stroke-width="3" fill="none"/>`;
  if (c.mouth === "robot") return `<rect x="43" y="57" width="14" height="6" rx="1.5" fill="#18181b"/>` + `<path d="M44 59 h6 M58 59 h6 M44 61 h6 M58 61 h6" stroke="#0f172a" stroke-width="0.7"/>`;
  if (c.mouth === "beam") return `<path d="M40 56 Q50 62 60 56" stroke="#18181b" stroke-width="1.2" fill="none"/>` + `<path d="M40 58 Q50 64 60 58" stroke="#18181b" stroke-width="1.2" fill="none"/>`;
  return `<path d="M43 58 q7 5 14 0" stroke="#18181b" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
}

function accessory(c) {
  const a = accentOf(c);
  switch (c.accessory) {
    case "glasses":
      return `<rect x="29" y="46" width="10" height="6" rx="3" fill="none" stroke="#94a3b8" stroke-width="1.5"/>` + `<rect x="61" y="46" width="10" height="6" rx="3" fill="none" stroke="#94a3b8" stroke-width="1.5"/>` + `<line x1="39" y1="49" x2="61" y2="49" stroke="#94a3b8" stroke-width="1.5"/>`;
    case "sunglasses":
      return `<rect x="27" y="45" width="12" height="8" rx="2" fill="rgba(0,0,0,0.55)" stroke="#18181b" stroke-width="1"/>` + `<rect x="61" y="45" width="12" height="8" rx="2" fill="rgba(0,0,0,0.55)" stroke="#18181b" stroke-width="1"/>` + `<line x1="39" y1="49" x2="61" y2="49" stroke="#18181b" stroke-width="2"/>`;
    case "monocle":
      return `<circle cx="62" cy="52" r="4" fill="none" stroke="#d4b483" stroke-width="1.6"/>` + `<line x1="66" y1="52" x2="74" y2="52" stroke="#d4b483" stroke-width="1.4"/>`;
    case "gem":
      return `<path d="M50 26 l7 9 -7 9 -7-9z" fill="${a}" stroke="#fbbf24" stroke-width="1.5"/>` + `<circle cx="50" cy="34" r="1.5" fill="#fff" opacity="0.8"/>`;
    case "freckles":
      return `<circle cx="34" cy="58" r="1.3" fill="#b45309" opacity="0.55"/>` + `<circle cx="39" cy="60" r="1.3" fill="#b45309" opacity="0.55"/>` + `<circle cx="35" cy="62" r="1.1" fill="#b45309" opacity="0.5"/>` + `<circle cx="66" cy="58" r="1.3" fill="#b45309" opacity="0.55"/>` + `<circle cx="61" cy="60" r="1.3" fill="#b45309" opacity="0.55"/>` + `<circle cx="65" cy="62" r="1.1" fill="#b45309" opacity="0.5"/>`;
    case "earrings":
      return `<circle cx="22" cy="52" r="1.6" fill="${a}"/>` + `<circle cx="78" cy="52" r="1.6" fill="${a}"/>`;
    case "eyepatch":
      return `<rect x="60" y="44" width="19" height="10" rx="2" fill="#18181b"/>` + `<line x1="61" y1="48" x2="78" y2="48" stroke="#fff" stroke-width="0.8" opacity="0.35"/>`;
    case "blush":
      return `<ellipse cx="31" cy="60" rx="3" ry="1.6" fill="#fb7185" opacity="0.5"/>` + `<ellipse cx="69" cy="60" rx="3" ry="1.6" fill="#fb7185" opacity="0.5"/>`;
    case "warpaint":
      return `<path d="M28 46 l10 8 l2 -2 l-10 -8z" fill="${a}"/>` + `<path d="M72 46 l-10 8 l-2 -2 l10 -8z" fill="${a}"/>`;
    case "visor":
      return `<rect x="28" y="46" width="44" height="10" rx="5" fill="rgba(34,211,238,0.5)" stroke="${a}" stroke-width="1"/>`;
    default:
      return "";
  }
}

function hat(c) {
  const color = hairOf(c);
  switch (c.hat) {
    case "crown":
      return `<path d="M28 46 l3 -16 8 8 11 -12 11 12 8 -8 3 16 z" fill="#f59e0b"/>` + `<rect x="27" y="43" width="46" height="6" rx="2" fill="#f59e0b"/>` + `<circle cx="40" cy="40" r="2" fill="#ec4899"/>` + `<circle cx="50" cy="34" r="2" fill="#22d3ee"/>` + `<circle cx="60" cy="40" r="2" fill="#a3e635"/>`;
    case "cap":
      return `<path d="M22 46 a28 28 0 0 1 56 0 z" fill="#18181b"/>` + `<rect x="44" y="20" width="12" height="16" rx="6" fill="#ef4444"/>` + `<rect x="46" y="44" width="28" height="7" rx="3.5" fill="#18181b"/>`;
    case "halo":
      return `<ellipse cx="50" cy="21" rx="17" ry="5.5" fill="none" stroke="#fde047" stroke-width="4"/>`;
    case "headphones":
      return `<path d="M22 48 a28 28 0 0 1 56 0" stroke="#e4e4e7" stroke-width="6" fill="none" stroke-linecap="round"/>` + `<rect x="17" y="46" width="10" height="14" rx="4" fill="#ec4899"/>` + `<rect x="73" y="46" width="10" height="14" rx="4" fill="#ec4899"/>`;
    case "tophat":
      return `<rect x="32" y="16" width="36" height="28" rx="4" fill="#18181b"/>` + `<rect x="24" y="42" width="52" height="6" rx="3" fill="#18181b"/>`;
    case "beanie":
      return `<path d="M24 46 a26 26 0 0 1 52 0 z" fill="${color}"/>` + `<rect x="22" y="42" width="56" height="6" rx="3" fill="${color}"/>` + `<circle cx="50" cy="22" r="5" fill="#fbbf24"/>`;
    case "astronaut":
      return `<rect x="16" y="12" width="68" height="32" rx="34" fill="rgba(229,231,235,0.55)" stroke="#cbd5e1" stroke-width="1"/>` + `<path d="M30 40 a20 20 0 0 1 40 0 v2 a10 10 0 0 0-40 0z" fill="rgba(229,231,235,0.25)"/>`;
    case "wizard":
      return `<path d="M35 44 l15 -22 l15 22 z" fill="#7c3aed"/>` + `<circle cx="50" cy="28" r="2.5" fill="#fbbf24"/>` + `<rect x="22" y="44" width="56" height="6" rx="3" fill="#7c3aed"/>`;
    case "party":
      return `<polygon points="38,42 50,10 62,42" fill="#ef4444"/>` + `<polygon points="44,42 47,18 50,42" fill="#fbbf24"/>` + `<polygon points="50,18 53,42 47,42" fill="#22d3ee"/>` + `<circle cx="50" cy="44" r="4" fill="#fff"/>` + `<rect x="38" y="48" width="24" height="5" rx="2.5" fill="#18181b"/>`;
    case "antennae":
      return `<line x1="46" y1="9" x2="44" y2="3" stroke="#94a3b8" stroke-width="1.4"/>` + `<circle cx="44" cy="3" r="1.4" fill="#ec4899"/>` + `<line x1="54" y1="9" x2="56" y2="3" stroke="#94a3b8" stroke-width="1.4"/>` + `<circle cx="56" cy="3" r="1.4" fill="#ec4899"/>`;
    case "flowercrown":
      return `<rect x="24" y="42" width="52" height="5" rx="2.5" fill="#22c55e"/>` + `<circle cx="34" cy="43" r="2.2" fill="#a3e635"/>` + `<circle cx="44" cy="40" r="1.8" fill="#fb7185"/>` + `<circle cx="56" cy="40" r="1.8" fill="#fbbf24"/>` + `<circle cx="66" cy="43" r="2.2" fill="#a3e635"/>` + `<circle cx="76" cy="43" r="1.5" fill="#fb7185"/>`;
    default:
      return "";
  }
}

// --- Render + cache LRU (determinístico: mismo config → mismo SVG) ---
const CACHE_MAX = 256;
const cache = new Map();

function buildAvatar(cfg) {
  const c = normalizeAvatar(cfg);
  const accent = accentOf(c);
  const skin = skinOf(c);

  const parts = [
    `<circle cx="50" cy="50" r="48" fill="#101014"/>`,
    `<circle cx="50" cy="50" r="45" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>`,
    pet(c),
    body(c),
    hairBack(c),
    `<circle cx="20" cy="52" r="6.5" fill="${skin}"/>`,
    `<circle cx="80" cy="52" r="6.5" fill="${skin}"/>`,
    `<circle cx="50" cy="52" r="32" fill="${skin}/>`,
    eyes(c),
    brows(c),
    mouth(c),
    accessory(c),
    hairFront(c),
    hat(c),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${parts.join("")}</svg>`;
}

export function renderAvatar(cfg) {
  const normalized = normalizeAvatar(cfg);
  const key = JSON.stringify(normalized);
  if (cache.has(key)) {
    const svg = cache.get(key);
    cache.delete(key);
    cache.set(key, svg); // refresca orden LRU
    return svg;
  }
  const svg = buildAvatar(normalized);
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, svg);
  return svg;
}

// Vacía la caché (útil en tests o tras cambiar catálogos).
export function clearAvatarCache() {
  cache.clear();
}





