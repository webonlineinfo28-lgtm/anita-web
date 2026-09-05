// Tests de avatares. Ejecutar con: npm test
import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  AVATAR_PALETTES,
  EYES,
  HAIRS,
  mergeAvatar,
  normalizeAvatar,
  randomAvatar,
  renderAvatar,
} from "./avatars.js";

test("randomAvatar genera un config con claves válidas", () => {
  for (let i = 0; i < 100; i++) {
    const a = randomAvatar();
    assert.ok(Object.keys(AVATAR_PALETTES.skin).includes(a.skin));
    assert.ok(EYES.includes(a.eyes));
    assert.ok(HAIRS.includes(a.hair));
    assert.ok(Object.keys(AVATAR_PALETTES.accent).includes(a.accent));
    const svg = renderAvatar(a);
    assert.ok(svg.startsWith("<svg"));
  }
});

test("normalizeAvatar repara configs corruptos o incompletos", () => {
  const fixed = normalizeAvatar({
    skin: "hacker</svg><script>x</script>",
    hair: "mohawk",
  });
  // La clave mala se sustituye por el defecto (jamás se inyecta).
  assert.equal(fixed.skin, "peach");
  assert.equal(fixed.hair, "mohawk");
  // null/undefined no revientan.
  assert.deepEqual(
    Object.keys(normalizeAvatar(null)).sort(),
    Object.keys(normalizeAvatar(undefined)).sort(),
  );
  assert.equal(normalizeAvatar(null).skin, "peach");
});

test("renderAvatar escapa contenido: ninguna clave maliciosa entra en el SVG", () => {
  const evil = {
    skin: "x\" onerror=\"alert(1)",
    eyes: "round",
    hair: "<b>",
    hairColor: "pink",
    accent: "\"onload",
    outlineColor: "\"",
  };
  const svg = renderAvatar(evil);
  assert.ok(!svg.includes("onerror"));
  assert.ok(!svg.includes("<b>"));
});

test("renderAvatar con un config normal devuelve un SVG cerrado", () => {
  const svg = renderAvatar(randomAvatar());
  assert.ok(svg.endsWith("</svg>"));
  assert.ok(!svg.includes("undefined"));
});

test("mergeAvatar combina override parcial respetando los campos presentes", () => {
  const base = normalizeAvatar({ hair: "spiky" });
  const merged = mergeAvatar(base, { hair: "ponytail", bogus: "x" });
  assert.equal(merged.hair, "ponytail");
  assert.equal(merged.skin, base.skin);
  assert.equal(base.hair, "spiky");
});