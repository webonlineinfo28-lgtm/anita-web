// Tests de fama/XP/insignias. Ejecutar con: npm test
import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  BADGES,
  addXp,
  createStats,
  levelProgress,
  recordEvent,
} from "./stats.js";

test("recordEvent suma XP y contadores correctos", () => {
  const s1 = recordEvent(createStats(), "bingo");
  assert.equal(s1.xp, 150);
  assert.equal(s1.bingos, 1);
  const s2 = recordEvent(s1, "line");
  assert.equal(s2.xp, 210);
  assert.equal(s2.lines, 1);
  const s3 = recordEvent(s2, "desconocido");
  assert.deepEqual(s3, s2);
});

test("las insignias se otorgan una sola vez", () => {
  let s = createStats();
  s = recordEvent(s, "bingo"); // badge first-bingo
  assert.ok(s.badges.includes("first-bingo"));
  s = recordEvent(s, "bingo");
  assert.equal(s.badges.filter((b) => b === "first-bingo").length, 1);
});

test("levelFromXp y levelProgress devuelven el nivel y el progreso", () => {
  const p = levelProgress(700);
  assert.equal(p.title, "Farandulero");
  assert.ok(p.pct >= 0 && p.pct <= 100);
  const p2 = levelProgress(99999);
  assert.equal(p2.title, "Leyenda del Festival");
  assert.equal(p2.pct, 100);
});

test("addXp mantiene estadísticas por usuario", () => {
  let map = {};
  map = addXp(map, "Ana", "bingo");
  map = addXp(map, "Ana", "line");
  map = addXp(map, "Bruno", "songAdded");
  assert.equal(map["Ana"].xp, 150 + 60);
  assert.equal(map["Bruno"].songsAdded, 1);
  assert.deepEqual(map["Carlos"], undefined);
});

test("los IDs de insignias son únicos", () => {
  const ids = BADGES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("createStats arranca en cero", () => {
  const s = createStats();
  assert.equal(s.xp, 0);
  assert.deepEqual(s.badges, []);
});
