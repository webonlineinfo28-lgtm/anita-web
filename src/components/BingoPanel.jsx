import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";

import { isCellInWinningLine } from "../lib/bingo-core.js";

const LETTERS = ["B", "I", "N", "G", "O"];

// El bombo que saca las bolas + aviso de LÍNEA/BINGO.
function Bombo({ bingo, isAdmin }) {
  const { drawnNumbers, isBomboRunning, winStatus, toggleBombo, resetGame } =
    bingo;
  const lastNumber = drawnNumbers[0] || null;

  return (
    <div className="relative flex flex-col items-center rounded-[2.5rem] border border-white/5 bg-black/40 p-6 shadow-xl backdrop-blur-xl">
      {/* Indicador de victoria (dentro del contenedor relative) */}
      <AnimatePresence>
        {winStatus && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute inset-x-6 top-6 z-20"
          >
            <div
              className={`rounded-2xl border p-3 text-center backdrop-blur-md ${
                winStatus.type === "bingo"
                  ? "border-yellow-400/40 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 shadow-lg shadow-yellow-500/10"
                  : "border-pink-400/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {winStatus.type === "bingo" ? (
                  <>
                    <Crown size={18} className="animate-pulse text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                      ¡BINGO! {bingo.user} gana la partida
                    </span>
                    <Crown size={18} className="animate-pulse text-yellow-400" />
                  </>
                ) : (
                  <>
                    <Star size={14} className="animate-pulse text-pink-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                      ¡Línea! {bingo.user} completa una línea
                    </span>
                    <Star size={14} className="animate-pulse text-pink-400" />
                  </>
                )}
              </div>
              {isAdmin && (
                <p className="mt-1 text-[7px] font-bold uppercase tracking-widest text-zinc-400">
                  {winStatus.type === "bingo"
                    ? "Nueva partida en unos segundos..."
                    : "El bombo continuará solo..."}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mb-2 flex flex-col items-center">
        <h2 className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Bombo
        </h2>

        {isAdmin ? (
          <div className="flex gap-3">
            <button
              onClick={toggleBombo}
              title={isBomboRunning ? "Pausar el bombo" : "Arrancar el bombo"}
              className={`rounded-xl p-3 shadow-lg transition-all active:scale-95 ${
                isBomboRunning
                  ? "bg-zinc-800 text-pink-500 shadow-pink-500/20 animate-pulse"
                  : "bg-pink-600 text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500"
              }`}
            >
              {isBomboRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
            </button>
            <button
              onClick={resetGame}
              title="Nueva partida"
              className="rounded-xl border border-white/10 bg-zinc-800/80 p-3 shadow-md backdrop-blur-sm transition-all hover:bg-zinc-700/80 active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3 opacity-40" title="Solo el host controla el bombo">
            <button disabled className="rounded-xl bg-pink-600/30 p-3 text-white/50">
              <PlayCircle size={20} />
            </button>
            <button disabled className="rounded-xl bg-zinc-800/50 p-3 text-white/30">
              <RotateCcw size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Bola con número */}
      <div className="relative z-10 h-24 w-24">
        <div className="absolute inset-2 rounded-full border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black shadow-[0_0_40px_rgba(236,72,153,0.3),inset_0_0_20px_rgba(255,255,255,0.05)]">
          <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-sm" />

          <AnimatePresence mode="wait">
            <motion.div
              key={lastNumber ?? "idle"}
              initial={{ scale: 0, rotate: -180, opacity: 0, y: -20 }}
              animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
              exit={{ scale: 0, rotate: 180, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-full w-full items-center justify-center"
            >
              <motion.span
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
              >
                {lastNumber ?? "··"}
              </motion.span>
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-pink-600/10 blur-md"
          />
        </div>
      </div>

      {/* Indicador de sincronización */}
      <div className="relative z-10 mt-4 mb-2 flex items-center justify-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isBomboRunning ? "bg-green-500 animate-pulse" : "bg-zinc-600"
          }`}
        />
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
          {isBomboRunning ? "Sincronizado" : "En espera"}
        </span>
        {drawnNumbers.length > 0 && (
          <span className="ml-2 text-[8px] font-bold text-zinc-700">
            {drawnNumbers.length}/75
          </span>
        )}
      </div>
    </div>
  );
}

// El cartón del jugador con las marcas en directo.
function BingoCard({ bingo }) {
  const { card, drawnNumbers, generateNewCard, checkWin } = bingo;
  const lineCount = drawnNumbers.length;
  // Comprobación de victoria memoizada (una sola vez por render, no 25 veces).
  const wins = useMemo(
    () => checkWin(card, drawnNumbers),
    [card, drawnNumbers, checkWin],
  );

  if (!Array.isArray(card) || card.length !== 25) return null;

  return (
    <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-3">
        {LETTERS.map((l) => (
          <div
            key={l}
            className="mb-2 select-none text-center text-2xl font-black text-zinc-800"
          >
            {l}
          </div>
        ))}

        {card.map((cell, idx) => {
          const isMarked =
            cell.isCenter || drawnNumbers.includes(cell.number);
          const inWinningLine =
            isMarked && isCellInWinningLine(idx, wins.lines || []);

          return (
            <div
              key={`${cell.letter}-${cell.number}-${idx}`}
              className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border text-lg font-black transition-all ${
                isMarked
                  ? "scale-105 border-white/20 bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg"
                  : "cursor-pointer border-transparent bg-white/5 text-zinc-700 hover:bg-white/10"
              }`}
            >
              {cell.isCenter ? (
                <Trophy
                  size={20}
                  className={isMarked ? "animate-bounce" : ""}
                />
              ) : (
                cell.number
              )}
              {inWinningLine && (
                <div className="absolute -right-1 -top-1">
                  <Star
                    size={12}
                    className="animate-pulse fill-yellow-400 text-yellow-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={generateNewCard}
          disabled={lineCount > 0}
          className={`flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all ${
            lineCount > 0
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-white/10"
          }`}
          title={
            lineCount > 0
              ? "No se puede cambiar el cartón con la partida empezada"
              : "Generar un cartón nuevo"
          }
        >
          <RotateCcw size={12} />
          Nuevo cartón
        </button>
        {lineCount > 0 && (
          <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-700">
            Cartón bloqueado hasta la próxima partida
          </span>
        )}
      </div>
    </div>
  );
}

// Panel completo de la sección de bingo.
export default function BingoPanel({ bingo, isAdmin }) {
  return (
    <section className="flex flex-col gap-6">
      <Bombo bingo={bingo} isAdmin={isAdmin} />
      <BingoCard bingo={bingo} />
    </section>
  );
}