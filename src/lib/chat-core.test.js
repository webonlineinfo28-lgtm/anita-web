// Tests del chat. Ejecutar con: npm test
import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  CHAT_MAX,
  createChatMessage,
  pushMessage,
  sanitizeText,
  systemMessage,
} from "./chat-core.js";

test("sanitizeText limpia, recorta y limita longitud", () => {
  assert.equal(sanitizeText("  hola  mundo\n\n"), "hola mundo");
  assert.equal(sanitizeText("abc".repeat(100)).length <= 240, true);
  assert.equal(sanitizeText(null), "");
});

test("createChatMessage crea mensajes válidos", () => {
  const m = createChatMessage({ user: "  Ana  ", text: " Hola! " });
  assert.equal(m.user, "Ana");
  assert.equal(m.text, "Hola!");
  assert.equal(m.type, "message");
  assert.ok(m.id && m.time);
});

test("systemMessage usa type system", () => {
  const s = systemMessage("Bienvenida");
  assert.equal(s.type, "system");
});

test("pushMessage mantiene el historial en CHAT_MAX", () => {
  let hist = [];
  for (let i = 0; i < CHAT_MAX + 20; i++) {
    hist = pushMessage(hist, createChatMessage({ user: "u", text: `m${i}` }));
  }
  assert.equal(hist.length, CHAT_MAX);
  assert.equal(hist[hist.length - 1].text, `m${CHAT_MAX + 19}`);
});

test("pushMessage ignora mensajes vacíos", () => {
  const hist = [createChatMessage({ user: "a", text: "x" })];
  assert.equal(pushMessage(hist, createChatMessage({ user: "a", text: "  " })).length, 1);
});