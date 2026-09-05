// ---------------------------------------------------------------------------
// Sistema de AVATARES procedentales (sin imágenes externas).
// El config del usuario solo contiene CLAVES; cada clave se resuelve contra
// los catálogos de abajo, así que ningún dato libre llega al SVG.
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
  },
};

export const EYES = [
  "round",
  "happy",
  "sleepy",
  "cool",
  "star",
  "wink",
];
export const BROWS = ["neutral", "soft", "furrowed", "raised"];
export const MOUTHS = [
  "smile",
  "open",
  "grin",
  "frown",
  "flat",
  "kiss",
  "tongue",
];
export const HAIRS = [
  "bob",
  "spiky",
  "long",
  "curly",
  "buzz",
  "ponytail",
  "mohawk",
  "twintail",
];
export const ACCESSORIES = [
  "none",
  "glasses",
  "sunglasses",
  "monocle",
  "gem",
  "freckles",
];
export const HATS = [
  "none",
  "crown",
  "cap",
  "halo",
  "headphones",
  "tophat",
  "beanie",
];
export const PETS = {
  none: null,
  cat: "🐱",
  owl: "🦉",
  star: "⭐",
  blob: "👾",
  ghost: "👻",
};

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
const pickKey = (obj) => {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
};

// Genera un avatar aleatorio válido.
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
    pet: pick(Object.keys(PETS)),
  };
}

// Garantiza un config correcto: cualquier clave desconocida cae al valor por
// defecto. Esto es lo que evita inyecciones de contenido en el SVG.
export function normalizeAvatar(cfg) {
  const c = cfg && typeof cfg === "object" ? cfg : {};
  const inList = (list, key) =>
    Array.isArray(list) && typeof key === "string" && list.includes(key);
  const skinKeys = Object.keys(AVATAR_PALETTES.skin);
  const hairKeys = Object.keys(AVATAR_PALETTES.hair);
  const accentKeys = Object.keys(AVATAR_PALETTES.accent);
  const outfitKeys = Object.keys(AVATAR_PALETTES.outfit);

  return {
    skin: inList(skinKeys, c.skin) ? c.skin : AVATAR_DEFAULTS.skin,
    eyes: inList(EYES, c.eyes) ? c.eyes : AVATAR_DEFAULTS.eyes,
    brows: inList(BROWS, c.brows) ? c.brows : AVATAR_DEFAULTS.brows,
    mouth: inList(MOUTHS, c.mouth) ? c.mouth : AVATAR_DEFAULTS.mouth,
    hair: inList(HAIRS, c.hair) ? c.hair : AVATAR_DEFAULTS.hair,
    hairColor: inList(hairKeys, c.hairColor)
      ? c.hairColor
      : AVATAR_DEFAULTS.hairColor,
    accessory: inList(ACCESSORIES, c.accessory)
      ? c.accessory
      : AVATAR_DEFAULTS.accessory,
    hat: inList(HATS, c.hat) ? c.hat : AVATAR_DEFAULTS.hat,
    outfit: inList(outfitKeys, c.outfit) ? c.outfit : AVATAR_DEFAULTS.outfit,
    accent: inList(accentKeys, c.accent) ? c.accent : AVATAR_DEFAULTS.accent,
    pet: inList(Object.keys(PETS), c.pet) ? c.pet : AVATAR_DEFAULTS.pet,
  };
}

// Une dos configs (el override gana sólo en los campos presentes).
export function mergeAvatar(base, override) {
  return normalizeAvatar({ ...base, ...(override || {}) });
}

// --- Resolución de colores ---
const colorOf = (paletteKey, k) =>
  (AVATAR_PALETTES[paletteKey] && AVATAR_PALETTES[paletteKey][k]) ||
  Object.values(AVATAR_PALETTES[paletteKey])[0];
const skinOf = (c) => colorOf("skin", c.skin);
const hairOf = (c) => colorOf("hair", c.hairColor);
const accentOf = (c) => colorOf("accent", c.accent);
const outfitOf = (c) => colorOf("outfit", c.outfit);

