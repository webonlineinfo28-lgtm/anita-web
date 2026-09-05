// Tests del núcleo del bingo. Ejecutar con: npm run test
import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  LETTERS,
  checkWin,
  drawNextNumber,
  generateBingoCard,
  getAvailableNumbers,
  isCellInWinningLine,
} from "./bingo-core.js";

test("generateBingoCard crea 25 celdas válidas y únicas", () => {
  const card = generateBingoCard();
  assert.equal(card.length, 25);

  const numbers = card.filter((c) => !c.isCenter).map((c) => c.number);
  assert.equal(new Set(numbers).size, 24, "no debe haber números repetidos");
  assert.ok(numbers.every((n) => n >= 1 && n <= 75));

  // Cada columna debe estar en su rango correcto
  ["B", "I", "N", "G", "O"].forEach((letter) => {
    const range = {
      B: [1, 15],
      I: [16, 30],
      N: [31, 45],
      G: [46, 60],
      O: [61, 75],
    }[letter];
    const colNumbers = card
      .map((cell, i) => ({ cell, i }))
      .filter(({ i }) => i % 5 === LETTERS.indexOf(letter))
      .map(({ cell }) => cell.number);
    assert.ok(
      colNumbers.every((n) => n >= range[0] && n <= range[1]),
      `${letter} fuera de rango`,
    );
  });

  // El centro debe ser el hueco gratis
  const center = card[12];
  assert.equal(center.isCenter, true);
  assert.equal(center.letter, "N");
});

test("centre se considera marcado por defecto (hueco gratis)", () => {
  const card = generateBingoCard();
  const wins = checkWin(card, []);
  assert.equal(wins.hasLine, false);
  assert.equal(wins.bingo, false);

  // Completar la fila central (índices 10,11,12,13,14) marcando 4 números
  // (el centro ya está marcado de gratis).
  const rowNumbers = card.filter((_, i) => Math.floor(i / 5) === 2 && !_.isCenter);
  const winsLine = checkWin(card, rowNumbers.map((c) => c.number));
  assert.equal(winsLine.hasLine, true);
  assert.equal(winsLine.lines.some((l) => l.type === "horizontal" && l.index === 2), true);
});

test("bingo solo se marca con el cartón completo", () => {
  const card = generateBingoCard();
  const allNumbers = card.map((c) => c.number);
  const wins = checkWin(card, allNumbers);
  assert.equal(wins.bingo, true);
  assert.equal(wins.hasLine, true);

  // Quitar un número => ya no hay bingo
  const almost = allNumbers.slice(1);
  const winsAlmost = checkWin(card, almost);
  assert.equal(winsAlmost.bingo, false);
});

test("drawNextNumber nunca repite y agota el bombo", () => {
  const drawn = [];
  for (let i = 0; i < 75; i++) {
    const next = drawNextNumber(drawn);
    assert.notEqual(next, null, `deberían quedar bolas en el turno ${i}`);
    assert.ok(!drawn.includes(next), `nº ${next} ya repetido`);
    drawn.push(next);
  }
  assert.equal(drawNextNumber(drawn), null, "bombo vacío => null");
  assert.equal(new Set(drawn).size, 75);
});

test("getAvailableNumbers devuelve solo los no extraídos", () => {
  const available = getAvailableNumbers([1, 5, 75]);
  assert.equal(available.length, 72);
  assert.ok(!available.includes(1));
  assert.ok(!available.includes(5));
  assert.ok(!available.includes(75));
  assert.ok(available.includes(50));
});

test("isCellInWinningLine detecta cada tipo de línea", () => {
  const lines = [
    { type: "horizontal", index: 3 },
    { type: "vertical", index: 1 },
    { type: "diagonal", index: 1 },
    { type: "diagonal", index: 2 },
  ];
  // horizontal: fila 3 => celdas 15..19
  assert.equal(isCellInWinningLine(16, lines), true);
  // vertical: columna 1 => celdas 1,6,11,16,21
  assert.equal(isCellInWinningLine(21, lines), true);
  // diagonal 1: 0,6,12,18,24
  assert.equal(isCellInWinningLine(18, lines), true);
  // diagonal 2: 4,8,12,16,20
  assert.equal(isCellInWinningLine(8, lines), true);
  // celda ajena a todas las líneas
  assert.equal(isCellInWinningLine(13, lines), false);
});