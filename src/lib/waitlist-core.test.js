// Tests de la lista de espera. Ejecutar con: npm test
import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  bumpSongsToFront,
  currentDj,
  joinWaitlist,
  leaveWaitlist,
  rotateWaitlist,
} from "./waitlist-core.js";

test("joinWaitlist añade sin duplicados", () => {
  let wl = joinWaitlist([], "Ana");
  wl = joinWaitlist(wl, "Bruno");
  wl = joinWaitlist(wl, "Ana");
  assert.deepEqual(wl, ["Ana", "Bruno"]);
});

test("leaveWaitlist elimina al usuario", () => {
  const wl = leaveWaitlist(["Ana", "Bruno", "Carlos"], "Bruno");
  assert.deepEqual(wl, ["Ana", "Carlos"]);
});

test("rotateWaitlist rota y devuelve el próximo DJ", () => {
  const wl = ["Ana", "Bruno", "Carlos"];
  const [nextList, nextDj] = rotateWaitlist(wl);
  assert.equal(nextDj, "Bruno");
  assert.deepEqual(nextList, ["Bruno", "Carlos", "Ana"]);
  // Lista vacía no revienta.
  assert.deepEqual(rotateWaitlist([]), [[], null]);
});

test("currentDj usa el primero o el fallback", () => {
  assert.equal(currentDj(["Ana", "Bruno"], "Fallo"), "Ana");
  assert.equal(currentDj([], "Fallo"), "Fallo");
  assert.equal(currentDj([], null), null);
});

test("bumpSongsToFront pone las canciones del DJ delante", () => {
  const songs = [
    { id: 1, addedBy: "Ana" },
    { id: 2, addedBy: "Bruno" },
    { id: 3, addedBy: "Ana" },
    { id: 4, addedBy: "Carlos" },
  ];
  const bumped = bumpSongsToFront(songs, "Ana");
  assert.deepEqual(
    bumped.map((s) => s.id),
    [1, 3, 2, 4],
  );
  assert.equal(bumped[0].id, 1); // la canción de Ana queda la primera
});