// --- Piezas de dibujo (todas inyectan valores del catálogo, nunca datos libres) ---
function body(c) {
  const color = outfitOf(c);
  const skin = skinOf(c);
  const base =
    `<rect x="20" y="74" width="60" height="22" rx="11" fill="${color}"/>` +
    `<rect x="42" y="66" width="16" height="12" rx="5" fill="${skin}"/>`;
  if (c.outfit === "hoodie") {
    return (
      base +
      `<path d="M50 64 a12 12 0 0 1 12 12 h-24 a12 12 0 0 1 12-12z" fill="${color}"/>`
    );
  }
  if (c.outfit === "suit") {
    return (
      base +
      `<path d="M45 68 l5 -8 l5 8 l-5 7 z" fill="#f4f4f5"/>` +
      `<rect x="48" y="76" width="4" height="16" fill="#f4f4f5"/>`
    );
  }
  if (c.outfit === "dress") {
    return base + `<path d="M34 80 L40 96 L60 96 L66 80 Z" fill="${color}"/>`;
  }
  if (c.outfit === "jacket") {
    return base + `<path d="M50 74 v22" stroke="#cbd5e1" stroke-width="2"/>`;
  }
  if (c.outfit === "shirt") {
    return base + `<path d="M44 70 l6 -4 l6 4 v8 h-12 z" fill="#94a3b8"/>`;
  }
  return base;
}

function hairBack(c) {
  const color = hairOf(c);
  if (c.hair === "long") {
    return (
      `<rect x="17" y="44" width="13" height="36" rx="6" fill="${color}"/>` +
      `<rect x="70" y="44" width="13" height="36" rx="6" fill="${color}"/>`
    );
  }
  if (c.hair === "ponytail") {
    return (
      `<circle cx="80" cy="26" r="9" fill="${color}"/>` +
      `<rect x="72" y="30" width="8" height="26" rx="4" fill="${color}"/>`
    );
  }
  if (c.hair === "twintail") {
    return (
      `<circle cx="20" cy="26" r="9" fill="${color}"/>` +
      `<circle cx="80" cy="26" r="9" fill="${color}"/>`
    );
  }
  if (c.hair === "curly") {
    return (
      `<circle cx="22" cy="36" r="8" fill="${color}"/>` +
      `<circle cx="78" cy="36" r="8" fill="${color}"/>`
    );
  }
  return "";
}
function hairFront(c) {
  const color = hairOf(c);
  switch (c.hair) {
    case "spiky":
      return `<path d="M26 48 L32 22 L40 32 L46 16 L52 30 L58 18 L64 34 L72 24 L74 48 Z" fill="${color}"/>`;
    case "bob":
      return (
        `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>` +
        `<path d="M20 48 v10 a8 8 0 0 0 14 4 v-14 z" fill="${color}"/>` +
        `<path d="M80 48 v10 a8 8 0 0 1 -14 4 v-14 z" fill="${color}"/>`
      );
    case "long":
      return `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>`;
    case "curly":
      return (
        `<circle cx="28" cy="34" r="8" fill="${color}"/>` +
        `<circle cx="38" cy="27" r="9" fill="${color}"/>` +
        `<circle cx="50" cy="25" r="9" fill="${color}"/>` +
        `<circle cx="62" cy="27" r="9" fill="${color}"/>` +
        `<circle cx="72" cy="34" r="8" fill="${color}"/>` +
        `<path d="M24 40 a26 26 0 0 1 52 0 v6 h-52 z" fill="${color}"/>`
      );
    case "buzz":
      return `<path d="M24 46 a26 26 0 0 1 52 0 v4 h-52 z" fill="${color}"/>`;
    case "ponytail":
      return `<path d="M20 48 a30 30 0 0 1 60 0 v6 h-60 z" fill="${color}"/>`;
    case "mohawk":
      return `<path d="M38 48 L35 22 L43 30 L46 14 L50 26 L54 14 L57 30 L65 22 L62 48 Z" fill="${color}"/>`;
    case "twintail":
      return `<path d="M18 46 a32 32 0 0 1 64 0 l-8 0 a24 24 0 0 0 -48 0 z" fill="${color}"/>`;
    default:
      return "";
  }
}

