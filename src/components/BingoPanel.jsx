import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Play, Pause, RotateCcw, Sparkles, Star, CircleDot, Grid3X3, Dice1 } from 'lucide-react';
import { isCellInWinningLine } from '../lib/bingo-core.js';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const COLORS = {
  B: 'from-blue-500 to-blue-600',
  I: 'from-purple-500 to-purple-600',
  N: 'from-pink-500 to-pink-600',
  G: 'from-amber-500 to-amber-600',
  O: 'from-emerald-500 to-emerald-600'
};

const BG_COLORS = {
  B: 'bg-blue-500',
  I: 'bg-purple-500',
  N: 'bg-pink-500',
  G: 'bg-amber-500',
  O: 'bg-emerald-500'
};

const LAST_NUMBERS_COUNT = 3;

function LastNumbers({ numbers }) {
  const grouped = useMemo(() => {
    const groups = { B: [], I: [], N: [], G: [], O: [] };
    numbers.forEach(n => {
      if (n <= 15) groups.B.push(n);
      else if (n <= 30) groups.I.push(n);
      else if (n <= 45) groups.N.push(n);
      else if (n <= 60) groups.G.push(n);
      else groups.O.push(n);
    });
    return groups;
  }, [numbers]);

  return (
    <div className="grid grid-cols-5 gap-2">
      {LETTERS.map(l => (
        <div key={l} className="text-center">
          <div className={`mb-1 rounded-lg bg-gradient-to-r ${COLORS[l]} px-2 py-1 text-xs font-black text-white shadow-lg`}>
            {l}
          </div>
          <div className="flex flex-col items-center gap-1">
            {grouped[l].slice(0, LAST_NUMBERS_COUNT).map((n, i) => (
              <motion.span
                key={`${n}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white"
              >
                {n}
              </motion.span>
            ))}
            {grouped[l].length === 0 && <span className="h-6 w-6 rounded-full bg-white/5" />}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardView({ bingo }) {
  const { card, drawnNumbers, generateNewCard, checkWin, isBomboRunning } = bingo;
  const wins = useMemo(() => checkWin(card, drawnNumbers), [card, drawnNumbers, checkWin]);

  if (!Array.isArray(card) || card.length !== 25) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with badges */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {wins.bingo && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1"
            >
              <Crown className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-bold uppercase text-yellow-400">¡BINGO!</span>
            </motion.div>
          )}
          {wins.hasLine && !wins.bingo && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-pink-500/20 px-2 py-1"
            >
              <Star className="h-3 w-3 text-pink-400" />
              <span className="text-[10px] font-bold uppercase text-pink-400">Línea</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-5 gap-2">
        {LETTERS.map(l => (
          <div key={l} className={`rounded-lg bg-gradient-to-r ${COLORS[l]} py-1 text-center text-xs font-black text-white shadow-lg`}>
            {l}
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-5 gap-2">
        {card.map((cell, idx) => {
          const isMarked = cell.isCenter || drawnNumbers.includes(cell.number);
          const inWin = isMarked && isCellInWinningLine(idx, wins.lines || []);

          return (
            <motion.div
              key={`${cell.letter}-${cell.number}-${idx}`}
              initial={isMarked ? { scale: 0.8, opacity: 0 } : false}
              animate={isMarked ? { scale: 1, opacity: 1 } : {}}
              className={`relative aspect-square flex items-center justify-center rounded-xl font-black transition-all ${
                isMarked
                  ? inWin
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : cell.isCenter
                    ? 'bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-500'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <span className="text-xs">{cell.isCenter ? <Star size={10} className="text-zinc-500"/> : cell.number}</span>
              {inWin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-xl border-2 border-yellow-300 animate-pulse"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* New card button */}
      <div className="flex justify-center">
        <button
          onClick={generateNewCard}
          disabled={isBomboRunning}
          className="btn btn-secondary btn-sm disabled:opacity-50"
        >
          Nuevo Cartón
        </button>
      </div>
    </div>
  );
}

function BomboView({ bingo, isAdmin }) {
  const { drawnNumbers, isBomboRunning, toggleBombo, resetGame } = bingo;
  const TOTAL = 75;
  const lastBall = drawnNumbers[0] ?? null;
  const lastLetter = lastBall != null ? LETTERS[Math.min(4, Math.floor((lastBall - 1) / 15))] : null;
  const pct = Math.round((drawnNumbers.length / TOTAL) * 100);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Última bola */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <motion.div
          key={lastBall ?? "empty"}
          initial={lastBall != null ? { scale: 0.4, rotate: -20, opacity: 0 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className={`flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br shadow-xl ${
            lastLetter ? `${COLORS[lastLetter]} shadow-black/50` : "from-zinc-700 to-zinc-800"
          }`}
        >
          {lastBall != null ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                {lastLetter}
              </span>
              <span className="text-4xl font-black text-white drop-shadow-lg">{lastBall}</span>
            </>
          ) : (
            <CircleDot size={36} className="text-zinc-600" />
          )}
        </motion.div>
        {isBomboRunning && (
          <span className="absolute -inset-2 animate-pulse-glow rounded-full border-2 border-pink-500/40" />
        )}
      </div>

      {/* Progreso */}
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span>Bolas cantadas</span>
          <span className="tabular-nums text-zinc-300">
            {drawnNumbers.length}/{TOTAL}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Historial por letra */}
      <LastNumbers numbers={drawnNumbers} />

      {/* Controles (solo host) */}
      {isAdmin ? (
        <div className="flex w-full gap-2">
          <button
            onClick={toggleBombo}
            disabled={drawnNumbers.length >= TOTAL}
            className={`btn btn-sm flex-1 ${isBomboRunning ? "btn-secondary" : "btn-primary"} disabled:opacity-40`}
          >
            {isBomboRunning ? <Pause size={12} /> : <Play size={12} />}
            {isBomboRunning ? "Pausar" : drawnNumbers.length ? "Continuar" : "Iniciar"}
          </button>
          <button onClick={resetGame} className="btn btn-ghost btn-sm" title="Nueva partida">
            <RotateCcw size={12} /> Reiniciar
          </button>
        </div>
      ) : (
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                              {isBomboRunning ? (
            <span className="flex items-center gap-1">
              <Dice1 size={12} /> El bombo está girando…
            </span>
          ) : (
            "Esperando al host…"
          )}
        </p>
      )}
    </div>
  );
}

export default function BingoPanel({ bingo, isAdmin }) {
  const [activeTab, setActiveTab] = useState('bombo');

  return (
    <div className="glass-card p-4 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400 mr-auto">
          <Sparkles className="h-4 w-4 text-pink-500" /> Bingo
        </h2>
        <button
          onClick={() => setActiveTab('bombo')}
          className={`btn btn-sm ${activeTab === 'bombo' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <CircleDot size={12} />
          <span className="hidden sm:inline">Bombo</span>
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`btn btn-sm ${activeTab === 'card' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Grid3X3 size={12} />
          <span className="hidden sm:inline">Cartón</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'bombo' ? (
            <motion.div
              key="bombo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <BomboView bingo={bingo} isAdmin={isAdmin} />
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <CardView bingo={bingo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}



