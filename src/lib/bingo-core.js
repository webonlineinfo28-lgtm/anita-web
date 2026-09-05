// ---------------------------------------------------------------------------
// Núcleo puro del Bingo (sin localStorage, sin React): fácil de testear.
// ---------------------------------------------------------------------------

export const LETTERS = ["B", "I", "N", "G", "O"];

const RANGES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export const TOTAL_NUMBERS = 75;

export function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera un cartón: 25 celdas, cada columna dentro de su rango y SIN repetidos,
// el centro (N/2) es el hueco gratis.
export function generateBingoCard() {
  const cols = {};
  for (const letter of LETTERS) {
    const [lo, hi] = RANGES[letter];
    const nums = new Set();
    while (nums.size < 5) nums.add(randomIntInclusive(lo, hi));
    cols[letter] = [...nums].sort((a, b) => a - b);
  }

  const card = [];
  for (let row = 0; row < 5; row++) {
    for (const letter of LETTERS) {
      card.push({
        letter,
        number: cols[letter][row],
        isCenter: letter === "N" && row === 2,
      });
    }
  }
  return card;
}

// Comprueba victorias dado el cartón y los números ya extraídos.
// Devuelve { lines, hasLine, bingo }.
export function checkWin(card, drawnNumbers) {
  const drawn = new Set(drawnNumbers);

  const grid = [];
  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    for (let col = 0; col < 5; col++) {
      const cell = card[row * 5 + col];
      grid[row][col] = Boolean(
        cell && (cell.isCenter || drawn.has(cell.number)),
      );
    }
  }

  const wins = { lines: [], bingo: false, hasLine: false };

  // Líneas horizontales
  for (let row = 0; row < 5; row++) {
    if (grid[row].every(Boolean)) {
      wins.lines.push({ type: "horizontal", index: row });
      wins.hasLine = true;
    }
  }

  // Líneas verticales
  for (let col = 0; col < 5; col++) {
    if (grid.every((row) => row[col])) {
      wins.lines.push({ type: "vertical", index: col });
      wins.hasLine = true;
    }
  }

  // Diagonales
  if (grid.every((row, i) => row[i])) {
    wins.lines.push({ type: "diagonal", index: 1 });
    wins.hasLine = true;
  }
  if (grid.every((row, i) => row[4 - i])) {
    wins.lines.push({ type: "diagonal", index: 2 });
    wins.hasLine = true;
  }

  // Bingo (cartón completo)
  wins.bingo = grid.every((row) => row.every(Boolean));

  return wins;
}

// Números que aún no han salido (1..75).
export function getAvailableNumbers(drawnNumbers) {
  const drawn = new Set(drawnNumbers);
  const nums = [];
  for (let n = 1; n <= TOTAL_NUMBERS; n++) {
    if (!drawn.has(n)) nums.push(n);
  }
  return nums;
}

// Saca la siguiente bola SIN repetir. Devuelve null si ya no quedan.
export function drawNextNumber(drawnNumbers) {
  const available = getAvailableNumbers(drawnNumbers);
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ¿La celda (índice 0..24) pertenece a alguna línea ganadora?
export function isCellInWinningLine(cellIndex, lines) {
  const row = Math.floor(cellIndex / 5);
  const col = cellIndex % 5;
  return lines.some(
    (line) =>
      (line.type === "horizontal" && line.index === row) ||
      (line.type === "vertical" && line.index === col) ||
      (line.type === "diagonal" && line.index === 1 && row === col) ||
      (line.type === "diagonal" && line.index === 2 && row + col === 4),
  );
}