import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Play, Pause, RotateCcw, Sparkles, Star, Dice1 } from 'lucide-react';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const TOTAL = 75;

const COLORS = {
  B: { bg: 'bg-blue-500', text: 'text-blue-400' },
  I: { bg: 'bg-purple-500', text: 'text-purple-400' },
  N: { bg: 'bg-pink-500', text: 'text-pink-400' },
  G: { bg: 'bg-amber-500', text: 'text-amber-400' },
  O: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
};

function Cell({ cell, marked, isWinning }) {
  const { letter, number, isCenter } = cell;
  const color = COLORS[letter];
  
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black transition-all select-none ${isCenter ? 'bg-pink-500/30 border border-pink-500/40 text-pink-400/60' : marked ? `${color.bg} text-white shadow-lg ${isWinning ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : ''}` : 'bg-white/5 text-zinc-400 border border-white/10'}`}
    >
      {isCenter ? '?' : number}
    </motion.div>
  );
}

export default function BingoPanel({ bingo, isAdmin }) {
  const { card, drawnNumbers, generateNewCard, checkWin, toggleBombo, resetGame, isBomboRunning } = bingo;
  
  const wins = useMemo(() => checkWin(card, drawnNumbers), [card, drawnNumbers, checkWin]);
  const pct = (drawnNumbers.length / TOTAL) * 100;
  
  const markedCount = useMemo(() => {
    const drawn = new Set(drawnNumbers);
    return card.filter(c => c.isCenter || drawn.has(c.number)).length;
  }, [card, drawnNumbers]);
  
  if (!Array.isArray(card) || card.length !== 25) {
    return (
      <div className="glass-card p-4 flex flex-col h-full items-center justify-center gap-4">
        <div className="animate-pulse flex gap-1">{LETTERS.map(l => <div key={l} className={`h-8 w-8 rounded ${COLORS[l].bg}`} />)}</div>
        <p className="text-sm text-zinc-500">Cargando...</p>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-3 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">Bingo</h2>
          <span className="text-[10px] text-zinc-500 tabular-nums">{drawnNumbers.length}/{TOTAL}</span>
        </div>
        <div className="flex gap-2">
          <AnimatePresence>{wins.bingo && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-2.5 py-1 border border-yellow-500/30"><Crown className="h-3.5 w-3.5 text-yellow-400" /><span className="text-[10px] font-black uppercase text-yellow-400">BINGO</span></motion.div>}</AnimatePresence>
          <AnimatePresence>{wins.hasLine && !wins.bingo && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 rounded-full bg-pink-500/20 px-2.5 py-1 border border-pink-500/30"><Star className="h-3.5 w-3.5 text-pink-400" /><span className="text-[10px] font-black uppercase text-pink-400">LINEA</span></motion.div>}</AnimatePresence>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-3 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" /></div>
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{markedCount}/25</p>
          <div className="grid grid-cols-5 gap-1 mb-2">{card.map((cell, i) => <Cell key={i} cell={cell} marked={cell.isCenter || drawnNumbers.includes(cell.number)} isWinning={wins.bingo || (wins.lines && wins.lines.some(l => l.index === Math.floor(i / 5)))} />)}</div>
          <div className="grid grid-cols-5 gap-1">{LETTERS.map((l, i) => <div key={i} className={`h-5 flex items-center justify-center rounded text-[10px] font-black ${COLORS[l].bg} text-white`}>{l}</div>)}</div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Bolas</p>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">{LETTERS.map(l => { const balls = drawnNumbers.filter(n => { if (l === 'B') return n <= 15; if (l === 'I') return n > 15 && n <= 30; if (l === 'N') return n > 30 && n <= 45; if (l === 'G') return n > 45 && n <= 60; return n > 60; }); if (balls.length === 0) return null; return <div key={l} className="flex items-center gap-1.5"><span className={`text-[9px] font-black w-3 ${COLORS[l].text}`}>{l}</span><div className="flex gap-1 flex-wrap">{balls.map((n, i) => <motion.span key={`${n}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`h-5 w-5 flex items-center justify-center rounded text-[9px] font-bold ${COLORS[l].bg} text-white`}>{n}</motion.span>)}</div></div>; })}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
        {isAdmin ? (<><button onClick={toggleBombo} disabled={drawnNumbers.length >= TOTAL} className={`btn btn-sm flex-1 ${isBomboRunning ? 'btn-secondary' : 'btn-primary'}`}>{isBomboRunning ? <Pause size={12} /> : <Play size={12} />}<span>{isBomboRunning ? 'Pausar' : drawnNumbers.length ? 'Continuar' : 'Iniciar'}</span></button><button onClick={generateNewCard} className="btn btn-ghost btn-sm" title="Nuevo carton"><span className="text-xs">Nuevo</span></button><button onClick={resetGame} className="btn btn-ghost btn-sm" title="Reiniciar"><RotateCcw size={12} /></button></>) : (<p className="flex-1 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">{isBomboRunning ? <span className="inline-flex items-center gap-1"><Dice1 size={12} className="animate-pulse" /> Girando</span> : 'Esperando al host'}</p>)}
      </div>
    </div>
  );
}
