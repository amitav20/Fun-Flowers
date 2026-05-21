import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Star, Volume2, Trophy, HelpCircle, RefreshCw } from 'lucide-react';

interface Card {
  id: number;
  uniqueId: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
}

const CARDS_POOL = [
  { emoji: '🐨', color: 'bg-teal-50 border-teal-200' },
  { emoji: '🦁', color: 'bg-orange-50 border-orange-200' },
  { emoji: '🦖', color: 'bg-green-50 border-green-200' },
  { emoji: '🦄', color: 'bg-purple-50 border-purple-200' },
  { emoji: '🐼', color: 'bg-slate-150 border-slate-200' },
  { emoji: '🍉', color: 'bg-rose-50 border-rose-200' },
  { emoji: '🚗', color: 'bg-blue-50 border-blue-200' },
  { emoji: '🚀', color: 'bg-indigo-50 border-indigo-200' },
];

interface GameProps {
  onBack: () => void;
  onGameComplete: (starsEarned: number) => void;
}

export default function MemoryMatchAdventure({ onBack, onGameComplete }: GameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [gridSize, setGridSize] = useState<4 | 8 | 12 | 16>(12); // Easy, Med, Hard, Space Odyssey
  const [isWon, setIsWon] = useState(false);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    initializeBoard();
  }, [gridSize]);

  const initializeBoard = () => {
    // Select number of match pairs
    const numberOfPairs = gridSize / 2;
    const selectedPool = CARDS_POOL.slice(0, numberOfPairs);
    
    // Create dual pairs
    const dualList = [...selectedPool, ...selectedPool];
    
    // Shuffle lists
    const shuffled = dualList
      .map((item, index) => ({
        id: index,
        uniqueId: `${item.emoji}-${index}`,
        emoji: item.emoji,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMovesCount(0);
    setMatchesCount(0);
    setIsWon(false);
    setStars(0);
  };

  const handleCardClick = (clickedIndex: number) => {
    // Prevent actions if already matched, already flipped, or animation is busy
    if (
      cards[clickedIndex].isFlipped || 
      cards[clickedIndex].isMatched || 
      flippedIndices.length >= 2 ||
      isWon
    ) {
      return;
    }

    soundManager.playBubble();
    
    // Flip target card
    const updatedCards = [...cards];
    updatedCards[clickedIndex].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, clickedIndex];
    setFlippedIndices(nextFlipped);

    // If we flipped two cards, check for match pairs!
    if (nextFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;

      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // MATCH FOUND!
        setTimeout(() => {
          soundManager.playCorrect();
          
          const matched = [...cards];
          matched[firstIdx].isMatched = true;
          matched[secondIdx].isMatched = true;
          setCards(matched);
          setFlippedIndices([]);

          const nextMatches = matchesCount + 1;
          setMatchesCount(nextMatches);

          // Star award reward milestones
          if (nextMatches % 2 === 0) {
            setStars((s) => s + 1);
            soundManager.playSparkle();
          }

          // Check Win Trigger
          if (nextMatches === gridSize / 2) {
            handleWin();
          }
        }, 600);
      } else {
        // NO MATCH - flip them back down after a delay
        setTimeout(() => {
          soundManager.playWrong();
          const closed = [...cards];
          closed[firstIdx].isFlipped = false;
          closed[secondIdx].isFlipped = false;
          setCards(closed);
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  const handleWin = () => {
    setIsWon(true);
    soundManager.playSuccess();
  };

  const handleFinish = () => {
    onGameComplete(3); // Save 3 star rewards!
  };

  return (
    <div id="memory-match-game" className="flex flex-col h-full bg-gradient-to-b from-teal-50 via-emerald-50 to-emerald-100 select-none overflow-hidden relative">
      
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-teal-100 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-2xl font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-300 animate-spin-slow" />
          <span className="font-bold text-teal-900 text-sm md:text-base">Stars: {stars}</span>
        </div>

        <div className="font-bold text-teal-800 text-xs md:text-sm bg-teal-200/50 px-3 py-1.5 rounded-2xl">
          Moves / Tries: {movesCount} ✨
        </div>
      </div>

      {/* Main Container Stage */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Game Info Panel */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3.5xl font-black text-teal-900 tracking-tight">
            🐨 Memory Card Flipping Match 🃏
          </h1>
          <p className="text-xs md:text-sm text-teal-600 font-semibold mt-1">
            Flip over matching pairs of lovely animal buddies!
          </p>

          {/* Difficulty select buttons */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => { soundManager.playBubble(); setGridSize(4); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 4 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'bg-white border border-teal-100 text-teal-600 hover:bg-teal-50'
              }`}
            >
              🍃 Easy (4)
            </button>
            <button
              onClick={() => { soundManager.playBubble(); setGridSize(8); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 8 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              ⭐ Medium (8)
            </button>
            <button
              onClick={() => { soundManager.playBubble(); setGridSize(12); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 12 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              🚀 Hard (12)
            </button>
            <button
              onClick={() => { soundManager.playBubble(); setGridSize(16); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 16 
                  ? 'bg-purple-600 text-white shadow-md animate-pulse' 
                  : 'bg-white border border-purple-100 text-purple-600 hover:bg-purple-50'
              }`}
            >
              🌌 Cosmic (16)
            </button>
          </div>
        </div>

        {/* Playable grids of Cards */}
        <div 
          className={`grid gap-3 md:gap-4 my-auto mx-auto max-w-lg ${
            gridSize === 4 
              ? 'grid-cols-2 max-w-[240px]' 
              : gridSize === 8 
              ? 'grid-cols-4 max-w-[380px]' 
              : 'grid-cols-4 max-w-[420px]'
          }`}
        >
          {cards.map((card, index) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <motion.div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="w-20 h-24 md:w-24 md:h-32 perspective cursor-pointer"
                whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Visual Card flipper */}
                <div 
                  className={`w-full h-full position-relative rounded-2xl border-2 border-b-4 duration-300 transition-transform transform ${
                    isRevealed ? 'rotate-y-180 bg-white border-teal-400' : 'bg-gradient-to-tr from-teal-500 to-emerald-500 border-teal-600'
                  } shadow-md flex items-center justify-center`}
                >
                  {isRevealed ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={card.isMatched ? { y: [0, -10, 0], rotate: [0, 8, -8, 0] } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl md:text-5xl select-none"
                    >
                      {card.emoji}
                    </motion.div>
                  ) : (
                    <HelpCircle className="w-8 h-8 text-teal-100 shrink-0 select-none animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Match statistics bottom controls */}
        <div className="mt-6 flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-teal-100 max-w-sm mx-auto w-full">
          <div className="text-left">
            <p className="text-xs text-teal-800 font-bold">Matched Pairs</p>
            <p className="text-xl font-black text-teal-900 tracking-tight">
              {matchesCount} / {gridSize / 2} Matches Done
            </p>
          </div>
          <button
            onClick={initializeBoard}
            className="flex items-center gap-1 bg-teal-100 hover:bg-teal-200 text-teal-800 font-black px-3 py-1.5 rounded-xl text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-40 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-amber-400 shadow-2xl relative"
            >
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-400 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                <Trophy className="w-12 h-12 text-amber-950" />
              </div>

              <h3 className="text-3xl font-black text-slate-950 mt-8 mb-2">
                Memory Champ! 🎉
              </h3>
              <p className="text-gray-600 font-medium mb-6">
                You successfully found all pairs in just <span className="font-bold text-teal-600">{movesCount} tries</span>! You gained <span className="font-bold text-amber-500 text-lg">3 Gold Stars</span>!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all text-lg cursor-pointer"
                >
                  Claim Star Rewards! ⭐
                </button>
                <button
                  onClick={initializeBoard}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Play Dynamic Shuffle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