function eyes(c) {
  switch (c.eyes) {
    case "happy":
      return (
        `<path d="M32 50 q6 6 12 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<path d="M56 50 q6 6 12 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>`
      );
    case "sleepy":
      return (
        `<line x1="32" y1="52" x2="44" y2="52" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="56" y1="52" x2="68" y2="52" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`
      );
    case "cool":
      return (
        `<line x1="30" y1="50" x2="46" y2="48" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="54" y1="48" x2="70" y2="50" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`
      );
    case "star": {
      const star = (x) =>
        `<path d="M${x} 44 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 z" fill="#18181b"/>`;
      return star(38) + star(58);
    }
    case "wink":
      return (
        `<circle cx="38" cy="51" r="5.5" fill="#18181b"/>` +
        `<line x1="56" y1="51" x2="68" y2="51" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`
      );
    default:
      return (
        `<circle cx="38" cy="51" r="5" fill="#18181b"/>` +
        `<circle cx="38" cy="49.5" r="1.8" fill="#fff"/>` +
        `<circle cx="62" cy="51" r="5" fill="#18181b"/>` +
        `<circle cx="62" cy="49.5" r="1.8" fill="#fff"/>`
      );
  }
}

function brows(c) {
  const y = c.brows === "furrowed" ? 40 : c.brows === "raised" ? 34 : 38;
  const shape = c.brows === "furrowed" ? "l6 5 l6 -5" : "l6 -5 l6 5";
  return (
    `<path d="M31 ${y} ${shape}" stroke="#18181b" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M57 ${y} ${shape}" stroke="#18181b" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
  );
}

function mouth(c) {
  switch (c.mouth) {
    case "open":
      return `<ellipse cx="50" cy="66" rx="7" ry="6" fill="#7f1d1d"/>`;
    case "grin":
      return (
        `<rect x="42" y="61" width="16" height="8" rx="3" fill="#fff" stroke="#18181b" stroke-width="1.5"/>` +
        `<line x1="50" y1="61" x2="50" y2="69" stroke="#18181b" stroke-width="1.2"/>`
      );
    case "frown":
      return `<path d="M42 68 q8 -6 16 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "flat":
      return `<line x1="43" y1="66" x2="57" y2="66" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>`;
    case "kiss":
      return `<circle cx="50" cy="66" r="4" fill="#be123c"/>`;
    case "tongue":
      return `<path d="M43 64 q7 -5 14 0 q0 5 -7 7 q-7 -2 -7 -7z" fill="#be123c"/>`;
    default:
      return `<path d="M42 64 q8 8 16 0" stroke="#18181b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
}
function accessory(c) {
  const accent = accentOf(c);
  switch (c.accessory) {
    case "glasses":
      return (
        `<circle cx="38" cy="51" r="8" fill="rgba(0,0,0,0.15)" stroke="#292524" stroke-width="2.5"/>` +
        `<circle cx="62" cy="51" r="8" fill="rgba(0,0,0,0.15)" stroke="#292524" stroke-width="2.5"/>` +
        `<line x1="46" y1="51" x2="54" y2="51" stroke="#292524" stroke-width="2.5"/>` +
        `<line x1="20" y1="48" x2="30" y2="50" stroke="#292524" stroke-width="2"/>` +
        `<line x1="80" y1="48" x2="70" y2="50" stroke="#292524" stroke-width="2"/>`
      );
    case "sunglasses":
      return (
        `<rect x="27" y="45" width="20" height="12" rx="5" fill="#18181b"/>` +
        `<rect x="53" y="45" width="20" height="12" rx="5" fill="#18181b"/>` +
        `<line x1="47" y1="50" x2="53" y2="50" stroke="#18181b" stroke-width="3"/>` +
        `<line x1="22" y1="49" x2="29" y2="48" stroke="#18181b" stroke-width="3"/>` +
        `<line x1="78" y1="49" x2="71" y2="48" stroke="#18181b" stroke-width="3"/>`
      );
    case "monocle":
      return (
        `<circle cx="62" cy="51" r="8" fill="rgba(0,0,0,0.15)" stroke="#fbbf24" stroke-width="2.5"/>` +
        `<path d="M62 59 v8 q0 8 -10 6" stroke="#fbbf24" stroke-width="1.8" fill="none"/>`
      );
    case "gem":
      return (
        `<path d="M50 26 l7 9 -7 9 -7 -9 z" fill="${accent}" stroke="#fbbf24" stroke-width="1.5"/>` +
        `<circle cx="50" cy="34" r="1.5" fill="#fff" opacity="0.8"/>`
      );
    case "freckles":
      return (
        `<circle cx="34" cy="58" r="1.3" fill="#b45309" opacity="0.55"/>` +
        `<circle cx="39" cy="60" r="1.3" fill="#b45309" opacity="0.55"/>` +
        `<circle cx="35" cy="62" r="1.1" fill="#b45309" opacity="0.5"/>` +
        `<circle cx="66" cy="58" r="1.3" fill="#b45309" opacity="0.55"/>` +
        `<circle cx="61" cy="60" r="1.3" fill="#b45309" opacity="0.55"/>` +
        `<circle cx="65" cy="62" r="1.1" fill="#b45309" opacity="0.5"/>`
      );
    default:
      return "";
  }
}

function hat(c) {
  switch (c.hat) {
    case "crown":
      return (
        `<path d="M28 46 l3 -16 8 8 11 -12 11 12 8 -8 3 16 z" fill="#f59e0b"/>` +
        `<rect x="27" y="43" width="46" height="6" rx="2" fill="#f59e0b"/>` +
        `<circle cx="40" cy="40" r="2" fill="#ec4899"/>` +
        `<circle cx="50" cy="34" r="2" fill="#22d3ee"/>` +
        `<circle cx="60" cy="40" r="2" fill="#a3e635"/>`
      );
    case "cap":
      return (
        `<path d="M22 46 a28 28 0 0 1 56 0 z" fill="#18181b"/>` +
        `<rect x="44" y="20" width="12" height="16" rx="6" fill="#ff2d55"/>` +
        `<rect x="46" y="44" width="28" height="7" rx="3.5" fill="#18181b"/>`
      );
    case "halo":
      return `<ellipse cx="50" cy="21" rx="17" ry="5.5" fill="none" stroke="#fde047" stroke-width="4"/>`;
    case "headphones":
      return (
        `<path d="M22 48 a28 28 0 0 1 56 0" stroke="#e4e4e7" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<rect x="17" y="46" width="10" height="14" rx="4" fill="#ec4899"/>` +
        `<rect x="73" y="46" width="10" height="14" rx="4" fill="#ec4899"/>`
      );
    case "tophat":
      return (
        `<rect x="32" y="16" width="36" height="28" rx="4" fill="#18181b"/>` +
        `<rect x="24" y="42" width="52" height="6" rx="3" fill="#18181b"/>`
      );
    case "beanie": {
      const color = hairOf(c);
      return (
        `<path d="M24 46 a26 26 0 0 1 52 0 z" fill="${color}"/>` +
        `<rect x="22" y="42" width="56" height="6" rx="3" fill="${color}"/>` +
        `<circle cx="50" cy="22" r="5" fill="#fbbf24"/>`
      );
    }
    default:
      return "";
  }
}

function pet(c) {
  const emoji = PETS[c.pet];
  return emoji
    ? `<text x="82" y="26" font-size="17" text-anchor="middle">${emoji}</text>`
    : "";
}

// Devuelve el SVG completo del avatar a partir de su config.
export function renderAvatar(cfg) {
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
    `<circle cx="50" cy="52" r="32" fill="${skin}"/>`,
    eyes(c),
    brows(c),
    mouth(c),
    accessory(c),
    hairFront(c),
    hat(c),
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${parts.join("")}</svg>`;
}